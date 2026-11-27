# Decisions (ADR log)

Format: ID · date · status · decision · why · consequences. Deliberate deviations
from AoC are tagged **[AoC-DEVIATION]**.

---

## ADR-1162 · 2026-11-27 · accepted · A march is an advance only onto land that can be taken today, and the worker says which (R235, the user's report)

- **The case** (the user, 2026-11-27, with two pictures of the historical replay's 23 November 1939 at Strasbourg, far
  and close: "I think the arrows are misleading here"). A bold arrow is an advance: "only show arrows if a country is
  invading another country or pushing through a front" (R96, ADR-1088, the user's rule). The view judged it by what
  it knows: a march of a nation at war whose line, within 100 km, is on land a nation at war with it holds. In the
  replay the track holds fronts (R62f2): at war, and no land taken across them. On that day five German divisions
  stood in one cell at Strasbourg, each ordered 4 to 7 cells along its own front on a line that clips French land,
  each under a bold arrow over the Rhine, and a French mountain division's arrow pointed far into Germany. Of the
  day's 153 advances (the West 58, China 95) none could take a cell: three weeks on 147 of their formations were in
  the same cell, 145 with the same order.
- **Decision.**
  1. Which marches are advances is asked of the world, by the worker, and sent with the snapshot
     (`FormationFlag.advancing`, `src/worker/advancing.ts`): the same marches, lines and reach as before
     (`shared/advances`), and of the land on a line one thing more, that the marcher may take it there today
     (`World.holdsLand`, the territory system's own question, by cell).
  2. So no march is an advance across a front the track holds, and in the days of a stage (R66d) the marches of the
     taker's side onto the stage's land are, and no other. The hold asked of the two nations alone (`holdsPlan`)
     brings the Rhine's arrows back whenever Germany has a stage anywhere: run so, the replay's 5 April 1940 (the days
     of Southern Norway's stage, the West held) has 84 advances in the West, Germany's 53, France's 28, the United
     Kingdom's 3. By the cell it has none.
  3. The view draws what the flag says and judges nothing (`findAdvances` is gone).
- **Consequences.**
  - It amends ADR-1088 (R96) by the user's own rule: an arrow where a front is pushed through, none where none can be.
  - A free game has no hold, and its advances are the same formations as before: seed 99 at days 120, 240 and 365,
    90, 25 and 73 of them, id for id.
  - In the replay: on 4 September 1939 112 advances are 17 (Germany's 7 and Poland's 10, in Poland, a war the track
    holds no front of; none in the West, held since the day before); on 23 November 1939 153 are none; on 5 April
    1940 none; on 14 May 1940 186 are 92, 87 of them in the West.
  - A nation looked at still has its other marches drawn faint (R89b): France's orders that cannot be carried out are
    faint arrows into Germany. That such orders stand for months is the sim's, not the arrows': ROADMAP R236.
  - Not touched: how the arrows of several nations read together at the world's zoom. They lie under the counters,
    and two of a nation may run reversed along one line (the 6 divisions coming south to Strasbourg and the 2 going
    north from it). Asked of the user, whether that was part of the report.
- **Read.** `moveArrows.test.ts` (the rule: land that may not be taken, over it, on it, along it; land beyond it within
  reach), `advancing1938h.test.ts` (a timeline of its own, Germany and Poland held with a stage: no advance across the
  held front; in the stage's days Germany's onto the stage's land alone, not its march beside the ring nor Poland's;
  with no hold all three) and `arrowsHeld1938h.spec.ts` (the replay itself on four days, at 1,000, 400 and 60 m/px at
  Strasbourg and in the Ardennes; pictures in `docs/evidence/R235/`). The taker's advances in a stage's days are held
  by the unit test alone: the replay's Norway stage has no German march on its land four days before it. On the
  build before, the same marches read by the view: the figures above. `orderLines1938.spec.ts` green by hand.

## ADR-1161 · 2026-11-27 · accepted · The gate runs the test of what SPEC.md cites whenever a change can break a line (R233)

- **The case** (found by R231's whole unit run). `specRefs.test.ts` (R6, ADR-821) holds SPEC.md to the tree: every
  path, name and script it cites exists. It reads SPEC.md and the tree from the disk, and no import reaches either.
  The gate sizes its unit stage by imports (ADR-280) and runs nothing for documents (ADR-48, ADR-55; "nothing reads
  the documents" was written when parity was retired, ADR-805, before R6). So a SPEC line that cites what is not
  there ran no test and went to `main`: R94a's `chromeCover1938`, red in the nightly run of 2026-11-16, and R231's
  own line, red in its whole unit run. From the other side the same: a change that takes away a file or a name
  SPEC.md cites runs no test of it. And the checker read git's index for the tree: a new file SPEC.md cites was
  missing until it was added, and a file removed from the disk still counted.
- **Decision.**
  1. `specRefs.test.ts` joins the gate's unit stage whenever a change can break a line of SPEC.md: SPEC.md itself;
     anything that is not a document (a name of the code changed, a file renamed or removed); a document gone from
     the disk (SPEC.md cites a few by their path). A document edited or added can break none.
  2. A change of documents alone that can break a line runs the unit stage alone, for that test alone. Other
     documents run nothing, as before.
  3. The tree the checker reads is the working tree as a commit of it would be: its files added to git's index or
     not (never the ignored ones), less those removed from the disk.
- **Consequences.**
  - It amends "documents run nothing" (ADR-48, ADR-55) for SPEC.md and for a document removed, and "the tests whose
    imports reach a changed file" (ADR-280, the user's decision) by one test that is every change's: 2 s of a gate.
  - A change of what no unit test imports (a spec, a workflow, a page) ran no unit stage; it runs that one test.
  - By (3) a file SPEC.md cites that is on this machine and never committed passes the gate here, and is a miss in
    the nightly run: the gate judges the working tree, as the item's AT has it.
  - `npm run check:full`, `npm run check:review` and the nightly run had the test already, in the whole suite.
  - Not covered: the other documents, which no test reads; the sections of SPEC.md the test does not list (it lists
    all ten now).
- **Read.** `gate.test.ts` holds the plan (SPEC.md alone, with documents, with code; a spec, a workflow, a page; a
  document gone; documents edited or added: none; the test's file is there, since the related run passes with no
  tests), and `specRefs.test.ts` the tree (a scratch repository: a new file counts before it is added, a removed one
  does not, an ignored one never). Four tests red on HEAD. Through `npm run check` for real, each on a tree with no
  other change: SPEC.md citing a file that is not there: the stage `test` alone, red in the run and again alone, the
  gate failed and the tree not recorded; that file made and not added: green, the related run naming it and the
  test; another document alone (CHANGELOG.md): nothing runs; `docs/PARITY.md` moved away: red ("41: docs/PARITY.md
  (no such file)"). The test's file takes 2.03 s where it took 1.63 (one more test; the two listings 0.4 s).

## ADR-1160 · 2026-11-27 · accepted · An error vitest caught outside the tests is red: as its file, or as the run (R231)

- **The case** (found by R230's fixtures). vitest fails a run for an error it catches outside the tests, a rejection
  nothing handled or an exception out of a timer, while the tests of the file pass ("Errors 1 error", exit 1). It
  hands such errors to its reporters at the run's end, and its JSON reporter, whose report the gate reads, leaves
  them out. The gate took a failed run for the stage's own red only when the report named nothing: beside a test red
  by name that passed alone it ended green, as with R230's lost file. Read on fixtures (vitest 5.0.3):
  - an Error rejected or thrown while a test file's worker runs comes with that file's full path, and the test that
    was running;
  - a rejection with a value that is no Error (a string) comes with no file;
  - a lost worker's error (R230) is the pool's, one a worker, with no file as a field: its cause's message ends
    "while running test file <path>";
  - a worker that goes as it starts (a node flag it does not know) gives the pool's error with no file in it at all
    ("during starting state"), and the report leaves its file out altogether: no test of it, and no file. R230's
    reading of the report's shape cannot see that file;
  - `process.exit` in a test fails that test by its name. A timer that throws after the file's last test, and a
    worker that goes after it, leave no error at all (exit 0, every test passed).
- **Decision.**
  1. The gate's vitest runs take a reporter of the gate's own beside vitest's two (`tools/gate/vitestErrors.ts`). It
     writes the run's errors outside its tests to a file beside the JSON report, which the gate names for each run. A
     report with no such file is no report: the run is the stage's red.
  2. An error with a test file to its name is red as that file, as a whole (`<file> › (the file)`), beside whatever
     the report names (`errorRed`). The file a lost worker was running is read from the pool's words: the id R230
     reads from the report's shape.
  3. Such a file is run again alone as ADR-1159 (3) has it, and is red unless that run is clean: its tests passed,
     and no error of it caught.
  4. An error with no file to its name is the run's own red (`stage:test`), which no run alone clears.
  5. A run alone in which the file is red as a whole clears no red of it: what was red of the file stays red
     (`again`). Until (2) a run alone that left an error named nothing and was its own failure, which ADR-1159 (4)
     held; read by its file it would have cleared a test red by name that passed beside it, the hole of this item one
     run later.
- **Consequences.**
  - A file that leaves an error behind in every run is red by its name, with a red test beside it or not. Until now
    it was red only when the run named nothing else (as `stage:test`).
  - Looser in one case, as R231's AT has it: a run whose one fault was such an error was red as it stood. It is now
    judged by the file's run alone, and an error that comes only under the load of the parallel run is not red, as a
    timing test is not (ADR-423).
  - Stricter in one: an error with no file is red as it stands, with a red named beside it or not. So a worker that
    did not start fails the run, as it did before R230 when nothing else was red: its file is in no report, and there
    is none to run again.
  - Stricter in a second, by (5): a test red by its name whose file loses its worker in the run alone, or does not
    load there, stays red. It did not run there; until now it was green. The browser stage's runs alone are judged by
    the same `again`.
  - The gate reads the pool's wording of a lost worker. A vitest that words it another way gives `stage:test` for
    every lost worker, and R230's fixture test turns red by it.
  - The same reader serves `npm run check:review`, its ten-year step, and the nightly run's unit stage.
  - Not covered: what vitest tells no reporter of (a timer that throws after the file's last test).
- **Read.** `gateReview.test.ts`: `errorRed`'s shapes, and the unit stage run for real (`unitRedTwice`, `RunAt`) on two
  fixtures written under `.cache/gate`, each with a test red in the first run and green alone. One has a file that
  leaves a rejection behind in every run (red: the file) and a file whose timer throws in the first run alone (run
  again alone, clean: not red); the other a rejection of a value that is no Error (red: `stage:test`; the red test's
  file alone is run again). A fixture's file leaves a mark when it is run again, so the test tells a file cleared
  from one never noticed. On HEAD's reader both runs name nothing red. (5): a shape, and a fourth file of the first
  fixture, red by its name in the first run, whose test passes alone and leaves a rejection (red: that test); both
  red on this item's reading before (5). R230's fixture expects what it did and holds the pool's wording of a lost
  worker: no `stage:test` among its reds. The worker that did not start was read by a probe (a node flag it does not
  know: two files, neither in the report, two errors with no file) and is held as a shape. Healthy runs record no
  error, read before (5), which changes no first run's reading: the whole unit suite with the reporter (510 files,
  2,652 tests: no error, no file red as a whole; two tests red by name, the timing test `snapshot-perf` and
  `specRefs`, whose SPEC line cited the reporter before git knew the file), the pin of seed 99 under the sweep config
  (one test), and a related run that reaches no test (both files written, nothing red). A change of the reporter
  alone reaches `gateReview.test.ts` (`review.ts` imports the variable's name from it). Not read: the ten-year
  suite's whole report, and any run on Linux.

## ADR-1159 · 2026-11-27 · accepted · What did not run is red: a unit file whose worker was lost, a browser test that did not run (R230)

- **The case** (R228's first gate run, 2026-11-26). The worker of `worldTemplate.test.ts` ran out of memory. vitest
  told of it as an error of the run, outside every file ("Worker exited unexpectedly"), and its JSON report gave the
  file as passed; a timing test was red by name in the same run. The gate reads the report's failed tests and files
  and takes a failed run for the stage's own red only when it names none (`runRed`): it ran the timing test's file
  again alone and ended green, with a file whose five tests never ran. Read on fixtures whose workers kill themselves
  (vitest 5.0.3, Playwright 1.63):
  - vitest: a file whose worker goes in a test or a hook is 'passed' with every test 'pending' (a test that failed
    before that and was told of is 'failed' beside them); one whose worker goes as the file loads, or before that in
    the suite's setup file, is 'passed' with no test at all.
  - Playwright fails the test a dying worker was running and runs the rest in another worker: nothing is lost. A
    worker that goes as it loads the file fails the first test of its lot, and the rest "did not run": 'skipped' and
    `ok` in the report, as a `test.skip` is, apart only by what the test was to be (`expectedStatus` 'passed').
- **Decision.**
  1. A unit file with a 'pending' test, or with no test at all, is red in its run as a whole (`<file> › (the file)`),
     beside any test of it red by name (`vitestRed`).
  2. A browser test that did not run ('skipped' while it was to be anything else) is red in its run by its own name
     (`playwrightRed`).
  3. A file red as a whole in the first run (lost; or, as before, it failed to load or a hook threw) is run again
     alone as a red test's file is, and is red unless that run passes all of it: whatever the run alone names red is
     red, since no test of the file had a first run to be green in (`again`).
  4. A run alone that writes no report (as before) or fails with nothing of the file named has passed nothing: what
     was red of the file stays red.
  ADR-423's rule stands for a test red by its name: red is the test that fails again alone.
- **Consequences.**
  - A worker lost under the load of the parallel run, whose file passes alone, is not red, as a timing test is not
    (R230's AT). Until now a run that lost a file and named no other red was red as it stood (`stage:test`), with no
    second run; it is judged by the file's run alone. A file that runs out of memory by what it does, as R228's did,
    does so alone too, and is red.
  - (3) is stricter than before in one case: a file that failed to load in the run, and alone loads and fails a test,
    was green (the two ids differ). (4) likewise: a test red by name whose run alone failed as a run (the browser
    suite's server not started) was green.
  - The same readers serve `npm run check:review`, its ten-year step, and the nightly run's unit stage
    (`tools/ci/unit.ts`).
  - Not covered: an error vitest catches outside the tests that loses no file (an unhandled rejection) beside a test
    red by name. The JSON report has no trace of it. ROADMAP R231.
- **Read.** `gateReview.test.ts`: the reports' shapes, `again`'s cases, and each stage run for real on a fixture
  written under `.cache/gate` (`unitRedTwice` and `e2eRedTwice`, given the fixture's config and report: `RunAt`). The
  unit fixture: a test red in the first run and green alone, a file lost once and green alone, a file lost each time
  (red: the file), a file lost and then red by a test alone (red: that test). The browser fixture: a test that did not
  run and is red alone, and a file whose worker goes each time (its second test red with its first). On HEAD's reading
  those five tests are red, and the unit stage on the fixture names no red at all. False alarms: the whole unit suite's
  report (510 files, 2,644 tests, one timing test red by name) names no file as a whole, with no test 'pending' and no
  file without tests; the whole browser suite's report (551 tests on the GPU: 550 passed, one red by name, none skipped) names no test that
  did not run; the perf project's and the pin's under the sweep config (one test each) are clean.

## ADR-1158 · 2026-11-26 · accepted · The sim makes a fire record only while a reader wants it (R227)

- **The case** (the profile of 2026-11-26, Batch 60). Every shot of the land, the sea and a bombardment wrote a record
  to `World.out.fires` (the two elements, the damage, the places it flies between), and land combat worked out the two
  elements' places for it alone. The worker keeps the records only for a view that draws elements (T1.5 and closer,
  `drainFires`), and a headless run throws them all away: at a world zoom and in every sweep, soak and build they were
  made for nothing, 22 % of combat's time.
- **Decision.** `FireLog.wanted` (`src/shared/events.ts`), set by the reader and never by the sim: the worker sets it
  before each step as `drainFires` keeps or drops the records (its subscription draws elements); `Sim.step` with no
  taker of the tick's outputs steps with it false; the headless runner, the soak and the replay's build set it false. While it is false the three systems that fire (`combat`, `navalCombat`, `bombardment`) write no
  record and work out nothing a record alone needs. It is an output's switch, as `World.out` is the tick's outputs:
  not state, saved and hashed nowhere, and nothing but the records hangs on it. The systems still read no
  subscription, clock or render state (SPEC 2.1); they read whether their output has a taker.
- **Read.** With a reader the records are those of the commit before, number for number: seed 99's days 20, 70 and
  179, three days each (87,188, 104,891 and 14,119 records: the land's, 656 of ships' guns and 319 torpedoes, 208 of a
  bombardment), the same count, hash of every number and state after. With none, two years of seed 99: the same hash
  (`9e8dd1b1`), combat 0.390 and 0.382 → 0.301 and 0.302 ms a tick (−22 %), the tick 2.41 and 2.34 → 2.31 and 2.29
  (arms at once, swapped). `fireWanted1938.test.ts`: with none no record is written and the state is the same; the
  worker asks for none at T0 and T1 and for them at T2.
- **Consequences.** A view that zooms in to T2 gets fire from the next tick, as before (the records of ticks before a
  subscription were never kept). A tool that reads `World.out.fires` in its own step callback gets them as before:
  the switch is true unless a reader sets it.
- **Corrected the same day.** As first committed (`0f79149f`) the sweeps' runner (`tests/helpers/aiSweep.ts`) set it
  false too, and that runner has a reader: `fleetsStand` reads the hour's volleys to tell a fleet that fought. Without
  them `aiSweep3` was red (seed 3, day 96: two fleets "no rule should have touched"); the gate runs the pin alone of
  the ten-year tests, so it passed. The line is out; the rule for a reader stands: whoever reads the records leaves the
  switch on.

## ADR-1157 · 2026-11-26 · accepted · At Max the worker's next slice comes by a message to itself, not a timer (R226)

- **The case** (the profile of 2026-11-26, Batch 60). At Max the worker runs its ticks in slices of 12 ms and asked for
  the next with `setTimeout(0)`, to let the page's messages in between. A browser holds a timer set from a timer 4 ms or
  more once five are nested (the HTML standard's clamp), so the worker waited a quarter of its time: 290 and 363 ticks a
  second in seed 99's first two years in the page, where the sim alone (a bundle, as the game is built) ticks 402 and
  537.
- **Decision.** While the speed is Max and ticks advance, `src/worker/entry.ts` posts itself a message on a
  `MessageChannel` for its next turn; at a fixed speed, and while only derived messages are owed (paused), the 4 ms
  timer as before. The message is a task of the queue the page's messages come by: what the page sent during a slice (a
  pause, a command, an ack, a subscription) is handled before it, in its order. `SimServer` and its `pump` are
  unchanged, and so are the unit tests and the headless tools, which never ran `entry.ts`.
- **Read** (`tools/diag/maxStalls.ts 99 - 2`, the build before and this one, each twice, interleaved, on the RTX 4070
  Ti): year 1 31.2 and 31.2 s → 25.2 and 25.2 s (−19 %), year 2 24.2 and 24.1 → 20.1 and 20.1 s (−17 %); 59.5 to 60 fps
  on both. `maxLoop1938.spec.ts`: a command given at Max is applied, a pause is taken 3 to 6 ticks after the worker's
  tick was asked (16 runs under eight workers) and the date holds. It counts ticks and frames, not ms (ADR-1156): alone
  the pause was taken in 25 to 38 ms (12 runs), under eight workers in 29 to 48 ms with two of sixteen over 300 ms and
  3 and 4 ticks run, so not ticks; their cause was not looked for. The whole browser suite on the GPU: 551 of 551.
- **Consequences.** At Max the worker's thread is busy all of the time, not three quarters of it. What still parts the
  page from the sim alone, some 15 to 20 %, is the snapshot's build, the statistics and the labels.

## ADR-1156 · 2026-11-26 · proposed · A browser spec waits for the view's state, not for seconds of the wall

- **The case** (the user chose idea 3 of the Nov 24 review). Of the 12 tests on `tools/gate/knownRed.json`, 11 are
  there as "a software GPU's speed: frames and ticks counted against wall time". Waits of a fixed time made a measure
  hang on the machine: `shipMarks1938` waited 1.5 s after a zoom and drew, `fightSeen1938` waited at most 5 s for the
  section of its zoom (and went on without it) and then 400 ms, and `cityNames1938` read the frames of four seconds and
  asked for more than 8 frames and 50 ticks. `shipMarks1938`'s T3 test is red now and then on the GPU too (BLOCKERS:
  16.5 px against 17, "the frames' timing moves the measure").
- **Decision.** A spec that needs the section of a new zoom waits for it (`settleAtZoom` in `tests/e2e/settle.ts`: the
  view's `elementsZoom` within 1 % of the camera's, then `settle`), with a limit only for a section that never comes.
  A spec that watches a running game watches a number of the view's frames and of ticks (`cityNames1938`: 120 frames
  and 100 ticks at the least), not a time. What each test measures is unchanged.
- **Consequences.** The three specs take longer where frames are slow, and their limits are raised to match. The
  other known reds are not changed: `tickClock` tests the clock of a tick a second itself; `fire1938` and
  `individuals1938` hold budgets of draw and build time. On the user's PC on SwiftShader (`E2E_RENDER=software`, 4
  workers) all 22 tests of the 11 files were green in one run (8.0 min; destroyers 18 px at 20 m/px), so
  `knownRed.json` is emptied and shipMarks1938's BLOCKERS entry resolved: the suite runs on the user's PC since
  ADR-1029, and these were put on the list for a cloud container's speed. One run, not the three of
  2026-11-17's precedent: a test red again goes back on the list with a BLOCKERS entry.

## ADR-1155 · 2026-11-26 · proposed · The deploy waits on typecheck and lint; the records alone deploy nothing; one commit an item

- **The case** (the user chose ideas 1, 2 and 5 of the Nov 24 review). `pages.yml` published every push to `main` after
  only the build: lint and the unit tests ran in the nightly run alone, so a break was live before anything flagged it
  (03d8051 fixed the lint of cc9a3f0, a push later). 72 of 200 commits were "ROADMAP: Rxxx tick names its commit", each
  a push that built and deployed the site again. Every deploy checked out the whole tree, 551 MB, of which docs/evidence
  (428 MB) and critic/ (61 MB) are read by neither the build nor the checks.
- **Decision.** (1) A `check` job (typecheck, lint) beside the build; the deploy needs both. The unit suite stays
  nightly: it ran 59 min on the runner on 2026-11-26, and the deploy is a 2-min job. (2) A push whose files are all
  Markdown, `docs/` or `critic/` starts no deploy (`paths-ignore`). The tick goes in the item's own commit with its
  evidence; that commit's subject starts with the item's id, and no follow-up commit names its hash (PROMPT.md step 9,
  ROADMAP.md's rules). (3) Both jobs check out without docs/evidence and critic/ (63 MB). `deploy-pages` v4 → v5 (it
  warned of Node 20), with `upload-pages-artifact` v3 → v5, its pair. The nightly run keeps the whole tree: tests read
  critic/.
- **Consequences.** A commit that breaks typecheck or lint leaves the site as it was. The checkout's saving is small,
  seconds a deploy (it took 14 s whole). The v5 actions and the sparse checkout are first run by the merge; a failure
  there leaves the last site up.

## ADR-1154 · 2026-11-26 · proposed · The ball look builds no T3 figures

- **The case** (the user asked whether cutting close zoom would speed the game up; he said yes to this fix). The
  countryballs are one ball an element at T2 and at T3 (SPEC 8.2, PLAN 7.174c), and their draw never reads the figures.
  `MapView.tierShares` built them anyway in the frame the close tier came in, up to `MAX_INDIVIDUALS` (60,000), and
  uploaded them: CPU time and GPU memory spent at close zoom for nothing, in the default look and on a phone.
- **Decision.** In the ball look no figures are built; figures built in Classic before a switch are let go (count and
  turrets 0), and a switch back builds them again from the kept section. The close tier's share follows the zoom alone
  in the ball look, as it did whenever figures were built, so the layers that read it (sorties, air, sea marks, hulls,
  ship sizes) are unchanged. A shot at T3 in the ball look now leaves its element's slot, as at T2, not the muzzle of a
  figure that was never drawn.
- **Consequences.** `countryballs1938.spec.ts` checks no figures are built at 15 m/px; `heroes1938.spec.ts`'s wait for
  T3 no longer asks for figures in the ball look. Typecheck, lint and the build pass; neither spec has been run: written
  in a container with no browser.

## ADR-1153 · 2026-11-25 · proposed · A lost WebGL context keeps what was open, not only the camera

- **The case** (the user, after ADR-1151: "finish the iPhone fix"). ADR-1151 boots again from the save at the camera
  the player had, but the selected nation, the formation's panel, the played nation's selected formations, the open
  top-centre panel and the God tab were gone: on a phone the player was back on a bare map.
- **Decision.** `onContextLost` keeps them with the camera in sessionStorage (`warism.viewAfterLoss`,
  `src/app/viewAfterLoss.ts`; a bare camera kept before this is still read). After the boot from the save: the camera,
  the nation selected, the formation's panel asked again, the one top-centre panel (charts, History, Relations,
  Settings or the editor) and the God tab. The selected formations are given back only once the sim says the same
  nation is played again (`PlayerControl.restoreSelection`), after the first count's `clearSelection`; given up after
  30 s. The save the boot loads is the one the loss wrote, so the ids are its own; a nation dead or a formation gone is
  let go by the rules that already do it (PLAN 2.17e3, `refreshFormation`, the snapshot's selection check).
- **Not kept.** The time-lapse (it pauses the game and is opened from History), a nation panel's tab, hover and tooltips.
- **Consequences.** `tests/e2e/contextLost1938.spec.ts` has a second test (nation, formation panel, two selected
  formations, History, God Mode through a forced loss); `tests/unit/viewAfterLoss.test.ts` reads the kept value. The
  e2e test was written in a container with no browser and has not been run yet.

## ADR-1152 · 2026-11-22 · accepted · A touch screen's map at most at 2 px per CSS px, and no kept frame (the user's decision)

- **The case.** ADR-1151 makes a lost WebGL context recoverable; it does not make it rarer. iOS takes the context under
  memory pressure, and the map's drawing buffer is the largest thing in it a frame: an iPhone's screen at 3 px per CSS px
  (1179 × 2556), kept a second time by `preserveDrawingBuffer`.
- **Decision** (the user chose both, 2026-11-22). On a touch screen (`(hover: none) and (pointer: coarse)`: phones and
  tablets) the WebGL map is drawn at most at PHONE_GL_DPR = 2 px per CSS px (`MapView.glDpr`: the canvas, the map's,
  the ground's and the sprites' passes), 2.25 times fewer px on an iPhone; and its context keeps no copy of the frame
  (`preserveDrawingBuffer: false`). The names' and flags' 2D canvases keep the screen's own px: text stays sharp. The
  screenshot (`captureMap`) draws in its own task, as it did, and composes at the names' px, the map stretched to them.
  A desk keeps both as before: its tests read the map's pixels after a frame.
- **Consequences.** On a phone at 3 px the map's colours and borders are a little softer than its names; at 2 px or
  less nothing changes but the kept frame. `tests/e2e/phoneGpu1938.spec.ts` reads both on an emulated iPhone and a desk.

## ADR-1151 · 2026-11-22 · accepted · A lost WebGL context saves the game and boots again from the save

- **The case** (the user, on an iPhone): after a while of play or zoom the map stopped moving while the nation and city
  names went on scrolling. The map is drawn with WebGL; the names are on 2D canvases of their own. iOS Safari takes a
  page's WebGL context away under memory pressure (and with the page in the background), and the view never listened
  for `webglcontextlost`: every GL call after it did nothing, and the last picture stayed while the names moved.
- **Decision.** `MapView` takes the event (`preventDefault`), stops its WebGL passes and calls `onContextLost`. The game
  (`game.tsx`) saves the autosave and boots again from it (`continueUrl`, as the title screen's Continue), at the
  camera it had (sessionStorage), once the page is shown. Before the game has started (world still building) it only
  reloads: a save then could overwrite the player's autosave with a world not yet loaded. Not a rebuild of the GPU
  state in place: the map's textures come from a dozen messages of the sim and the assets, each to be kept and sent
  again, and a page booted afresh has them all by the path every game already takes.
- **Consequences.** The player sees the game load again, at the same day and view, in place of a frozen map; the
  selection and open panels are not kept. `tests/e2e/contextLost1938.spec.ts` loses the context (`WEBGL_lose_context`)
  and reads the tick and the camera after the boot.

