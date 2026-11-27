# PROGRESS (append-only)

> The log before the last release tag is in `docs/history/`: `PROGRESS-<YYYY-MM>.md` (October) and
> `PROGRESS-<release tag>.md` from November on (ADR-805, ADR-918). Search them; they are not read. The last
> entry before this file: `release-2026-11-20`.

## 2026-11-22 — The map frozen on an iPhone: a lost WebGL context (ADR-1151)

- The user's report: on an iPhone the map stopped scrolling while its names went on. The WebGL context lost (iOS under
  memory pressure) was never handled. Now the game saves and boots again from the save at the same view;
  `contextLost1938.spec.ts` green (chromium). Not reproduced on a device here: the loss is forced with
  `WEBGL_lose_context`.

## 2026-11-22 — Less GPU memory on a phone (ADR-1152)

- The user's decision after ADR-1151: on a touch screen the WebGL map at most at 2 px per CSS px and no kept frame; the
  names at the screen's px. `phoneGpu1938.spec.ts` green (an emulated iPhone at 3 px: map 2, names 3, no kept frame, the
  map on the screen; a desk unchanged); the touch-emulated specs run again: 43 of 49 green; the 6 red (heroes1938, landingMarkMore1938, desk cases among them) red on the commit before too, here (7 there).

## 2026-11-25 — The iPhone fix finished: what was open comes back after a lost context (ADR-1153, branch)

- On branch `fix/iphone-context-keep-view`, not on main. A lost WebGL context now keeps the selected nation, the
  formation's panel, the played nation's selected formations, the top-centre panel and the God tab with the camera.
  Typecheck, lint, `viewAfterLoss.test.ts` 4/4 and the build green. `contextLost1938.spec.ts`'s new test and the six red
  touch specs of 2026-11-22 not run: no browser in the container this was made in.

## 2026-11-26 — No hidden figures at close zoom in the ball look (ADR-1154, branch)

- On branch `fix/iphone-context-keep-view` (pull request 7), not on main. The ball look no longer builds and uploads the
  T3 figures it never draws. Typecheck, lint and the build green; `countryballs1938.spec.ts`'s new check and the
  adapted wait in `heroes1938.spec.ts` not run: no browser in the container.

## 2026-11-26 — The branch's browser specs on the user's PC

- The user ran `contextLost1938`, `countryballs1938`, `heroes1938` and the touch specs (touchMenu, landingsBarPanel,
  phoneLayout, landingMarkMore, traitsTap, relationsTap, phoneGpu) on chromium: 67 of 68 green, the six touch reds of
  2026-11-22 among them. Red: `contextLost1938`'s first test read the camera when the save's tick was on the HUD, before
  the boot had set it (the start view, cx 1024 for 1064): it now waits for the kept view to leave sessionStorage, which
  the boot does in the same task as it sets the camera. Not run again here: no browser.

## 2026-11-26 — The deploy waits on typecheck and lint; the records alone deploy nothing (ADR-1155, branch)

- On branch `ci/gate-deploy-and-slim-checkout`, not on main. `pages.yml`: a typecheck-and-lint job the deploy needs,
  no deploy for a push of Markdown, docs/ or critic/ alone, checkouts without docs/evidence and critic/, the v5 Pages
  actions. PROMPT.md step 9 and ROADMAP.md's rules: the tick in the item's own commit, no hash commit. Typecheck and
  lint green; the build from the sparse tree (63 MB) green here. The workflow itself first runs at the merge.

## 2026-11-26 — Three browser specs wait for the view's state, not for seconds (ADR-1156, branch)

- On branch `test/frame-count-timing`, not on main. `shipMarks1938` and `fightSeen1938` wait for the section of their
  zoom and for rest (`settleAtZoom`), in place of 1.5 s and of "5 s at most, then 400 ms"; `cityNames1938` watches 120
  frames and 100 ticks of the running game in place of four seconds. Typecheck and lint green; the specs not run: no
  browser in the container. Their `knownRed.json` entries stay until a SwiftShader run shows them green.

## 2026-11-26 — The known reds green on SwiftShader on the user's PC; the list emptied (ADR-1156, branch)

- The user ran the 11 files of `tools/gate/knownRed.json` on branch `test/frame-count-timing` with
  `E2E_RENDER=software` (chromium, 4 workers): 22 of 22 green in 8.0 min. `shipMarks1938` at 20 m/px: destroyers 18 px
  (7 ships), cruisers 24.5. `cityNames1938`: 120 frames, 1,388 and 1,349 ticks, no jumps. The list is emptied and
  shipMarks1938's BLOCKERS entry moved to `docs/BLOCKERS_DONE.md`.

## 2026-11-26 — A profile of release-2026-11-20; Batch 60 filed (the user's decision)

- The user asked what could be faster, compromises allowed. Measured on `bc9fa5ed` (i7-13700KF, RTX 4070 Ti), the
  release's commit: this checkout was nine commits behind `main` (to `d547cda1`), none of them in `src/sim`,
  `src/worker` or `src/shared`, and the batch is rebased onto them. Seed 99 × 25 years by system (the sim's
  `--profile`, on 0xFFFF): mean 1.75 ms a tick, year 1 2.77, the quietest 0.93, year 19 (at peace) 2.66 with
  `strategicAi` 2.10. In an esbuild bundle, as the game is built (tsx read 2.30 ms for its 1.97 over three years, one
  pair), the first five years: the AI's layers about a third (operational 15 %, strategic 7, air 5, economic 4,
  invasion 3), combat 15, air 10, supply 10, movement 9, territory 6; year 1 by function: none over 6 %.
- Max in the page (`maxStalls 99 - 2`): 290 and 363 ticks a second in years 1 and 2, about 70 % of the bundle's own; a
  trial with the worker's next slice by a message, each build twice: 30.2 → 25.2 s and 24.2 → 20.2 s, 60 fps kept.
- Trials in a scratch worktree, two years, arms at once: no fire records −3.3 % (combat −22 %, the same hash); the
  operational AI's turn every second day, `operationalAi` 0.39 → 0.22 ms (another world); each element firing every
  second or third hour, within a diverged world's noise (±3 %). The S map slower than M (2.63 against 2.31 ms,
  `farPoint` 28 % of S). The month's first hour 92 to 109 ms (`tickMax` on year 2: economicAi about 50, economy 30).
- Filed as Batch 60 (R225 to R228): the four that change no rule. The compromises (the army AI's cadence, the month's
  accounts by nation, fewer formations, render settings for weak machines) are the user's to choose and are not filed.

## 2026-11-26 — R225: a massing's refused formations are not searched for again every day

- Seed 99's year 19 (at peace, five nations massing most of the year): `strategicAi` 2.13 → 0.56 ms a tick, the tick
  2.9 → 1.3, the same hash (`2cbef30d`); three-nation worlds' hashes the same. Two causes: R224's second ask replaced
  the one refused cell the memo kept (now each is kept), and a formation on the march keeps no memo, 3,442 of the
  year's 5,743 searches (now refused from a region another's search walked that day, `keepRegions`).
- Left in that year's `strategicAi`: the routes found (1,421 orders), each region's first refusal, and `massPoints`,
  `homeByLand` and `borderOnLands` (about 0.2 ms together). `npm run check` green on the rebased tree.

## 2026-11-26 — R226: at Max the worker's next slice comes by a message, not a timer (ADR-1157)

- `maxStalls 99 - 2`, each build twice: year 1 31.2 → 25.2 s, year 2 24.1 → 20.1 s (347 and 435 ticks a second for 280
  and 363), 60 fps kept. `maxLoop1938.spec.ts` (new) 16 of 16 under eight workers; the whole browser suite on the GPU
  551 of 551 (11.6 min), run by hand: the worker's entry is under every spec, and the gate runs only changed specs.
- The spec's first form held the pause to 250 ms of the wall and was red once in eight under eight workers (357 ms, with
  3 ticks run); it now counts ticks and frames, as ADR-1156 has it.

## 2026-11-26 — The gate's test of the known reds takes the emptied list

- `gateReview.test.ts` asked for a list of known reds longer than none; `d547cda1` emptied it (ADR-1156), so the unit
  suite run in full was red on `main` from then (found by R227's gate, the first to run it in full: a change of
  `tests/helpers/aiSweep.ts`). It now asks for a list, and of each entry what it asked before.

## 2026-11-26 — R229: `settleAtZoom` asks again for the section of a camera at rest

- R227's run of the whole browser suite read 549 of 551: `relationsTap1938`'s footer test timed out at its boot under
  eight workers (green alone, as at the release) and `fightSeen1938`'s Japan case timed out in `settleAtZoom`, alone
  too. Not R227's: 3 of 3 red on the commit before it, 1 of 3 on `d547cda1`, the remote's head before this batch. The
  trace: the camera at rest at 20 m/px, the section taken at 19.7, the subscription's key the one last asked with.
  The helper now sends the view's subscription again in that state. `fightSeen1938` × 5: 10 of 10.

## 2026-11-26 — R227: the sim makes a fire record only while a reader wants it (ADR-1158)

- Combat −22 % and the tick about −3 % in seed 99's first two years with no view drawing elements (the hash the same);
  the records with a reader the same as before, number for number, in three windows with land, naval and bombardment
  fire. The switch is the reader's (`FireLog.wanted`); `npm run sim`, the sweeps, the soak and the replay's build run
  with it off, so their tick is the world-zoom page's.
- The AT asked for the comparison with HEAD's records as a unit test; kept as a one-off read (a hash of records in a
  test is a second pin that every combat rule would move), and the kept test holds a reader against none.
- The whole browser suite on the GPU: by hand 549 of 551 (R229's case, and `relationsTap1938`'s boot under eight
  workers); in the gate's run with R229 550 of 551, `relationsTap1938` green alone, as at the release.

## 2026-11-26 — R228: the S map's water points are kept, and the mask's search is cheaper

- Three years of seed 99 at S: 2.5 → 1.57 ms a tick, the same hash; S was slower than M (2.63 against 2.31 at the
  profile) and is a quarter under it. M itself 2 to 3 % less. `World.seaPoint` keeps a coastal cell's point as
  `cellPoint` keeps the land's; `farPoint` no longer reads the mask through `maskBit` for every pair of pixels.
- A mask is shared by the worlds made on it and `addIslet` writes to it: it counts its changes now (`version`), and
  the kept water points go with a change. `cellPoint`'s kept land points are as they were (no such guard; not touched).
- The first gate run on it ended green with `worldTemplate.test.ts` never run: its worker ran out of memory comparing
  the new kept points (they hold the mask) as a field outside the state. Mended in the test's list of derived fields;
  the gate's blind spot for a crashed file is filed as R230, open. The second run: every file, no crash.
- Batch 60's four items and R229 are done; R230 is open. The critic and a release when the user wants one (ADR-1139).

## 2026-11-26 — R227 corrected: the sweeps' runner keeps its fire records

- R227 as committed (`0f79149f`) switched the records off in `tests/helpers/aiSweep.ts` with the other headless loops.
  That runner's `fleetsStand` reads the hour's volleys (a sea battle that begins and ends in one hour names its ships
  only there), and without them `aiSweep3` was red: seed 3, day 96, two fleets "no rule should have touched". `main`
  was so from R227's push until this one; the gate did not see it (of `tests/sweep/` it runs the pin alone), and a
  review of the batch did. The line is out; ADR-1158 and R227's tick say so. The other three loops only empty the
  records (the runner, the soak, the replay's build): checked again.
- With it out: `aiSweep1` to `3` green, and the ten-year suite whole (`npm run test:sweep`): 23 files, 29 tests, on
  the batch's code. That suite had not been run on R225, R227 or R228 before (the gate's pin alone).

## 2026-11-27 — R230: the gate counts a unit file whose worker was lost, and a browser test that did not run (ADR-1159)

- Fixtures first (vitest 5.0.3, Playwright 1.63; a worker that aborts or kills itself in a test, in a hook, as the
  file loads, in the setup file before it). vitest reports the lost file as passed, its tests 'pending' or none, and the error apart from every
  file. Playwright fails the test that was running and runs the rest in another worker; only a worker that goes as it
  loads the file leaves tests that "did not run", read `ok`. The gate reads both as red in their run and runs the file
  again alone. A file red as a whole takes every red of that run: the old `again` kept only an id red in both runs,
  so a lost file whose test fails alone would have ended green one step later.
- `gateReview.test.ts`: five new tests, two of them the stages themselves on a fixture written under `.cache/gate`
  (`unitRedTwice` and `e2eRedTwice`, given the fixture's config and report). On HEAD's reading all five are red, and
  the unit stage on the fixture names no red at all, as on 2026-11-26; on the change the file is green (14 tests, 30 s
  alone under the browser suite's load: nine runs of vitest and Playwright inside it).
- False alarms were looked for on whole runs, since for this change the gate runs the gate's own tests only: the unit
  suite's report before the change and on it (510 files, 2,644 and 2,649 tests: no test 'pending', no file without
  tests; `snapshot-perf` red by name in each, as under the suite's load before) and the browser suite's on the GPU (551
  tests: none skipped, none not run). In the whole unit suite the two fixture tests take 41 s each (300 s allowed).
  The perf project's report and the pin's under the sweep config (one test each) read clean too; the other ten-year
  tests' report, which `npm run check:review` reads with the same code, was not run for this.
- Not seen yet: the fixture tests on Linux. The nightly run's unit stage is their first run there.
- That browser run found a fault in the new test itself: 28 of its tests failed with their traces gone. A Playwright
  config with no output folder takes `test-results` beside the nearest package.json, the suite's own, and empties it
  as it starts; my fixture did so twice while the suite was writing there. The fixture has its own folder now and
  the test checks that it was used. Run again with the test twice beside it: 550 of 551, `test-results` untouched.
- The one red of that run is `relationsTap1938`'s first test, green alone (14 of 14): after its pinch no node is
  found to tap. The same in the first run and in the gate's run of 2026-11-26, where R227's and R229's ticks called
  it the boot's timeout (that was the by-hand run before; the ticks are corrected). Filed as R232.
- One thing changes that was red before: a run that lost a file and named nothing else failed as it stood; it is now
  judged by the file's run alone, as the AT asked. A file that runs out of memory by what it does fails alone too.
- Found beside it and filed, not done (R231): an unhandled rejection that loses no file, beside a red test that passes
  alone, still ends green. vitest's JSON report has no trace of it.

## 2026-11-27 — R231: the gate reads the errors vitest caught outside the tests (ADR-1160)

- Read in vitest's code (5.0.3): a run's unhandled errors go to its reporters at the run's end, and the JSON reporter
  takes the test files alone. So a reporter of the gate's own beside it (`tools/gate/vitestErrors.ts`, given on the
  command line as the other two are), which writes them to a file beside the report. The gate names that file for
  each run (`GATE_VITEST_ERRORS`): a fixture's run inside the gate's own unit run would otherwise inherit the name
  and write over the gate's.
- Probes first, one run a case on a scratch fixture. An Error rejected or thrown while a file's worker runs comes
  with the file's path; a rejection of a string with none; a lost worker's error is the pool's and names its file
  only in its cause's last words. `process.exit` in a test fails the test by name; a timer that throws after the
  file's last test, and a worker killed after it, leave no error (exit 0).
- One more probe, of what R230 could not see: a worker that goes as it starts (a node flag it does not know). Two
  errors with no file in them, and a report with neither file in it: no test, no file. Beside a red that passes alone
  the gate would have ended green there too. So an error with no file is the run's own red (`stage:test`) and no run
  alone clears it; one with a file is that file's red as a whole, judged by its run alone (`errorRed`).
- `gateReview.test.ts`: three new tests (the shapes; the unit stage on two fixtures) and the command's. Red on HEAD's
  reader: both fixture runs come back with nothing red. The fixtures now leave a mark when a file is run again,
  R230's too: "run again and clean" read the same as "never noticed" before. R230's fixture expects what it did,
  which holds the pool's wording (no `stage:test`).
- The first version of the change moved the hole one run later, found in review before the push. A test red by its
  name whose run alone passed it and left an error was cleared: that run now named `(the file)`, which the test's
  own id is not, where before the change it named nothing, was its own failure, and kept the test red. `again` now
  holds a run alone in which the file is red as a whole to have cleared nothing. Stricter by it in two cases that
  were green: a worker lost in the run alone, a file that does not load there. A shape and a fourth file of the
  fixture hold it, both red on the first version (18 of 18 on the change, 22 s alone).
- Beside the tests, since this change's own gate runs the gate's tests alone (run before the rule of the run alone
  and the fixture's fourth file, which change the gate's own tests and no other run's reading):
  - the whole unit suite with the reporter: 510 files, 2,652 tests, no error recorded, no file red as a whole. Two
    tests red by name: `snapshot-perf` (the timing test, as before) and `specRefs` §10, on my own SPEC line: the
    checker reads git's index, and the new file was not in it yet. Green once added. The gate would not have run
    that test for this change (no import reaches SPEC.md);
  - the pin under the sweep config: one test, no error recorded;
  - a related run that reaches no test (`CHANGELOG.md`): both files written, nothing red. A later commit of
    documents and code no test reaches takes that path;
  - a change of the reporter alone reaches the gate's tests (2 files, 31 tests): `review.ts` imports the variable's
    name from it.
- In that whole run `gateReview.test.ts` took 130 s of a worker's time (85 s before): its four fixture tests 47, 38,
  15 and 29 s, 300 s allowed each. The fourth file adds one run alone to the second of them.
- Looser in one case, as the AT has it: a run whose one fault was such an error was red as it stood, and is now
  judged by the file's run alone. Stricter in one: an error with no file is red with a red named beside it or not.
- Not seen: Linux (the nightly run's unit stage is the first run there), and the ten-year suite's whole report, which
  `npm run check:review` reads with the same code.
- Filed from the whole run's second red: R233, a change of SPEC.md runs no test of it (`specRefs` is reached by no
  import; it has let a stale name through before, R94a's, red in the nightly run of 2026-11-16).

## 2026-11-27 — R232: relationsTap1938's first test waits for the year's statistics before it opens the graph

- Reproduced without the suite: the test eight times at once (`--repeat-each=8 --workers=8`, on the GPU): 6 red of 8,
  each at line 74 with no nation to tap after the pinch, as in the suite's runs.
- From the six red runs' traces (their DOM snapshots, read by a scratch parser) against a green run's alone: the view
  is the same at every step (after the drag; after the pinch 309.9 392.1 106.7×150.0 at zoom 6.00), so the gestures
  are not the cause. The graph has the same 73 nations, 6 wars and 114 lines; its places differ from the first
  snapshot of the graph on, and do not move again within a run, the selections included. After the pinch the red
  runs have two nations wholly in view, each within the 30 px the test keeps from the graph's edge (9 units of the
  drawing at that zoom, by the graph's box of 355 × 500 px: n27 3 units inside it at the right, n80 7 at the
  bottom); the green run has n1 and n7 near the middle.
- Why the places differ is not in a trace. From a scratch copy of the test that logs the worker's statistics and the
  graph's places (a config of its own, its own output folder): alone the year's statistics come 113 ms after the
  picture's tick and the graph opens at 304 ms. Eight at once, four runs opened the graph on the statistics of tick 0
  (65 nodes) and had the year's 28 to 39 ms later, which moved the graph on from the start's places (73 nodes): no
  nation to tap in each. The other four opened on the year's and found n7. The order forced on a quiet machine with
  one worker (Relations opened first, the year stepped after): the same places, and no nation.
- Read in the code: the statistics trail the step's reply by a turn of the worker's timer. `maybeStats` in `handle`
  is given the time the step arrived, a tenth of a second after the start's statistics and inside their throttle of
  a second, so the pump sends them. `step` has no caller in `src` outside the worker: no player meets it, and the
  worker is left as it is.
- The spec now waits for the statistics of the tick it stepped to, as `relations1938.spec.ts` does. Its gestures, its
  picks and what it expects are as they were: it sees the layout of its green runs every time.
- Eight at once again: 8 of 8. With the whole browser suite beside it (the suite at its 8 workers, the test 20 times
  at 4 more, started 33 s after it; a preview server of the run's own, the 20 in their own output folder): 20 of 20,
  each 47 to 59 s, the last done seven minutes before the suite was. The suite's own copy of the test ran after the
  20 were done, at the suite's own load: green in 42 s, the spec's 14 tests all green. The suite itself (12.1 min,
  twelve pages at once for the 4.6 min of the 20): 550 of 551; `heroes1938.spec.ts:169` ran in that stretch (from
  266 s to 326 s of the suite, the 20 from 30 s to 308 s), timed out a 60 s wait, and is green alone (50 s). None of
  the suite's traces was lost (no ENOENT in its log).
- By hand: `npx playwright test tests/e2e/relationsTap1938.spec.ts:24 --project=chromium --repeat-each=8 --workers=8`
  before and after; the same with `--repeat-each=20 --workers=4 --output=<a folder of its own>` beside
  `npx playwright test --project=chromium --project=swiftshader`; `tests/e2e/heroes1938.spec.ts:169` alone.
- The same wait is missing in two specs that are green, `relationsLabels1938` and `relationsNamed1938`: filed as
  R234, not changed here.

## 2026-11-27 — R233: the gate runs the test of what SPEC.md cites whenever a change can break a line (ADR-1161)

- `specRefs.test.ts` reads two things from the disk that no import reaches: SPEC.md, and the tree (its files' names,
  the code's words). The item named the first; the second is the same hole from the other side (a file renamed or
  a name removed that a line cites), so the rule is one: the test joins the unit stage for SPEC.md, for anything
  that is not a document, and for a document that is gone (SPEC.md cites a few by their path, `docs/PARITY.md`
  among them). A document edited or added can break no line and runs nothing, as before.
- The planner: `planGate` gives a change of documents alone the unit stage when one of them can break a line;
  `planUnit` adds the test to the related files, and it is the stage alone when no source changed (a spec, a
  workflow, a page ran no unit stage before). The test's path is a constant the gate's test checks on the disk:
  the related run passes with no tests, and a renamed test would have gone green in silence.
- The checker's tree is the working tree: `git ls-files --cached --others --exclude-standard` less `--deleted`,
  where it read the index. R231's line was red until its new file was added; a file removed and not staged counted.
- Tests first, four red on HEAD: the plan's cases in `gate.test.ts` (three), and in `specRefs.test.ts` a scratch
  repository with a file added, one made after, one ignored and one added and removed. 27 of 27 on the change.
- Through `npm run check` for real (the code committed first, so that each tree had one change):
  - SPEC.md citing `tools/gate/noSuchFileR233.ts`: `gate: test`, the test red in the run and again alone ("2391: …
    (no such file)"), `gate: FAILED at test`, `green.json` untouched;
  - that file made and not added: typecheck → lint → test → build, the related run naming the file and the test,
    12 of 12, green;
  - both taken back, a blank line on CHANGELOG.md: "no code changed", nothing runs;
  - `docs/PARITY.md` moved away, nothing else changed: `test` alone, red ("41: docs/PARITY.md (no such file)").
- The test's file takes 2.03 s where it took 1.63: one more test, and the two listings (0.13 and 0.27 s).
- It amends two rules of the gate's size, one of them the user's (ADR-280: by imports): said in ADR-1161.

## 2026-11-27 — R234: relationsLabels1938 and relationsNamed1938 wait for the year's statistics too

- The same three lines as R232's test: step a year, wait for the picture's tick, open Relations. Read by copies of
  the two specs with a log (the statistics' tick at the click; a digest of the nodes' places once the labels are
  drawn and 1.5 s later), run by a config of their own with its own output folder.
- With the wait: 28 runs (20 eight at once, 8 two at once), the year's statistics in at every click, and each test
  the same places in every run.
- On HEAD, eight at once (the labels' two tests four times, the names' six twice): 20 of 20 green, and 12 of the 20
  had other places than their test has with the wait, in 6 of the 8 tests; two tests had both layouts among their
  runs. Those 12 are told by their places alone: the tick logged at the click was the start's in all 20 (it is read
  as soon as the picture's tick is in, before the click lands), so it does not say which runs' graphs opened ahead
  of the year's statistics. That this is what gives the other places is R232's finding (its order forced, alone).
- So these specs were not red by the race: what they hold (no two labels overlapping, each 10 px high, every nation
  at war or allied named, each truce its own line) held in either layout. Which layout a run judged was the race's.
- In none of the 48 logged runs did the places move between the two reads (the labels drawn; 1.5 s later).
- By hand: `npx playwright test tests/e2e/relationsLabels1938.spec.ts --project=chromium --repeat-each=4 --workers=8`
  (8 of 8) and `tests/e2e/relationsNamed1938.spec.ts` with `--repeat-each=2` (12 of 12).
- What the specs no longer see: the layout of a graph that was open while the world moved on (laid out on older
  ties, then given 40 steps a message). That is the graph a player with Relations open has, and no spec holds its
  labels now but by chance before. Not filed: no red was seen in it (12 runs of it green here).

## 2026-11-27 — R235: a march is an advance only onto land that can be taken today (ADR-1162; the user's report)

- The user sent two pictures of the replay's 23 November 1939 at Strasbourg, far and close: "I think the arrows are
  misleading here". Reproduced by a scratch run of the built game (the replay, seed 1938, stepped 691 days; the
  camera on Infantry division 723): the same divisions by name at both zooms, the same arrows.
- What each arrow stood for, from the view's own list at 1,000, 400, 150 and 60 m/px. The five German divisions
  (23, 573, 719, 723, 913) are in one cell on the Rhine, each ordered 4 to 7 cells along its own front, to a cell
  Germany holds, on a line that clips French land: a bold arrow each, over the river. The far picture's blue arrow
  into Germany is one French mountain division (244), ordered to a cell 63 east and 41 north that Germany holds.
- Followed for three weeks: none of the five moves. Of that day's 153 advances (Germany 24, France 25, the United
  Kingdom 9; Japan 27, China 54, Manchukuo 12, Mengjiang 2) 147 formations are in the same cell 21 days on, 145 with
  the same order. The track holds both fronts (R62f2): no land is taken across them, and a march waits for the land
  ahead to be taken (PLAN 1.14). The arrows said "advance" where none can be; the orders themselves are R236.
- The fix is where the judgement is made. The view knew who is at war, not where the track holds: the worker now
  says which marches are advances (`FormationFlag.advancing`), by the same rule on the same lines, asking of the
  land one thing more: may the marcher take it there today (`World.holdsLand`, by cell). By the two nations alone
  (`holdsPlan`) it is wrong in the days of a stage: the replay's 5 April 1940, four days before Germany's stage in
  Southern Norway, run with that question, has 84 advances back in the West (Germany 53, France 28, the United
  Kingdom 3) and the browser spec red; by the cell, none. (I first wrote this of Poland in September 1939, wrongly:
  that is a war the track holds no front of, with no stage. Found in review before the push.)
- Before and after, the formations on an advance by id, from the built game: a free game (seed 99, days 120, 240,
  365) 90, 25, 73 and the same ids; the replay on 4 September 1939 112 → 17 (Germany 7, Poland 10, none in the
  West), on 23 November 1939 153 → 0, on 14 May 1940 186 → 92 (87 in the West: the Low Countries, the Rhine and
  France's east by a box of cells).
- Tests: the rule's case in `moveArrows.test.ts` (23 of 23); `advancing1938h.test.ts` on a timeline of its own (a held
  front with a stage; 2 tests, 6 s); `arrowsHeld1938h.spec.ts` on four days of the replay at three zooms (56 s),
  its pictures in `docs/evidence/R235/` and looked at: no arrow at Strasbourg far or close; the West's arrows on 14
  May 1940. `orderLines1938.spec.ts` by hand: 2 of 2.
- What it costs a snapshot: 0.06 ms at the median, 0.16 at the 95th (seed 99 a year on: 999 formations, 509 on the
  march, 8 wars, 73 advances; 300 calls), of a budget of 2. The view judged the same on every snapshot before.
  `snapshot-perf`'s world has no war and does not measure it.
- The gate: `src/shared` is one of the sim's inputs, so every test's saved world was made again in its unit run (422
  files). Nine of them were red in that run, by tests past their 90 s and by `snapshot-perf`'s budget under the load,
  and each green alone. The pin of seed 99 is unchanged.
- Still there, and told to the user: with France looked at, its orders across the front are faint arrows (R89b
  draws a looked-at nation's marches); and at the world's zoom arrows lie under the counters, two of a nation
  reversed on one line. Not changed unasked.
- The nightly run of 2026-11-27 (45996417446, on `0af83759`) is green, its unit stage on Linux too: the first run
  there of R230's and R231's fixture tests (`gateReview.test.ts`, 18 tests in 19.8 s). Its first run had two reds
  by name, `scenario1938` (green alone) and `snapshot-perf` (on the runner's list): `ci unit: green`.

## 2026-11-27 — R237: a question between two ticks no longer changes the replay's course

- Found while measuring R236. Two probes ran the replay under one rule to 23 November 1939 and stood on different
  hashes: one stepped straight there, the other a day at a time, asking `World.holdsPlan` of the waiting marches.
- Narrowed on the scenario's own seed, six ways to that day: one step; a day a step; and a day a step with one
  thing asked between: `holdsPlan` once, `holdsLand` once, `waitsForFront` of every formation, the hash. All stand
  on the plain run's hash every marked day but the two that ask of a hold: the plain run's to day 620, another
  from day 650 (HEAD: 1a5c4ff4 on day 691 plain, f752c64b with `holdsLand` asked).
- The cause. `Track.openStages` keeps an hour's open stages by the tick's number, made at the first asking: of the
  events applied by then (`next`) and of the men in each stage's area (`outnumbered`, ADR-977). `step` raises the
  tick's number at its end, so a question between two ticks is asked under the coming hour's number, before that
  hour's commands and events, and its list is the one the hour's systems find. At a stage's own hour the stage is
  still in it: combat, the planners and the territory system treat its land as open an hour more.
- Who asks between ticks: in `src`, the worker alone, since R235 (`advancing` asks `holdsLand` of each cell a
  march's line crosses, at every picture). So I4 (SPEC §2.6: what a view asks leaves the hash unchanged) was
  broken for a world with a track, on `main` since R235's push this morning: the replay a player watched went by
  when its pictures were made. Read on the replay itself through the worker's server, a picture of the whole
  world once a day: another hash than the plain run's by day 300 (279a6586 for 1dce0bc2), 58a39e70 on day 691.
  A free game has no track and asks nothing of it.
- The fix: `step` begins by telling the track (`Track.tickBegins`), which forgets the list; the hour's list is of
  the hour's own first asking, as in a run where nobody asks between. After: the plain run's hash on every marked
  day by each of the ways above and through the worker's server (691 pictures), and the plain run's own hashes
  as before, to 26 July 1953 (twelve marks, a plain run of HEAD beside one of the fix).
- A second change was tried with it and taken out: the list kept by the events applied too (made again after each
  event of an hour). That is not this item: it changes the plain replay from 1944 on (the same hash on 1 January
  1944, another on 1 January 1945), since an arrival of the timeline's asks while its hour's events are applied
  (`forces`, R82b). Filed as R238 with what it measured.
- Tests: `trackAsked1938h.test.ts` on a timeline of its own (Germany and Poland held, a stage on 15 January 1938).
  Two tests of the mechanism, red before: asked before the tick of the stage's hour and again by a system in that
  tick (the hold must stand on the land the stage has just given); asked in the stage's days, then by a system
  after another has left Germany a man a formation (the stage must be shut by the men of the hour). Four of I4 on
  two seeds: the three questions of a hold after every tick, and the worker's picture after every tick (384
  pictures, each asking), against a plain run, day by day. Those four are green before too: in that small world no
  list kept from a question changed an outcome. `server.test.ts` holds I4 on the toy world, which has no track.
- The plain run is what the ten-year tests run, and their figures are the nightly run's (2026-11-27, on `0af83759`):
  ten files, 11 tests; `historyMatch1938h`'s 44 map lines to the digit, Paris Germany's from 10 June 1940, 936
  French cells on 22 June, 10,734 Soviet cells after 1 December 1941, the Soviet army 3,396k; the China front 15.2 %,
  809k, 381k and 59.4 % without the hold; the ten free worlds' days to a first war the same ten.
- By hand, the browser specs that run the replay: `arrowsHeld1938h`, `replayYear1938h`, `scenario1938h` and
  `trackView1938h`, 14 of 14. The arrows spec prints what it printed at R235 (17 advances on 4 September 1939,
  none on 5 April 1940, 92 on 14 May, 87 of them in the West).
- No ADR (ADR-914): I4 is SPEC §2.6's, and the fix states no new rule. It stands on ADR-974 (a stage's days),
  ADR-977 (`outnumbered`) and ADR-1162 (the worker's question), whose tests are green before and after:
  `trackFight1938h`, `advancing1938h`, `moveArrows.test.ts`.
- The gate: the sim changed, so every test's saved world was made again in its unit run (436 files). One red in
  that run, `snapshot-perf` past its 90 s under the load, green alone (46 s). The pin of seed 99 is unchanged.

## 2026-11-27 — R238: an hour's open stages are made again after each of its events

- Found by R237: its first fix also kept the list by the events applied, and with that the plain replay went
  another way from 1944 on. Taken out there, done here on its own, since it changes the replay.
- The cause. An hour's list of open stages is made at the hour's first asking and kept for the hour. One event
  asks while it is applied: an arrival on land an enemy holds whose owner is at peace with the arrival's nation
  (`forces`, R82b: whether the cell is the land of a stage open for its side; the Allies in Vichy's Normandy). So
  the hour's list was of the events and the men up to that arrival. A stage applied after it in that hour stayed
  open for the hour; the arrivals after it were not counted when the track judged whether the stage's taker was far
  outnumbered (ADR-977).
- The fix: `applyDue` tells the track after each event (`Track.eventApplied`), which forgets the list, as `step`
  does when a tick begins. The other form tried in R237 (the list kept by the count of events applied) gives the
  same replay: the same hashes on twelve marks to 26 July 1953.
- Where the replay parts: a plain run of R237's code beside one of this, the hash each day of 1944: the same to
  5 June, another from 6 June. That is the hour of the D-Day arrivals: several `forces` events in one hour, the
  first of them asking before the others had landed.
- What it moves, by the ten-year tests on this code (ten files, 11 tests, green): nothing they print but one
  figure. `historyMatch1938h`'s 44 map lines to the digit, Paris from 10 June 1940, 936 French cells, 10,734
  Soviet cells, the Soviet army 3,396k; the China front as before; of the ten free worlds after 1953, the ninth
  seed's first war 16 days after the end where it was 17. No `WARNING historyTrack` line.
- Tests: `trackHourEvents1938h.test.ts`, two tests on timelines of their own, red before for the reasons named:
  "the hold stands on the land the stage gave, in the hour it gave it" (false before), and "its days are open by
  the men of the hour" (shut before). In both, Warsaw's cell is made a third nation's land held by Poland, so the
  German arrival there asks as Normandy's did; each test checks that it did ask while the events were applied.
- By hand, the browser specs that run the replay (`arrowsHeld1938h`, `replayYear1938h`, `scenario1938h`,
  `trackView1938h`): 14 of 14.
- No ADR (ADR-914): ADR-974 opens a stage's days "before an `occupy` stage not yet applied", and ADR-977 counts
  the men "this hour"; the code now does both within the hour of several events.
- The gate: the sim changed, so every test's saved world was made again in its unit run (437 files). Two red in
  that run by tests past their 90 s under the load (`scenario1938`, `snapshot-perf`), each green alone. The pin of
  seed 99 is unchanged.

## 2026-11-27 — R236: no way over the land of a foe whose front the historical track holds (ADR-1163)

- The cause, by a run (the replay on its own seed, the rule as it was): on 23 November 1939, 269 land marches, 155
  of them waiting at a front, the land ahead of all 155 held (Germany's 23, France's 25, the United Kingdom's 8,
  Japan's 28, China's 57, Manchukuo's 12, Mengjiang's 2). 21 days on, 149 are in the same cell with the same order,
  each still waiting. From the same state with the holds taken out (`TRACK_PROBE.holdsOff`), 11 stand so after five
  days and 4 after 21: the wait is the hold's.
- Why they were ordered there. The planners plan no attack across a held front (`foesOf`), but `passageOf` opened
  an enemy's land to every way, so a march to the marcher's own land was routed over the foe's where that was
  shorter: along a front that bends (the five divisions at Strasbourg), to an exclave, by an order from before the
  hold. The march then waited for land that nobody takes (PLAN 1.14).
- The rule (ADR-1163): the land of a foe whose front the track holds is closed to a nation's ways, as a third
  nation's is (`passageOf`, by `World.holdsPlan`); a march under way whose next step is onto it is made again from
  where it stands, or halts; in the days of a stage between the two the land is open as in any war.
- Its first form made every waiting march's way again, also one that stands on the held foe's own ground. A way from
  closed ground walks on it, so that way came out the same, every hour: the checker's first run failed on British
  divisions by the Polish Corridor. The rule leaves those marches as they were, the checker counts them apart
  (`TrackRun.stranded`), and they are R239.
- The checker (ADR-804): the track's has the rule `stand`, asked every day of the replay to 1991: no march waits
  `STAND_DAYS` (7) with one order at a front the timeline holds, from ground not the foe's, no stage's days open
  between the two. No line on the replay's own seed, no `WARNING historyTrack` on seeds 1 to 5.
- The measuring went wrong once. The first probes and the checker's new rule ask `holdsPlan` between two ticks, and
  two probes of one rule stood on different hashes: the asking changed the course (R237), and an arrival's asking
  within an hour did the like (R238). Both were mended first, and everything here was read again on their code. A
  probe's hash is now checked against a plain run's: on 23 November 1939 c43d19b9 by this rule, 1a5c4ff4 before.
- Both rules by one probe from the replay's start (a march waiting at a held front from ground not the foe's, a
  week or more with one order; before → after): 10 September 1939 99 → 0; 15 October 131 → 0; 23 November
  147 → 0; 14 December 157 → 0; 1 February 1940 181 → 0; 5 April 98 → 0; 9 May 98 → 0. The land marches under way
  on 23 November 269 → 141, on 5 April 213 → 110. Apart, on the held foe's own ground: 6 → 5 British divisions on
  23 November, 3 → 3 on 14 December.
- The ten-year tests, green (ten files, 11 tests), against the same run on R238's code. `historyMatch1938h`: Paris
  Germany's from 10 June 1940 in both; French cells Germany's on 22 June 936 → 1,009 (the bar 500); Soviet cells
  the Axis's after 1 December 1941 10,734 → 11,020 (6,000); the Soviet army of 1 November 1942 3,396k → 4,005k
  (2,000k). 40 of the 44 map lines the same; four of control moved: 1 December 1941 whole 99.19 → 99.14 %, right
  96.2 → 96.1 %, astray 0.56 → 0.61 % (its bar 1 %); 1 November 1942 whole 99.39 → 99.36 %; 5 June 1944 whole
  99.32 → 99.29 %; 1 June 1945 whole 99.44 → 99.46 %. `chinaFront1938h`: Japan holds 15.2 % of China on 1 November
  1938 and a year on, in both; China's army there 809k → 746k, a year held 381k → 390k (the bar 0.4 of the
  start's); without the hold Japan would hold 63.3 % (59.4 %). The ten free worlds' days to a first war the same.
- A free game has no hold: seed 99 over three years ends on the same hash by both rules (32ec3f7f), and the pin
  is unchanged.
- The tick, by pairs run at once, each rule on two cores of its own, the masks then swapped (bundles of the
  runner as players' builds are made, `--affinity`): the replay's first eight years 2.01 and 1.87 ms before, 1.81
  and 1.72 after (1.94 → 1.76 at the mean: fewer marches under way, 269 → 141 on the day above); a free game over
  three years 1.83 and 1.75 before, 1.78 and 1.75 after: the two cores differ by more than the rules.
- Drawn: `arrowsHeld1938h.spec.ts` by hand with the other three browser specs of the replay, 14 of 14 (17 advances
  on 4 September 1939, none on 5 April 1940, 75 on 14 May, 66 of them in the West, Germany's 30). Its pictures of
  23 November 1939 looked at, two of them kept in `docs/evidence/R236/`: at 400 m/px the two armies in their cells
  along the Rhine from Luxembourg to Basel and no arrow; with France looked at, at 1,000 m/px, none into Germany
  (R235 had left France's orders across the front drawn faint).
- Tests: `heldFrontMarch1938h.test.ts` on a timeline of its own (four tests, three red before): a march to its
  own land beyond goes round and arrives, never waiting at the held front; with no way round, and onto the foe's
  land, the order is refused; a march under way from before the hold is made again and arrives, or halts on its
  own land; in a stage's days the taker's march onto the stage's land is ordered. `advancing1938h.test.ts` orders
  its marches as before a hold now, since across one none is ordered.
- The decisions it stands on (ADR-803) are in ADR-1163 with their tests, green on R238's code and on this.
  SPEC §4.2 (a march's passage; the hourly step) and §7.7 (a hold) say the rule.
- The gate: a helper of the tests changed, so the whole unit suite ran, every saved world made again (514 files).
  Two red in that run: `snapshot-perf` past its 90 s under the load, and `nukeStrikeAgain1938`, whose worker was
  lost (exit code 3221225477); each green alone. The pin of seed 99 is unchanged.
- Before the push, three things read again. The tick rests on a reading of the AT (a formation "behind a held
  front" is on its own side of it): by the AT's letter five and three British divisions on German-held ground still
  stand so on its two days. Written as ADR-1164, proposed, the user's decision. "Three of four red before": run
  again on this base with the movement rule as it was, three red, the stage's test green. And a God Mode order
  across a held front while the replay runs, which no test sends: it is now refused as `NoRoute`, whose words name
  nations outside the war, and the replay ends all the same, as it does for any `moveFormation`; before, the order
  was given. Filed as R240.

## 2026-11-27 — R241: an advance's arrow ends at the cell its march presses on (ADR-1165; the user's report)

- The user answered what R235 had asked: "The issue was that the arrows in far zoom looked like they crossed far into
  enemy territory, but at close zoom it looked like it was in held territory for the French divisions". That is not
  the held front alone: it is how long an arrow is.
- The cause, from the drawing: an arrow is the first 70 to 136 px of its march's line on the screen (`ARROW_LONG_PX`
  and three widths), a bold one at least 26 px, at every zoom. The line of a march on land is straight from the
  formation to its target (the snapshot's way of a march is those two points, PLAN 7.4g3). So the arrow is 4 to 8
  km at 60 m/px, inside its own cell, and 70 to 136 km at 1,000 m/px, well past the front, though the march waits
  before the first cell an enemy holds.
- Measured first, on fronts that have arrows (the user's scene has none since R235 and R236): the replay's 14 May
  1940 in the West and a free game (seed 99, day 120). The part of each bold arrow past where it first comes onto
  land an enemy holds, in cells, by a spec that reads the frame's arrows and the frame's own map: none at 60
  m/px, a median of 1.66 and 5.16 at the most at 1,000 m/px, 6.15 and 23.91 at 5,000 (the West); 2.11 and 4.15,
  6.30 and 22.91 (the free game).
- Found on the way: which march is an advance was asked of that same straight line (R96, R235). On 14 May 1940 in
  the West the line calls 63 marches advances and the route 52, 41 of them the same. Of Germany's 30 by the line,
  14 have routes with none of the enemy's land (marches along the Rhine to land Germany holds, their lines over a
  French cell) and 6 come to it more than 100 km off. So a march along one's own side of a front had an attack's
  arrow: the user's reading again, in a war that is fought.
- The rule (ADR-1165): the worker walks the march's route to the first cell an enemy holds (`pressesAt`): within 100
  km of where the formation stands and to be taken today, the march is an advance and the cell's point goes with the
  snapshot (`front`). The arrow is drawn from the formation to that point. A march behind the lines, faint for the
  nation looked at, is cut before the first land an enemy holds along its line (`ownSideLength`).
- Two things corrected while testing. The reach was first measured along the route (a winding route 5.8 cells long
  to a cell 5 away was out of reach where the line had it in), then from the last cell of the route the formation
  had reached (up to a cell and a half behind where it stands): it is as the crow flies from where it stands, and
  the route then has 11 of the line's 12 advances at hour 48 of a free war and 21 of its 24 at hour 96.
- After, by the same spec (`arrowReach1938h.spec.ts`, red before in ten places, green): at 1,000 m/px a median of
  0.67 and 1.33 at the most in the West, 0.82 and 1.47 in the free game; no arrow more than a cell and a half past
  the front at 60 to 1,000 m/px (13 of 23 and 14 of 21 before). At 2,500 and 5,000 m/px every arrow is the least
  length or its own line, whichever is longer: 3.32 and 6.64 cells past at the most (13.23 and 23.91 before). A
  cell is 7.8 and 3.9 px there, smaller than the 26 px of R96's sign, which is kept.
- Looked at (`docs/evidence/R241/`, before and after at 1,000 and 400 m/px): at 400 m/px each arrow runs from its
  stack to the front and ends just across the line, Belgium's, France's and Germany's alike; at 1,000 m/px the long
  arrows into Germany (the Netherlands' to Cologne among them) are short wedges on the line. At 5,000 m/px the
  picture is the same before and after but for two arrows in Norway: the counters cover the rest.
- Whether the shorter arrows still show: the tips of 8 of 23 arrows at 400 m/px and 13 of 27 at 1,000 lie under a
  marker's box (7 of 25 and 9 of 23 before), mostly the defender's on the cell pressed.
- Tests: `moveArrows.test.ts` has the route's rule where it had the line's (`advances` is gone): each of its cases,
  and those the route brings (round a corner of the enemy's land the line lies over; the reach from where the
  formation stands; the first of the enemy's cells not to be taken, whatever lies beyond). `advancing1938h.test.ts`:
  on the 1938 map a march presses on the first Polish cell of its route; a German march over German land, a cell
  beside its route made Poland's under its line, is no advance (the line's rule, run once from git, said one).
  `server.test.ts`: a snapshot in flight has 23 buffers, one more.
- By hand: `orderLines1938.spec.ts`, `arrowsHeld1938h.spec.ts` and the new spec, green. The first's guard that the
  arrows are on the names' canvas counted more than 50 points of their middle lines, three arrows' worth; this war
  has two arrows at 1,500 m/px now, and the guard is more than 20 (R96 had lowered its neighbour the same way).
  The arrows spec prints 13 advances on 4 September 1939 (17), none on 5 April 1940, 64 on 14 May (75), 55 of them
  in the West, Germany's 16 (30).
- Cost: the worker's question 0.063 ms a snapshot at the median, 0.10 at the 95th (seed 99 a year on: 1,111
  formations, 509 on the march, 8 wars, 69 advances; 0.06 and 0.16 for the line's at R235). `npm run bench -- G`
  PASS: T0 402 fps, T2 151 fps, draw cpu 1.6 and 5.5 ms.
- The gate: `src/shared` is one of the sim's inputs, so every test's saved world was made again in its unit run (425
  files). One red in that run, `snapshot-perf` past its 90 s under the load, green alone (a steady snapshot 0.61 ms
  at the median, 1.00 at the 95th; its budget 2). The two changed specs ran in the gate's browser stage, green. The pin of seed 99 is
  unchanged.
- Before the push, asked: do the advances that had arrows still have them, or were short arrows that press one
  cell cut away by each other? Counted in the page on this commit and its parent, the advancing formations well
  inside the view that are in no bold arrow: Germany on Poland (seed 1938) at hour 48, 1 of 12 before and 1 of 11
  after at 1,500 and 1,000 m/px (so the two arrows at 1,500 m/px are ten formations in two, not arrows lost); at
  hour 96, 1 of 23 and none of 21; the West on 14 May 1940, 2 of 71 and 1 of 60 at 1,000 m/px, 3 of 48 and 1 of 31
  at 400, 3 of 71 and 6 of 60 at 1,500. A handful both times, by `cutAtCrossing`: filed as R242. SPEC's sentence
  says what the spec measured, on its two fronts: the free game's worst arrow is 1.47 cells past the front against
  the bar of 1.5 (an arrow is a straight line to the cell pressed and may clip another of the enemy's first).

## 2026-11-27 — ADR-1164 ruled: R236's tick stays

- The user, asked twice whether R236 stays ticked on the reading its tick rests on (a formation "behind a held
  front" is on its own side of it) or is open again until R239 is done: "Keep the tick". ADR-1164 is the user's
  decision; ROADMAP's R236 names it. The formations that wait on a held foe's own ground are R239's, as filed.
- Open in Batch 61: R239 (those formations), R240 (a God Mode march across a held front) and R242 (an advance whose
  arrow is cut away). The loop is stopped since the usage limit of this morning: the user's to start again.

## 2026-11-27 — R239: the formations the timeline leaves on a held foe's ground are set down behind the line (ADR-1166)

- The case: a hold keeps a formation on the held foe's own ground from fighting, the land under it is taken by no
  one, and its march waits before each of that foe's cells. R236 closed that ground to ways from outside and left
  those on it as they were (ADR-1163's decision 4; ADR-1164, the user's "Keep the tick").
- Read first, how each came to stand there (`.cache/r239/strand.ts`, the replay's own seed on HEAD to 1991, every
  day's first hour): 539 episodes of 447 formations, 75,055 formation-days, 68,628 waiting on a march and 6,393 with
  no order. The ground changed under 366 of them: a `transfer` sets no formation down (the Easter Offensive of 1
  April 1972 under 330 American formations, 68,179 days, 157 of them gone before the armistice; Poland's partition
  under 7 British divisions, all gone by 20 January 1940; France freed under 6 German; the NPFL's Liberia, the
  Sinai, Manchukuo's end). A hold closed over 99 on ground already the foe's (61 Soviet on Germany's from 2 December
  1941, 16 German on the Soviet Union's, Ceylon's and Australia's on Japan's from July 1942, Hungary's and
  Slovakia's in 1944). 30 are Soviet arrivals on land Germany had taken; 5 had war come to them where they stood
  (Italy's on Germany's ground, October 1943); 39 walked onto it, 30 of them for one day.
- The rule (ADR-1166, `setDownLeft` in `track.ts`): at a day's first hour, after the hour's events, each land
  formation that stands, or waits on a march before an enemy's cell, on the ground of a foe its nation holds a
  front with (no stage's days open between the two) is set down as a stage's cut-off formations are (R66c): the
  nearest land of its own or an ally's within 40 cells, two to a cell. With none in reach it is taken off, its men
  back to the pool. Left alone: a march that does not wait, one aboard, one kept for its stage, a hero with nowhere
  to go. One rule asked each day, for every cause.
- The look asks `holdsPlan`, which makes the hour's list of open stages before the hour's systems ask (R237, R238):
  the track forgets the list after the look. Checked: the look alone, setting nothing down, leaves the replay on
  HEAD's hash on 19 marked days to 30 December 1991. With the rule the course is the same to 28 September 1939 and
  another from 1 October (the British divisions at the partition).
- After, the same probe: 121 formation-days (102 episodes of 80 formations), the longest 5 days. Set down 195, taken
  off 21 to 1991 (`TRACK_PROBE.onLeft`): the United States' on the NLF's ground 74 and none; the Soviet Union's on
  Germany's 43 and none; Germany's on the Soviet Union's 29 and none; the United Kingdom's on Germany's 5 and 10;
  Germany's on France's 8 and 2; Pakistan's on Bangladesh's 8 and none; Italy's on Germany's none and 6.
- Tests: `trackLeft1938h.test.ts`, seven, each red on HEAD's `track.ts`: land ceded under Poland's formations by a
  `transfer` at hour 0, 1 and 23; a stage's days and their end; an ally's land where it is nearest; none in reach
  (the pool, against the same world with the look off); those left alone. Two corrected while writing: the pool was
  first compared over a day of the economy (now against a twin world with `TRACK_PROBE.leftOff`), and the ally's
  case had Czech land within reach of the Rhineland (two tests now).
- The checker (ADR-804, `tests/helpers/historyTrack.ts`): `stand` without the exception R236 gave it
  (`TrackRun.stranded` is gone), and `left`. `left` was first "on a held foe's ground at two days' first hours
  running": red on the own seed on three days (1417, 2421, 2425) and warned on seeds 2, 3 and 5. Read hour by hour
  for the last two (`.cache/r239/second.ts`): a Romanian and a German formation, guests on Finland's front in
  August 1944, are set down on Finland's next cell at 00:00, the Soviet Union takes that cell by 08:00 (it fights
  Finland freely from 9 June 1944, when the Finnish front's hold ends; the guests are held off from it by the
  Eastern Front's), and the next morning finds them on its ground again, a cell further back. The rule did what it
  says there, so `left`'s bar of two days is by the cell; and a second bar holds the item's AT for those guests: no
  formation found on that foe's ground seven days running, in whatever cells. The six files on both bars: no line
  on the own seed (its longest five days), no warning on seeds 1 to 4, one on seed 5 (a Romanian formation, seven
  days running to 22 August 1944). That remainder is filed as R243. With the look off (`TRACK_PROBE.leftOff`, a
  scratch test, not kept) the checker's first 790 days tell `left` on day 636 and `stand` on day 641, both of the
  British by the Corridor.
- The replay's ten-year tests (ten files) green; against R236's run: Paris Germany's from 14 June 1940 (10 June;
  the bar the 22nd), 766 French cells on 22 June (1,009; the bar 500), 9,401 Soviet cells the Axis's after 1
  December 1941 (11,020; the bar 6,000), the Soviet army of 1 November 1942 4,365k (4,005k). Five of the 44 map
  lines move, all of control: 1 December 1941 right 96.1 → 95.5 % and astray 0.61 → 0.35 %; right up by 0.2 to 1.8
  points on 1 July 1940, 1 November 1942, 5 June 1944 and 1 June 1945. The China front and the free worlds' days as
  before.
- The fronts' census (`tools/diag/trackFronts.ts 1938 1942-01-01 1945-06-01`): large land fronts with both sides
  near 20 of 25 (21 of 24; the bar two thirds, ADR-969); both engaged at the stage's hour 11 (14; R66d's bar 9);
  Uranus engaged at its hour (15 Soviet and 22 Axis formations); D-Day both engaged in 101 of 200 samples (81; the
  bar a third, R77); the Sixth Army near Stalingrad's stage (14 formations, 161k; R76d). With the rule on the two
  other seeds those items name: 37701 both near 21 of 24, both engaged 11, Uranus 4 and 4, D-Day 99 of 200; 38701
  18 of 24, 11, 26 and 13, 91 of 200.
- The tick (pairs at once on cores of their own, masks swapped): the replay 1938-45 1.78 → 1.90 ms; a free game
  1.78 and 1.78 ms on the same hash (32ec3f7f after three years). The replay's rise is 1943 and 1944 (2.37 → 2.77
  and 2.33 → 2.75 ms), and by `--profile` it is the combat system's time there (0.46 → 0.77 and 0.41 → 0.80 ms).
  Not the look: timed in the run it is 0.04 to 0.06 ms a day, 0.002 ms a tick, 2.1 ms at the most; and the look
  alone on HEAD's course is 1.75 → 1.78 ms, inside what the two cores differ by. What in the new course costs the
  combat system that time is not read (the shots that hit: 265,514 → 365,988 in 1943, 189,539 → 191,311 in 1944).
  The hour of the 1972 transfer (1 April 1972, 00:00), the longest tick of those days: 98.9 ms before, 81.9 ms
  with the rule.
- By hand: `arrowsHeld1938h`, `arrowReach1938h`, `replayYear1938h`, `scenario1938h` and `trackView1938h`, 15 of 15
  on the new course. The arrows' spec prints 13 advances on 4 September 1939 as before, none on 5 April 1940, and
  135 on 14 May (64), 126 of them in the West, Germany's 87 (16). Asked why (`.cache/r239/may40.ts`): the same
  armies (161 German land formations both times), another day of the campaign: 18 German marches wait before a cell
  for 3, 56 German formations fight for 19.
- Before the push, asked. (1) "Both engaged" fell from 14 fronts to 11: is there a bar on it? R66d's, 9 on the own
  seed, and R76d's and R77's on three seeds (Uranus, D-Day, the Sixth Army at Stalingrad): all read, all kept (the
  census above). (2) Are the five specs run by hand every spec that steps the replay? `1938h` is in those five
  files of `tests/e2e` and in no other. (3) `left` "in one cell" was drawn after its first run failed, as R236's
  `stand` was (ADR-1164): the bar of a week in any cells was added, the six seeds run again, and the guests' hops
  filed as R243 with seed 5's warning. SPEC's line on the checker (§7.7) names `stand` and `left`.
- The gate, twice (the second for the checker's second bar): `tests/helpers/` changed, so the unit stage ran whole
  (515 files, 2,682 tests), each test's saved world made again the first time (a sim input changed). One red in
  each run, `snapshot-perf` past its 90 s under the load, green alone (a steady snapshot 0.73 ms at the median,
  1.20 at the 95th; its budget 2). The pin of seed 99 is unchanged. No spec changed, so the browser stage was left
  out: the five above by hand.

## 2026-11-27 — The loop stopped by the user; R243 by the small cure (ADR-1167), put first

- The user stopped the loop (`/loop off`) after R239 and asked why each item finds new ones, then what the cure
  is. Both answers are in ADR-1167: one root (the replay's freezes are by pair of nations, under rules written for
  fronts that move), checks that look harder each time, every cause filed, the first report misread; and the cure,
  a freeze by the border on the map, where a formation stands deciding and not whose it is.
- Ruled by the user ("Yes try it"): R243 by the small version, a formation on an ally's land takes that ally's
  front. The full cure is not taken. R243 is put first of the open items so that "continue" takes it: the builder's
  ordering, not ruled (before it the builder had advised R240 first, the one a player can meet).
- Not ruled: which of R240 and R242 are still fixed (asked, not answered). Open as filed, after R243.
- The deploy of R239's push: success.
- For the next sitting (the context cleared and the machine restarted, so nothing of this session's scratchpad is
  counted on): the probes and scripts of R236 to R239 are in `.cache/r239/`, ignored by git. `strand.ts` (who
  stands on a held foe's ground, by cause and pair), `second.ts` (three days hour by hour for one pair), `marks.ts`
  (the replay's hash on marked days, the set-downs by pair), `may40.ts`, `look.ts`; `bundle4.mjs` bundles one of
  them with files of the sim swapped for copies beside it (the before and after arms); `r236_all.sh` and
  `r236_track.sh` run the replay's ten-year tests (ten files) and the checker's six, their logs into that folder;
  `r236_compare.py` reads the figures of two such logs; `r239_time.sh` and `r239_profcmp.mjs` are the tick pairs
  and the tick by system; `r239_census.mjs` sums two logs of `tools/diag/trackFronts.ts`. R239's own ten-year run
  is `r239_all.log.txt` (its own-seed checker file is red there, on `left`'s first wording; the figures are the
  code's), R236's `r236_all_v2.log.txt`; R239's census `fronts.after.log`, with 37701's and 38701's beside it.
  In the logs kept there, `head` and `before` are the code before R239, and `rule` and `after` are R239's: R243's
  "before". The copies of `track.ts` and the bundles made of them are deleted, so no arm of R239's is taken for
  HEAD: an arm is made anew (`git show <commit>:src/sim/track.ts` into a copy beside `bundle4.mjs`, then the
  bundle), and `r239_time.sh` and `r239_prof.sh` fail until their two bundles are built again.
