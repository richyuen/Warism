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
