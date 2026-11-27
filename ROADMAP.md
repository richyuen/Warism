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
- [ ] R227 **Fire records nobody draws.** Combat works out each shot's two element places and a record
  (`World.out.fires`) that the worker throws away unless the view draws elements (T1.5 and closer), and a headless
  run always. AT: with no reader (the headless runner; the worker while its subscription draws no elements) seed 99's
  first two years end at the same hash (`9e8dd1b1`) with combat's mean a tick at least 15 % under HEAD's (a trial: 22 %,
  the tick 3 %); with a reader the records of a war world's hours are HEAD's, number for number (a unit test); the
  specs of the fire drawn pass.
- [ ] R228 **On the S map a sailing fleet's water point is searched for each hour.** `World.seaPoint` asks the fine
  mask on every call (`waterPoint`, `farPoint`), 16 × 16 pixels a cell on S against 8 × 8 on M: S ticks slower than M
  (2.63 against 2.31 ms over three years of seed 99, `farPoint` 28 % of S's time). Kept by cell, as `cellPoint` keeps
  the land's. AT: three years of seed 99 at S end at HEAD's hash (`83341f24`) and tick at or under M's in the same
  arms; `farPoint` under 2 % of S's sampled time; the pin unchanged.
- [x] R229 **`fightSeen1938`'s Japan case times out waiting for a section that is never asked for again** (found by
  R227's run of the whole browser suite; red 1 of 3 on `d547cda1`, before this batch, and 3 of 3 and 2 of 2 on later
  builds, on the GPU). `settleAtZoom` (ADR-1156) waits for a section taken within 1 % of the camera's m/px. A paused
  view asks only when its subscription's key changes, and a flight's last stretch can end inside the key it last asked
  with: a section of 19.7 m/px under a camera at rest at 20, and no other would come. AT: the Japan and the Germany
  case 10 of 10 on the GPU; the whole browser suite green with it.
  - Done: `settleAtZoom` sends the view's own subscription again while the camera is at rest and the section's zoom is
    off (the worker answers with the section as it is). What the specs measure is unchanged. `fightSeen1938` both
    cases × 5: 10 of 10. The whole browser suite, the gate's run: 550 of 551, `relationsTap1938`'s boot
    timed out under eight workers and green alone (as at the release). No ADR (ADR-914: ADR-1156's helper mended).

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
