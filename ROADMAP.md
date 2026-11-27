# Warism — Roadmap

What is still to do after `release-2026-11-03` (ADR-805, the user's decision). PLAN.md and
`docs/PLAN_DONE.md` are the frozen record of the build up to that release.

Rules:
- Work top-down. "continue" means the first unchecked item (PROMPT.md).
- Each item says what it is for, its acceptance test (`AT:` names a figure, its bar and the run that
  reads it, or the case that must hold; ADR-554), and the rules it adds to a checker, when it changes
  a sim rule (ADR-803, ADR-804).
- An item too big for one sitting is split into lettered parts (R3a, R3b), one level only.
- Tick it (`- [x]`) in the commit that finishes it, with one line under it: the evidence. That
  commit's subject starts with the item's id (`R225: …`), so `git log --grep '^R225:'` finds it; no
  follow-up commit names its hash (ADR-1155). Ticked items stay until the batch's release, then move to CHANGELOG.md.
- A batch ends with a critic run and a release tag (`release-<YYYY-MM-DD>`, PROMPT.md "Releases"; a
  second on one day takes a letter, `release-2026-11-03b`, ADR-820).

## Batch 60 — speed with no rule changed (the user's decision of 2026-11-26, from a profile of `release-2026-11-20`)

What the profile found that costs the game nothing: 25 years of seed 99 by system (`npm run sim -- --profile`), its
years 1 and 19 by function (an esbuild bundle, as the game is built), and Max in the page (`tools/diag/maxStalls.ts`).
Speed-ups only: every result bit for bit as before, the pin of seed 99 unchanged. Timings are paired arms run at once
on separate P-cores (a ratio, not an absolute figure).

- [x] R225 **A massing's refused formations are searched for again every day.** Year 19 of seed 99, at peace:
  `strategicAi` 2.10 of 2.66 ms a tick (0.93 the year before), 71 % of the year's time in `findPath` under `gather`,
  single ticks to 240 ms; at Max the date stood still ten times for 0.25 to 0.7 s and the year took 29.5 s, as long as
  the war-heavy first. Read from the code: R224's second ask replaces the one refused cell `asked()` keeps
  (`World.refusedOrders`), so a formation asked at two points is searched for at both again the next day (ADR-1150 meant
  one extra search per point a day). The memo keeps each refused cell: the same orders, by its own rule. AT: seed 99's
  year 19 from a year-18 save of HEAD ends at HEAD's hash (`2cbef30d`) with `strategicAi`'s mean a tick at most half of
  HEAD's (arms at once, swapped); a unit test red without it (a formation refused at two cells is searched for at
  neither when asked again); the pin unchanged.
  - Done: `asked()` keeps each cell refused to a standing formation (the last and up to 16 before it, `others` of
    `World.refusedOrders`), and `gather` keeps the regions its refused searches walked for the day's asks
    (`keepRegions`, PLAN 7.124, as the operational AI's plan does). The memo alone was not the half: of the year's
    5,743 searches 3,442 were refusals of formations on the march, which keep no memo (`strategicAi` 2.13 → 1.37 ms);
    the regions answer those. Year 19, arms at once and swapped: the hash `2cbef30d` on both; `strategicAi` 2.13 and
    2.11 → 0.57 and 0.56 ms a tick (0.27 of HEAD's), the tick 2.91 and 2.84 → 1.31 and 1.32, ticks over 50 ms 108 → 66.
    Three-nation worlds 91415, 91408 and 91413 × 12 years: every yearly hash the same (and their tick: no gain there).
    `refusedOrders.test`'s new case red on HEAD (6 searches for 0). The pin unchanged. No ADR (ADR-914: PLAN 1.42g's
    memo, PLAN 7.124's regions and ADR-1150's "one extra search per point a day" mended).
- [x] R226 **Max speed waits on a timer between its slices.** At Max the worker's next 12 ms slice is a `setTimeout(0)`
  (`src/worker/entry.ts`), which a browser holds 4 ms or more once timers nest: the page ran 290 to 363 ticks a second
  in seed 99's first two years, about 70 % of what the sim does alone. The next slice by a message to itself. AT:
  `tools/diag/maxStalls.ts 99 - 2` on HEAD's build and this one, each twice, interleaved: each year at least 12 % less
  wall time (a trial: 17 and 16 %), 59 fps or more; a spec at Max: a pause holds the date within 250 ms and a command
  given at Max is applied.
  - Done: ADR-1157. `entry.ts` posts itself a message for the next turn while the speed is Max; the 4 ms timer at a
    fixed speed and while paused. `maxStalls 99 - 2`, the build before and this one, each twice, interleaved: year 1
    31.2 and 31.2 s → 25.2 and 25.2 s (−19 %), year 2 24.2 and 24.1 → 20.1 and 20.1 s (−17 %); 59.5 to 60 fps.
    `maxLoop1938.spec.ts`: a command given at Max applied; a pause taken 3 to 6 ticks after the worker's tick was asked
    and the date held, 16 of 16 under eight workers. The 250 ms of this AT is not what the spec holds (ADR-1156: ticks
    and frames, not the wall): alone the pause was taken in 25 to 38 ms (12 runs); under eight workers two of sixteen
    read over 300 ms with 3 and 4 ticks run. The whole browser suite on the GPU: 551 of 551.
- [x] R227 **Fire records nobody draws.** Combat works out each shot's two element places and a record
  (`World.out.fires`) that the worker throws away unless the view draws elements (T1.5 and closer), and a headless
  run always. AT: with no reader (the headless runner; the worker while its subscription draws no elements) seed 99's
  first two years end at the same hash (`9e8dd1b1`) with combat's mean a tick at least 15 % under HEAD's (a trial: 22 %,
  the tick 3 %); with a reader the records of a war world's hours are HEAD's, number for number (a unit test); the
  specs of the fire drawn pass.
  - Done: ADR-1158. `FireLog.wanted`, set by the reader: the worker before each step as its subscription draws
    elements, `Sim.step` with no taker of its outputs, and the headless runner, the soak and the replay's build (not
    the sweeps' runner, as first committed: its `fleetsStand` reads the volleys, and `aiSweep3` was red without them;
    taken out the same day). While false `combat`, `navalCombat` and `bombardment` write no record and work out no place for one.
    Two years of seed 99 with no reader, arms at once and swapped: the hash `9e8dd1b1` on both, combat 0.390 and 0.382
    → 0.301 and 0.302 ms a tick (−22 %), the tick 2.41 and 2.34 → 2.31 and 2.29. With a reader, against the commit
    before (a scratch test run on both, not kept: a second pin): days 20, 70 and 179 of seed 99, three days each, the
    same 87,188, 104,891 and 14,119 records (ships' guns 656, torpedoes 319, a bombardment's 208 among them), the same
    hash of every number. `fireWanted1938.test.ts` (kept): with no reader no record is written and the state is the
    same; the worker asks for none at T0 and T1, for them at T2. The whole browser suite on the GPU, the gate's run:
    550 of 551 (`relationsTap1938`'s first test under eight workers, green alone: R232).
- [x] R228 **On the S map a sailing fleet's water point is searched for each hour.** `World.seaPoint` asks the fine
  mask on every call (`waterPoint`, `farPoint`), 16 × 16 pixels a cell on S against 8 × 8 on M: S ticks slower than M
  (2.63 against 2.31 ms over three years of seed 99, `farPoint` 28 % of S's time). Kept by cell, as `cellPoint` keeps
  the land's. AT: three years of seed 99 at S end at HEAD's hash (`83341f24`) and tick at or under M's in the same
  arms; `farPoint` under 2 % of S's sampled time; the pin unchanged.
  - Done: `World.seaPoint` keeps each coastal cell's point (for the mask as it is, `LandMask.version`, which
    `addIslet` counts up, and the map's looping), and `farPoint` reads the cell and the eight about it once and leaves a
    pixel that cannot win: the kept points alone left it at 4.5 % of S (each cell's first search, the land's too), now
    0.2 %. Three years of seed 99, arms at once and swapped. S: the hash `83341f24` on both, the tick 2.49 and 2.52 →
    1.56 and 1.58 ms (−37 %), movement 1.03 → 0.21, ticks over 16 ms 686 → 199. M: the hash `32ec3f7f` on both, 2.15
    and 2.14 → 2.07 and 2.11 ms. S a quarter under M (1.59 and 1.54 against 2.09 and 2.11, arms at once). `landMask.test`: the
    search's points are those of the search before on every cell of rough maps at 4, 8 and 16 px a cell, looping and
    not. `seaPointKept.test`: a point searched for once, and again after the mask or the looping changes.
    `worldTemplate.test` lists the kept points among the derived fields (not listed, its comparison printed the 16 MB
    mask they hold and its worker ran out of memory: R230). The pin unchanged. No ADR (a speed-up with no rule in
    it, as R220).
- [x] R229 **`fightSeen1938`'s Japan case times out waiting for a section that is never asked for again** (found by
  R227's run of the whole browser suite; red 1 of 3 on `d547cda1`, before this batch, and 3 of 3 and 2 of 2 on later
  builds, on the GPU). `settleAtZoom` (ADR-1156) waits for a section taken within 1 % of the camera's m/px. A paused
  view asks only when its subscription's key changes, and a flight's last stretch can end inside the key it last asked
  with: a section of 19.7 m/px under a camera at rest at 20, and no other would come. AT: the Japan and the Germany
  case 10 of 10 on the GPU; the whole browser suite green with it.
  - Done: `settleAtZoom` sends the view's own subscription again while the camera is at rest and the section's zoom is
    off (the worker answers with the section as it is). What the specs measure is unchanged. `fightSeen1938` both
    cases × 5: 10 of 10. The whole browser suite, the gate's run: 550 of 551, `relationsTap1938`'s first
    test red under eight workers and green alone (R232; written here at first as its boot's timeout, which was the
    run before). No ADR (ADR-914: ADR-1156's helper mended).
- [x] R230 **The gate calls a unit run green when a test file's worker crashed** (found by R228's first gate run).
  `worldTemplate.test.ts`'s worker ran out of memory (R228's own slip, mended there); vitest reported "1 error" and
  434 of 436 files with no test of that file red, and `npm run check` ran the one red test it had a name for again
  alone and ended green: the file's five tests never ran. `gateReview.test.ts` holds "a file red with no test red"
  and "a run failed with no red named", not a run with a red named and a file lost beside it. AT: a unit run that
  loses a file (a fixture whose worker exits) is red unless that file, run again alone, passes; `gateReview.test.ts`
  holds the case, and the same for a browser spec's worker.
  - Done (ADR-1159): vitest's report gives a lost file as passed, its tests 'pending' or none; the gate reads that as
    the file red (`vitestRed`), runs it again alone, and holds every red of that run against it (`again` kept only an
    id red in both runs: a lost file whose test fails alone would have ended green one step later). A run alone that
    fails with nothing named clears nothing. The browser side: Playwright fails the test a dying worker was running
    and runs the rest elsewhere; the gap was a worker that goes as it loads the file, whose later tests "did not run"
    and read `ok`: red by name now (`playwrightRed`). Held by each stage run for real on a fixture whose workers kill
    themselves, under the vitest and Playwright installed: five new tests, red on HEAD's reading (the unit stage
    there names no red at all). No false alarm on the whole unit suite's report (510 files) or the whole browser
    suite's (551 tests). One change the AT asked for: a run that lost a file and named nothing else was red as it
    stood, and is now red only if the file fails alone too. The nightly run's unit stage reads with the same code.
- [x] R231 **The gate calls a unit run green when vitest caught an error outside the tests beside a red test** (found
  by R230's fixtures). An unhandled rejection in a test file fails vitest's run ("Errors 1 error", exit 1) and leaves
  no trace in the JSON report the gate reads (the fixture's: 7 of 7 tests passed). With no red named the run is the
  stage's red; beside a test red by name that passes alone the gate ends green, as it did with R230's lost file. AT:
  a unit run with such an error beside a red that passes alone is red (by the file vitest says it came from, where it
  names one), unless that file's run alone is clean; `gateReview.test.ts` holds it with a fixture run for real.
  - Done (ADR-1160): vitest hands such errors to its reporters alone, and its JSON reporter leaves them out; the
    gate's vitest runs take a reporter of the gate's own beside it (`tools/gate/vitestErrors.ts`), which writes them
    to a file beside the report. An error with a test file to its name (an Error rejected or thrown while that file's
    worker runs; a lost worker, by the pool's words) is that file's red as a whole, run again alone and red unless
    that run is clean (`errorRed`). One with none is the run's own red, which no run alone clears:
    a rejection of a value that is no Error, and a worker that went as it started, whose file is in no report at all
    (R230's reading of the report's shape cannot see it). `gateReview.test.ts`: the shapes, and the unit stage run for
    real on two fixtures, each beside a test red in the first run alone: an error each time (red: the file) with one
    in the first run alone (run again, clean, not red); an error of no file (red: `stage:test`). On HEAD's reader both
    runs named nothing red. A run alone in which the file is red as a whole clears no red of it (`again`): read by
    its file, an error left in the run alone would have cleared a test red by name beside it (found in review before
    the push; a shape and a fourth file of the fixture hold it). R230's fixture holds the pool's wording: no
    `stage:test` among its reds. Healthy
    runs record no error: the whole unit suite with the reporter (510 files, 2,652 tests; two red by name, a timing
    test and `specRefs` on this item's own SPEC line before git knew the new file), the pin under the sweep config, a
    related run that reaches no test (both files written, nothing red).
    Looser in one case, as the AT has it: a run whose one fault was such an error was red as it stood, and is now
    judged by the file's run alone. Not seen: Linux (the nightly run's unit stage is the first run there), and the
    ten-year suite's whole report.
- [x] R232 **`relationsTap1938`'s first test is red in three of five runs of the whole browser suite** (read in R230's
  runs). "a phone: the first tap after a drag, and after a pinch, selects the nation tapped": after the pinch its
  `node` finds no nation's circle inside the graph, and the tap has nothing to aim at (line 74, `n` null). So in the
  gate's run of 2026-11-26 and both whole runs of 2026-11-27, under eight workers; green alone both times it was run so (14 of 14),
  so the gate passes it. Where it passes in the suite it takes 40 to 45 s. AT: the cause named from the trace of a
  red run; the test 20 of 20 with the suite running beside it, measuring what it measures now.
  - Done: the graph was opened before the year's statistics were in. They come a message behind the picture (0.1 s
    alone); under load the tap on Relations wins, the graph is laid out on the start's ties (65 nodes) and moved on
    to the year's from those places 30 ms later (73 nodes, 40 steps of the layout where a graph opened on the year's
    gets 300), and in that layout the test's pinch leaves two nations in view, both within the 30 px it keeps from
    the edge: none to tap. The spec waits for the statistics of the tick it stepped to, as `relations1938` does; its
    gestures, its picks and what it expects are as they were. Read from the traces of six red runs (the test eight
    times at once, 6 red of 8) against a green one: the same view at every step, the same 73 nations, other places
    from the first snapshot on. The order of the two messages is not in a trace: read from a copy of the test that
    logs them (four of eight at once opened on tick 0's statistics, each red), and forced on a quiet machine
    (Relations opened first, then the year stepped: red alone). With the wait: 8 of 8 eight at once, and 20 of 20
    with the whole suite beside it (the suite at its 8 workers, the 20 at 4 more: each 47 to 59 s, the last done
    seven minutes before the suite was). The suite's own copy, run after the 20 at the suite's own load, green too
    (42 s; the spec 14 of 14). The suite, twelve pages at once while the 20 ran: 550 of 551 (`heroes1938`'s T2 and T3
    test, run in that stretch, timed out a 60 s wait; green alone).
    No ADR (ADR-914: a spec's wait, as its neighbour has it). The worker is as it was: `step` is the tests' call alone.
- [x] R233 **A change of SPEC.md runs no test of it** (found by R231's whole unit run). `specRefs.test.ts` reads
  SPEC.md from the disk and no import reaches it, so the gate, sized by imports, runs nothing for a SPEC line, and a
  name that does not exist goes to `main`: R94a's `chromeCover1938`, red in the nightly run of 2026-11-16; R231's own
  line was red in its whole run until the new file was in git's index, which the checker reads. AT: a change of
  SPEC.md runs `specRefs.test.ts` in `npm run check` (`gate.test.ts` holds the plan), and a file SPEC cites counts
  as soon as it is in the working tree, added or not.
  - Done (ADR-1161): the test joins the gate's unit stage whenever a change can break a line of SPEC.md: SPEC.md
    itself, anything that is not a document (the test reads the tree's names and the code's words too: a file
    renamed or a name gone is a line's miss from the other side), a document gone from the disk (`touchesSpec`,
    `planUnit`). Documents alone with such a change run that test alone (`planGate`); other documents nothing, as
    before. The checker reads the working tree, a file added or not, less what is removed from the disk
    (`loadCorpus`). `gate.test.ts` and `specRefs.test.ts` hold it, four tests red on HEAD. Through the gate for
    real: SPEC.md alone citing a file that is not there: `test` alone, red twice, failed, the tree not recorded;
    the file made and not added: green; another document alone: nothing runs; `docs/PARITY.md` moved away: red.
    The test's file 1.63 → 2.03 s.
- [x] R234 **Two more specs open the relations graph a year on without the year's statistics** (found by R232).
  `relationsLabels1938.spec.ts` and `relationsNamed1938.spec.ts` step a year, wait for the picture's tick and open
  the graph, as `relationsTap1938`'s first test did. Under load the graph is then laid out on the start's ties and
  moved on (R232), so the labels they judge are of one layout or the other by the race. Both green so far. AT: each
  waits for the statistics of the tick it stepped to; eight at once each is green, and its graph's places are the
  same in every run (a digest of the nodes' places, as R232's probe read them).
  - Done: both wait for the statistics of the year before they open the graph, as R232's test does. Read by copies
    of the two specs that log the statistics' tick at the click and a digest of the nodes' places. With the wait: 28
    runs (20 eight at once, 8 two at once), the year's statistics in at every click, one layout a test in every
    run. On HEAD, eight at once: 12 of 20 runs had other places than those, in 6 of the 8 tests (the layout of a
    graph opened ahead of the year's statistics, as R232's forced order showed; the tick at the click does not tell
    them, it was the start's in all 20), and all 20 were green: the labels hold in either. The specs themselves
    eight at once: 8 of 8 and 12 of 12. No ADR (ADR-914: R232's wait).

## Batch 61 — what the user saw (reports of 2026-11-27 on)

- [x] R235 **The movement arrows mislead in the historical replay** (the user, with two pictures of 23 November 1939
  at Strasbourg, far and close: "I think the arrows are misleading here"). A bold arrow is an advance (R96: "only
  show arrows if a country is invading another country or pushing through a front"). On that day five German
  divisions stand in one cell on the Rhine, each under a bold arrow over it, and a French mountain division's points
  far into Germany, on a front the track holds until 10 May 1940: nothing is taken across it. AT: in the replay no
  bold arrow is drawn across a held front (23 November 1939 at Strasbourg at 1,000, 400 and 60 m/px; 4 September
  1939 there, while Poland is fought for; 5 April 1940 there, in the days of a stage elsewhere); the land fought for
  keeps its arrows (Poland that day, the West on 14 May 1940); a free game's advances are the same formations as
  before.
  - Done (ADR-1162): which marches are advances is asked of the world by the worker and sent with the snapshot
    (`FormationFlag.advancing`, `src/worker/advancing.ts`): the same marches, lines and reach as the view judged by,
    and of the land on a line one thing more, that the marcher may take it there today (`World.holdsLand`, by cell,
    as the territory system asks). Reproduced first: the replay (seed 1938) stepped to the day gives the user's two
    pictures, the same divisions by name. Of that day's 153 advances (the West 58, China 95) none can take a cell;
    three weeks on 147 of their formations are in the same cell. After: 153 → 0 that day; 4 September 1939 112 → 17,
    Germany's 7 and Poland's 10 in Poland, none in the West; 5 April 1940, in the days of Norway's stage, none (84 in
    the West with the hold asked of the two nations alone); 14 May 1940 186 → 92, 87 in the West. A free game
    (seed 99, days 120, 240, 365): 90, 25 and 73 advances, the same ids before and after. Held by `moveArrows.test.ts`,
    `advancing1938h.test.ts` (a held front with a stage: none across it, the taker's onto the stage's land alone) and
    `arrowsHeld1938h.spec.ts` (the replay on four days; pictures in `docs/evidence/R235/`). With France looked
    at, its orders across the front are still drawn faint, as any nation's are: R236's.
- [x] R236 **In the historical replay a march whose way crosses a held front stands at it until the hold ends** (found
  by R235). A march waits where its next step is onto an enemy's land until the territory system takes the cell
  (`waitsForFront`, PLAN 1.14), and across a front the track holds no cell is taken (`holdsLand`, R62f2): the
  formation stands with its order for as long as the hold lasts. On 23 November 1939 of the replay 153 marches go
  over a held foe's land (the West 58, China 95); three weeks on 147 of their formations are in the same cell, 145
  with the same order: five German divisions in one cell at Strasbourg, ordered 4 to 7 cells along their own front.
  The cause is read from the code and the lines of the orders, not yet from a run with the wait taken out. AT: the
  cause shown by such a run; on that day and three weeks on no land formation behind a held front has stood 7 days
  with one order whose way is over the held foe's land (it goes round by its own side's land, or the order ends);
  the replay's ten-year tests green, the pin unchanged.
  - Done (ADR-1163): the land of a foe whose front the track holds is closed to a nation's ways as a third
    nation's is (`passageOf`, by `World.holdsPlan`). A way goes round by its own side's land, or the order is
    refused; a march under way whose next step is onto such land is made again where it stands, or halts; in the
    days of a stage between the two the land is open as in any war. The cause by a run: from one save of 23
    November 1939, 155 marches wait at a front, the land ahead of all 155 held, and 21 days on 149 are in the same
    cell with the same order; the same save with the holds taken out, 11 stand so after five days, 4 after 21. Both
    rules by one probe from the replay's start, read as the checker reads (a week or more at a held front with one
    order): 23 November 147 → 0, 14 December 157 → 0; on five more days from 10 September 1939 to 9 May 1940, 98
    to 181 → 0. The day's land marches 269 → 141. Held by `heldFrontMarch1938h.test.ts` (four tests on a timeline
    of its own, three red before) and by the track's checker (`stand`: every day of the replay to 1991, no line on
    its own seed, no warning on seeds 1 to 5). The replay's ten-year tests green (ten files): Paris Germany's from
    10 June 1940 as before, 1,009 French cells on 22 June (936; the bar 500); 40 of the 44 map lines the same, four
    of control by 0.05 points at most; the China front 15.2 % at its start and a year on. The pin unchanged; a
    free game's hash the same by both rules. The tick: the replay's first eight years 1.94 → 1.76 ms, a free game
    the same (pairs at once). `arrowsHeld1938h.spec.ts` by hand, green; the Rhine that day in
    `docs/evidence/R236/`.
    Read on R237's and R238's code, which this item's measuring found and which came first: the probes and the
    checker ask between ticks. The AT's two days by its letter: from ground not the held foe's, none and none;
    on the held foe's own ground five British divisions by the Polish Corridor on 23 November and three on 14
    December still stand a week or more with one order. Ticked on the reading that "behind a held front" is on
    one's own side of it (ADR-1164, the user's decision: "Keep the tick"); those divisions are R239's.
- [x] R237 **A question asked of the historical track between two ticks changes the replay's course** (found by
  R236's probes: two runs of the replay under one rule stood on different hashes on 23 November 1939, one of them
  asking `holdsPlan` once a day). The track keeps the stages whose days of fighting are open in an hour
  (`Track.openStages`, R66d), made at the hour's first asking, of the events applied by then and of the men then in
  each stage's area (ADR-977). A tick's number is the coming hour's from the end of the tick before, so a question
  between two ticks makes the list before the hour's commands and events, and the hour's systems go by it: at a
  stage's own hour its land is fought for an hour more. Since R235 the worker asks at every picture (which marches
  are advances: `World.holdsLand`), so the replay in the page went by when its pictures were made: I4 (SPEC §2.6)
  broken for a world with a track, on `main` since R235. AT: the replay stepped through the worker with a picture a
  day stands on the plain run's hash on every marked day; a test red before; the plain run's own course unchanged
  (its hashes, and the ten-year tests' figures the nightly run's).
  - Done: the list is a tick's own: `step` begins by forgetting it (`Track.tickBegins`). The replay on its own seed
    to 23 November 1939, before: the plain run 1a5c4ff4 that day; through the worker's server with a picture of
    the world a day, another hash by day 300 and 58a39e70 that day; by `holdsLand` or `holdsPlan` alone, asked
    once a day, the plain run's hash to day 620 and another from day 650. After: each of them the plain run's hash
    on every marked day, the plain run's own as before, and so to 26 July 1953 (twelve marks). Held by
    `trackAsked1938h.test.ts`: two tests of the mechanism, red before (a stage's own hour; a stage's days with the
    taker's men gone within the tick), and four of I4 on a world with a track, on two seeds (the three questions of
    a hold after every tick; the worker's picture after every tick, 384 of them, each asking), green before too
    in that small world. No ADR (ADR-914: a mend of I4; it stands on ADR-974, ADR-977 and ADR-1162). What R235
    read of the replay in the page after its change (its spec's prints, its pictures) was of a page that asked;
    its spec holds bars, not those figures.
- [x] R238 **Within an hour the open stages are made before the hour's later events** (found by R237). The list of
  an hour's open stages is made at its first asking and kept for the hour. An arrival of the timeline's asks while
  the hour's events are applied (`forces`, R82b: whether its cell is the land of a stage open for its side), so the
  list is of the men and events up to that arrival: the arrivals and stages that follow in the same hour are not
  in it, and the hour's systems go by it. With the list made again after each event (kept by the events applied,
  as the holds' list is, R72b) the replay goes another way from 1944 on: its hash the same on 1 January 1944,
  another on 1 January 1945 and after. Measured so, on R237's code: the ten-year tests green, the 44 map lines
  and the figures of `historyMatch1938h` and `chinaFront1938h` the nightly run's to the last digit; of the ten
  free worlds after 1953 one meets its first war a day sooner (16 days for 17). AT: a test red before (two events
  of one hour, the list asked between them); the replay's ten-year tests green with their figures named; the pin
  unchanged.
  - Done: the track forgets the list after each event it applies (`Track.eventApplied`, in `applyDue`), as `step`
    does when a tick begins (R237): whoever asks next makes it of the hour so far, and the hour's systems of all
    its events. Held by `trackHourEvents1938h.test.ts`, two tests red before, each with an arrival that asks as
    Normandy's did (on land an enemy holds, its owner's at peace with the arrival's nation): a stage applied after
    it in the same hour (the hold must stand on the stage's land in that hour); forty divisions set down after it
    in an hour of a stage's days, Germany far outnumbered before them (the stage must be open by the men of the
    hour). The replay's course: the plain run's hash the same on every day of 1944 to 5 June and another from 6
    June, the hour of the D-Day arrivals (several `forces` events in one hour, the first of them asking). The
    ten-year tests on this code, green (ten files): the 44 map lines and every figure of `historyMatch1938h` and
    `chinaFront1938h` the nightly run's; the ten free worlds' days to a first war the same but one (16 for 17).
    The four browser specs of the replay by hand, 14 of 14. The pin unchanged. No ADR (ADR-914: a mend of
    ADR-974's "a stage not yet applied" and ADR-977's "this hour").
- [x] R239 **In the historical replay a formation on a held foe's own ground waits there until the hold ends** (found
  by R236). The land of a foe whose front the track holds is closed ground, and who stands on closed ground may
  walk on it and out of it (ADR-149): but each step to that foe's next cell waits for the front (PLAN 1.14), which
  no one moves. So a formation the hold found on the foe's ground stands with its order, as R236's marches did at
  the front. On the replay's own seed, in formation-days past a week (`TrackRun.stranded`, printed by
  `historyTrack1938h`): the United States' on the National Liberation Front's (Vietnam) 60,578, South Korea's
  there 882, the Philippines' there 588, French Indochina's there 100; the Soviet Union's on Germany's 1,754, the
  United Kingdom's on Germany's 451, Italy's on Germany's 108; Ceylon's on Japan's 773, Australia's there 112;
  Hungary's on the Soviet Union's 198, Germany's there 172, Slovakia's there 42; Liberia's on the NPFL's 142;
  Germany's on France's 113; the Khmer Rouge's on Cambodia's 4; Japan's on the United States' 2. The British are
  five divisions on German-held ground by the Polish Corridor on 23 November 1939 and three on 14 December (six on
  15 October, none by February), on land Poland's at the start but one: the hold of the West stands between them
  and the Germans from 3 September, Poland's fall left them behind its line, and its partition is a `transfer`,
  which sets no formation down as a stage does (R66c). How the others came to stand there is not read yet (a line
  the timeline drew over them, or ground walked onto in a stage's days). AT: each pair's cause read from a run; on
  the replay's own seed no formation waits `STAND_DAYS` on a held foe's own ground (`stranded` empty, the checker's
  `stand` rule without its exception: it walks out, or is set down on its own side's land); the replay's ten-year
  tests green, the pin unchanged.
  - Done (ADR-1166): at a day's first hour, after the hour's events, the track sets down every land formation that
    stands, or waits on a march, on the ground of a foe its nation holds a front with, no stage's days open between
    the two (`setDownLeft`): on the nearest land of its own or an ally's, two to a cell, as a stage's cut-off
    formations are (R66c); with none within 40 cells it is taken off, its men back to the pool. Left alone: a march
    that does not wait, one aboard, one a `forces` event keeps for its stage, a hero with no land in reach. Each
    pair's cause, from a run of R241's code to 1991 (539 episodes of 447 formations, 75,055 formation-days): the
    ground changed under 366 (a `transfer` sets nothing down: the Easter Offensive of 1 April 1972 under 330
    American formations, 157 of them gone before the armistice; Poland's partition under 7 British; France freed
    under 6 German; Liberia, the Sinai, Manchukuo's end); a hold closed over 99 on ground already the foe's (61
    Soviet on Germany's from 2 December 1941; Ceylon's and Australia's on Japan's; Hungary's and Slovakia's on the
    Soviet Union's); 30 Soviet arrivals on land Germany had taken; war come to 5 where they stood (Italy's on
    Germany's, October 1943); 39 walked onto it, 30 of them for a day. With the rule 121 formation-days, the longest
    5; set down 195, taken off 21 (the United States' on the NLF's ground 74 and none; the United Kingdom's on
    Germany's 5 and 10; Italy's on Germany's none and 6). The checker's `stand` without its exception, and a rule
    `left` beside it (no formation in one cell of a held foe's ground at two days' first hours running, nor on that
    ground seven days running in whatever cells): no line on the own seed to 1991, no warning on seeds 1 to 4, one
    on seed 5 (R243); with the rule switched off both tell the British by the Corridor within 790 days. Held by `trackLeft1938h.test.ts`, seven tests red before (land ceded at hours 0, 1 and
    23; a stage's days and their end; an ally's land; none in reach; those left alone). The replay's ten-year tests
    green (ten files): Paris Germany's from 14 June 1940 (10 June), 766 French cells on 22 June (1,009; the bar
    500), 9,401 Soviet cells after 1 December 1941 (11,020; the bar 6,000), the Soviet army 4,365k (4,005k); 39 of
    the 44 map lines the same, five of control inside their bars; the China front and the free worlds as before.
    The course is the same to 28 September 1939 and another from 1 October; the look alone changes nothing (19
    marked days to 1991). The pin unchanged; a free game the same hash and tick. The replay's tick 1.78 → 1.90 ms
    over its first eight years, five sixths of it the land combat of 1943 and 1944 in this course; the look itself
    0.002 ms a tick. The replay's five browser specs by hand, 15 of 15. The census's bars kept on the own seed (both
    near 20 of 25 large land fronts; both engaged 11 for 14, R66d's bar 9; Uranus engaged at its hour; D-Day 101 of
    200 samples) and, with the rule, on 37701 and 38701. Left, R243: guests on a front fought beside them (Germany's
    and Romania's on Finland's land in 1944) are set down a cell back each morning as the Soviet Union takes the
    cell they stood on: five days running at the most on the own seed, seven on seed 5.
- [ ] R243 **In the replay a guest on an ally's front that is fought falls back a cell a day, held off from the foe
  that takes it** (found by R239; to be done by the rule the user chose on 2026-11-27, "Yes try it", and first of
  the open items, "Yes, R243 first": ADR-1167). A hold is between two nations wherever they stand (ADR-929). The Finnish front's hold ends on 9 June
  1944 and the Soviet Union fights Finland freely to the armistice of 19 September, taking its land cell by cell;
  the Eastern Front's hold (Germany, Italy, Romania, Hungary against the Soviet Union) stands to May 1945. So
  German and Romanian formations on Finland's land neither fight for the cell they stand on nor leave it. Since
  R239 the track sets such a formation down on Finland's next cell at the day's first hour, and that cell is taken
  by 08:00 the same day (read hour by hour, 20 to 22 August 1944: a German and a Romanian formation; a Finnish one
  the same on Germany's land on 18 November 1941, before the Eastern Front's hold). On the replay's own seed five
  days running at the most; on seed 5 a Romanian formation seven days running to 22 August 1944 (`WARNING
  historyTrack`: `left`). The rule to try, the small version of ADR-1167's cure: a formation on the land of an ally
  in its war is held, or not, as that ally is against the foe it faces there (where it stands decides, not whose
  it is). So a German on Finland's land fights the Soviet Union beside Finland from 9 June 1944, and one on an
  ally's frozen front is frozen there, its own nation's front free or not. ADR-1167 lists what the item settles,
  and first of all whether a cell still goes to the foe under a guest that defends it (territory asks by the cells'
  holders: if it does, opening combat alone is not enough, and the guest counts for its host there or retreats as
  its host's formations do); then: combat asks by the formations' nations and has their cells; planning and ways
  ask by the pair; R239's look and the checker's `left` must not take a guest out of its fight. AT: a test
  red before (a guest on an ally's land whose front with a foe is free, its own nation held off from that foe: it
  fights for the cell beside its ally; one on an ally's frozen front does not, its own nation's front free); on
  the replay's six seeds no `left` or `stand` line and no warning (seed 5's gone); the replay's ten-year tests
  green, their figures named against R239's run (kept in `.cache/r239/r239_all.log.txt`, or run again on R239's
  commit); the census's bars on
  seeds 1938, 37701 and 38701 (both engaged at 9 large land fronts or more on the own seed, Uranus engaged at its
  hour, D-Day in a third of its samples, the Sixth Army near Stalingrad); the tick logged; the pin unchanged. If a
  bar is missed: a BLOCKERS entry, and the choice back to the user (park R243, or ADR-1167's full cure).
- [ ] R240 **In the replay a God Mode march across a held front is refused for the wrong reason, and ends the replay
  all the same** (found by R236's review). A command applied while the replay runs ends it (R62j), and
  `moveFormation` counts as applied whether or not its order is given (a refused order is told by `MoveRejected`).
  Before R236 a march ordered across a held front was given, and the replay it ended left it free to go. Since
  R236 the order is judged by the hold that its own command is about to end: refused as `NoRoute` ("there is no
  way by land that keeps off the ground of nations outside its wars", which the held foe is not), the formation
  stays, the replay ends; the same order given again is carried out. Read on a timeline of its own (Germany and
  Poland held, a German division ordered onto Poland's land three cells off): `MoveRejected` with `NoRoute`,
  `CommandApplied`, `TrackEnded` by intervention, the division standing; before R236 `CommandApplied`,
  `TrackEnded`, the division on the march. AT: such an order is carried out by the world its command sets free, as
  before R236, or is refused with a reason that names the hold and leaves the replay running; a test sends the
  command across a held front, and across a nation outside the war, where today's reason is the right one.
- [x] R241 **At a far zoom the arrows cross far into the enemy's land; close up they stay in their own** (the user,
  2026-11-27, of the report R235 took up: "The issue was that the arrows in far zoom looked like they crossed far
  into enemy territory, but at close zoom it looked like it was in held territory for the French divisions"). An
  arrow is drawn along the first 70 to 136 px of its march's line at every zoom (ADR-1074), a bold one never under
  26 px (R96), and the line of a march on land is straight from the formation to its target: the same arrow is a
  few km inside its own cell at 60 m/px and 100 km past the front at 1,000. The user's own scene has no arrow since
  R235 and R236 (the Rhine was a held front); on a front fought for it reads the same way. AT: on the replay's 14
  May 1940 in the West and in a free game (seed 99, day 120), at 60, 150, 400 and 1,000 m/px no bold arrow lies more
  than a cell and a half past the front; at 2,500 and 5,000 m/px, where a cell is under an arrow's least length,
  none further past it than that length; the faint arrows of a nation looked at lie on its own side; a spec red
  before; the frame budgets kept.
  - Done (ADR-1165): an advance's arrow ends at the cell its march presses on, the first of its route that an enemy
    holds and it may take: where it will wait (PLAN 1.14). The worker finds it by the route (`pressesAt`) and sends
    it with the snapshot (`front`). Which march is an advance is asked of the route too, no longer of the line: on
    14 May 1940, of Germany's 30 advances in the West by the line, 14 were marches along its own side of the front
    and 6 not yet within reach. A march behind the lines is drawn as far as its own side goes (`ownSideLength`).
    By `arrowReach1938h.spec.ts`, red before in ten places, the part of a bold arrow past the front, median and
    most, in cells, before → after: the West at 400 m/px 0.49 and 2.16 → 0.52 and 0.87; at 1,000 1.66 and 5.16 →
    0.67 and 1.33 (more than a cell and a half past: 13 of 23 arrows → none of 27); at 2,500 3.32 and 13.23 → 2.56
    and 3.32; at 5,000 6.15 and 23.91 → 5.88 and 6.64. The free game at 1,000 m/px 2.11 and 4.15 → 0.82 and 1.47
    (14 of 21 → none of 22); at 5,000 6.30 and 22.91 → 5.88 and 6.64. Faint arrows over an enemy's land at 5,000
    m/px: 0.51 and 3.32 cells at the most → none. Past 1,000 m/px a cell is smaller than the least length (26 px
    are 3.3 cells at 2,500 m/px, 6.6 at 5,000): there an arrow is that sign, R96's, and no longer. Held too by
    `moveArrows.test.ts` (the route's rule, case for case with the line's it replaces) and `advancing1938h.test.ts`
    (a march over its own land whose line lies over a corner of the enemy's is no advance; the line's rule said
    one). The worker's question 0.06 ms a snapshot as before; `npm run bench -- G` PASS (T0 402 fps, T2 151 fps).
    `orderLines1938.spec.ts` and `arrowsHeld1938h.spec.ts` by hand, green. The first's guard that the arrows
    are on the names' canvas (the points of their middle lines there, 21 an arrow) is more than 20 where it was
    more than 50: at 1,500 m/px that war's 12 advances in view were 3 arrows, its 11 are 2. The advancing
    formations in view that are in no arrow at all: 1 to 3 on three scenes before, none to 6 after (R242).
    Pictures before and after at 1,000 and 400 m/px in `docs/evidence/R241/`.
- [ ] R242 **An advance whose arrow is cut away by one it would cross has no arrow** (found by R241's review). An
  arrow that would cross another of its nation stops before it (`cutAtCrossing`), and one left shorter than
  `ARROW_SHORTEST_PX` is not drawn: its formations are in no arrow, and their men in no arrow's width. Counted on
  three scenes, the advancing formations well inside the view that are in no bold arrow: Germany on Poland in a
  free game (seed 1938, hours 48 and 96) none or 1 of 11 to 21 at 300 to 1,500 m/px, 5 of 37 at 4,000; the West on
  14 May 1940 1 of 60 at 1,000 m/px, 1 of 31 at 400, 6 of 60 at 1,500, 2 of 60 at 2,500 (before R241: 2 of 71, 3 of
  48, 3 of 71, 3 of 71). AT: on those scenes at those zooms every advancing formation in view is in a bold arrow
  (one cut away joins the arrow that cuts it, its men in that arrow's width); the frame budgets kept.

## Released

- `release-2026-11-03b` (2026-11-03): R0a–R0i and Batch 1 (R1–R5, R7–R15), in CHANGELOG.md for
  players; the items with their evidence in `docs/history/ROADMAP-release-2026-11-03b.md`.
- `release-2026-11-10` (2026-11-10): Later (R6, R16–R44) and Batches 3–13 (R34–R58), and R61a of the release
  checks, in CHANGELOG.md for players; the items with their evidence in
  `docs/history/ROADMAP-release-2026-11-10.md`.
- `release-2026-11-11` (2026-11-11): Batches 14–16 (R59, R60, R61a's follow-ups, R62 the historical track, R63, R64), in
  CHANGELOG.md for players; the items with their evidence in `docs/history/ROADMAP-release-2026-11-11.md`.
- `release-2026-11-13` (2026-11-13): Batches 17–23 (R65–R79: armies on the replay's fronts, Cold War blocs, a start from any
  year, the replay to 1975, a faster tick, runs 63–67's findings, the gate on the GPU), in CHANGELOG.md for players; the
  items with their evidence in `docs/history/ROADMAP-release-2026-11-13.md`.
- `release-2026-11-15` (2026-11-15): Batches 24–31 (R80–R88: the replay to 1991, run 67's "not 9" items, the year's
  card, runs 68–72's findings, the release checks), in CHANGELOG.md for players; the items with their evidence in
  `docs/history/ROADMAP-release-2026-11-15.md`.
- `release-2026-11-17` (2026-11-17): Batches 32–42 (R89–R137: the map's look, a war's opening and its fronts, the review
  of the game's pictures, runs 73–75's findings), in CHANGELOG.md for players; the items with their evidence in
  `docs/history/ROADMAP-release-2026-11-17.md`.
- `release-2026-11-19` (2026-11-19): Batches 43–53 (R138–R199: the director, the borders' time-lapse, History's rows to their place,
  the sea lift, the phone's layouts and war row, runs 76–85's findings; the first release on one focused run,
  ADR-1138), in CHANGELOG.md for players; the items with their evidence in `docs/history/ROADMAP-release-2026-11-19.md`.
- `release-2026-11-20` (2026-11-20): Batches 54–59 (R200–R224: the narrow desk's legend and war row, the phones' bars, the long step's
  world, the peace line of few nations and its reasons in History, wars only where an army stands or a lift carries it,
  a massing's army that finds a way, runs 86–91's findings), in CHANGELOG.md for players; the items with their evidence
  in `docs/history/ROADMAP-release-2026-11-20.md`.
