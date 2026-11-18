# BLOCKERS

Tasks that failed 3 attempts or cannot proceed, with what was tried. An entry
resolved is marked **RESOLVED** with the date and fix and moved to `docs/BLOCKERS_DONE.md` (ADR-804).

## Open

### shipMarks1938's T3 test, again: red at 16.5 px against 17 in a gate and on HEAD (2026-11-18); on `tools/gate/knownRed.json`
- **The bar:** at 20 m/px on the fleets of seed 2251's first Italy-UK sea battle, a destroyer's median hull length over
  17 px (`shipMarks1938.spec.ts`, PLAN 7.35c; about 19 by the rule). Resolved once on 2026-11-03 (`docs/BLOCKERS_DONE.md`).
- **What was read:** red in R139's gate and again alone, 16.5 px (7 destroyers). By hand on the R139 code 7 of 7 green
  (17.5-18.5); on 8fe68e51 without R139, 1 of 2 red at 16.5, the same fleets at (1074.8, 329.3) and (1071.9, 330.5),
  per ship 15.5-17.5 in the red run and 15.5-20 in the green. The world is the same each run; the frames' timing moves
  the measure, as on 2026-11-02. No drawing of ships changed.
- **Left:** a measure that does not hang on one frame (the median over several draws, or ships at rest); the test is not
  changed here. It leaves the list when it passes in a review.

### R81h: the critic's 52.5-55.8 "fps" at 120 m/px is the view's draws, not its frames; the bar read as written missed (2026-11-14)
- **The bar:** on 7019's year-20 world at Max, the minimum of the critic's samples at 120 m/px at least 57 fps, the
  other zooms kept; or the cause answered with numbers here.
- **What was read** (`tools/diag/lookFps.ts` with `FIXED=1`, the critic's way: the fight picked once at load and the
  camera left there; RTX 4070 Ti, HEAD `c42e975e`, 7019 year 20 built at HEAD): at 120 m/px the spot holds 0
  formations by then. The view's draws a second (`view.frames`, the critic's number) 48.8-57.5; the browser's frames
  in the same 4 s 60.0-60.2, gaps p95 17.6-18.0 ms; a draw forced on every frame 58.8-60 frames/s at 0.7 ms a draw
  (longest 1.9). 30 m/px the same (draws 47.3-55.1, frames 60). With the camera put on a live fight before each
  sample (`FIXED` unset, R53m's way) the draws are 60 at every zoom.
- **The cause:** `MapView.frameAt` draws only when something on screen can have changed (a snapshot within 1.5 ticks,
  the camera, an animation; "an idle map costs nothing"). Over an empty patch at Max some frames have none of these,
  and the view skips their draw. The screen keeps the last frame, the same picture. No frame is slow.
- **Left:** nothing in the game. Drawing every frame would make the count 60 for no picture changed. The critic's
  probe reads the browser's frames, or `FIXED=0`'s live fight, to judge frame rate. No ROADMAP item: the cause is in
  the measure. Nothing waits on the user.

### PLAN 7.83c: supply's beach layer −7 %, short of `dd3b730` + 0.03 (2026-10-23)
- **The bar:** supply's mean a tick on a year from HEAD's year-4 save of seed 99 at most `dd3b730`'s rules'
  + 0.03 (0.168 ms; 0.153 against the pairs' own HEAD), the year's hash f278491d and the pin unchanged.
- **What moved** (`docs/evidence/7.83/c.md`): the beach layer an array by cell (`SparseLayer`), the flood's
  marks the layer itself; hash f278491d, random and toy worlds the same: 0.202 → 0.188 ms (three swapped
  pairs); refreshBeaches 558 → 389 ms a year profiled, the per-formation loop near `dd3b730`'s.
- **What is left:** about 0.04 ms a tick: the coast scan (27,619 coast cells asked their network each
  refresh, scattered over the grid; the network changed at all 240 refresh hours read, so last hour's
  candidates never hold), `seaWay` for the blocs `reach` did not search, the flood. Less needs the coast
  cells whose network changed kept by the network's refresh, a larger change than this part. No
  decision of the user's waits on it; the loop takes PLAN 7.83d, and 7.83's AT is read after it.

### PLAN 7.83b: the invasion AI's turn −33 %, short of half (2026-10-23)
- **The bar:** invasionAi's mean a tick on a year from HEAD's year-4 save of seed 99 at most half of
  HEAD's in the same swapped pairs (0.238 → 0.119 ms), the year's hash f278491d and the pin unchanged.
- **What moved** (`docs/evidence/7.83/b.md`): ten cuts that change no outcome (hash f278491d after each;
  seed 7 × 3 years the same): 0.238 → 0.160 ms (−32 % and −33 % by core), share of the tick 11.2 % →
  7.9 %, calls of 1 ms or more 340 → 270 a year.
- **What is left:** the rules' own work, about 0.05–0.06 ms a tick: the passage's reach walks the ferry's
  port pick needs (37 a year), the route searches bounded by FERRY_SEARCHES and SEND_SEARCHES, and
  `seaReach`, which supply reads after it in the hour. Less needs fewer searches a turn, a rule change.
  No decision of the user's waits on it; the loop takes PLAN 7.83c, and 7.83's AT is read after 7.83d.

### PLAN 7.89: a formation aboard holds no ferry turn now, but the lift is short of the army; piles 2 → 2 (2026-10-22, ADR-643)
- **The bar:** piles of 30 or more of a nation at war on one cell 30 days running on 1129 year 10, 6421
  year 20 and 7019 year 10 (`piles.ts --days 30`) 2 → 0; a unit test red without; the ADR; the pin.
- **What moved** (`docs/evidence/7.89/a.md`): the rule is in: the lock holds a landing and a Normandy only
  while a landing is at sea, never the ferry. The USA's ferry turns on 1129 1 → 4; ferry boardings in 30
  days 3 → 7 (1129), 3 → 78 (6421), 0 → 1 (7019); landings the same; a unit test red without; pin
  b7653c3c → 0b3aea1f. Piles 2 → 2: 1129's 53 fall to 41, its 60 by Chicago do not move.
- **What is left:** PLAN 7.90. The USA's 12 groups hold 288,000 men against about 1.35 million in the two
  piles; a round trip carries 4–8 divisions. No decision of the user's waits on it; the loop takes it after
  PLAN 7.80b.

### R140: the same five largest for 20 years or more on 2 of 10 seeds of HEAD (2026-11-18; first on 701–710, 2026-10-18, PLAN 7.18g)
- **The bar** (ROADMAP R140): a 10 × 50 sweep on seeds no tuning has seen, the same five largest nations by land (as a
  set) for 20 years or more on none of the 10. Reported, not judged, by the sweep since ADR-750 ("a stable top is a
  valid world", the user's decision).
- **What moved:** `docs/sweeps/2026-11-18-sweep-r140.md` (72001–72010, on 40938ff7): 72006 22 years (years 10–31) and
  72007 20 years (10–29), both the Soviet Union, the United Kingdom, the United States, Brazil and Australia; the
  other eight 7–17. Before: 701–710 three (22, 20, 20); release79's 1581–1590 none (at most 14).
- **The cause read** (`.cache/r140/top.ts`, the eight largest and their days at war each year): the United States is in
  the longest-held set on every seed of the three sweeps (30 of 30) and Australia on most; on 72006 Australia was at
  war 0 days in years 9–27 and the United States 0 in 22 of 32 years; 72007 alike. Their land does not move, so the set
  holds while the other three keep their places. On 72006 the sixth stood 5.6–5.8 M km² against Australia's 8.34; on
  72007 China came to 8.20–8.23 in years 14–20 and did not pass it. The set forms after year 8, when 11–28 M km² change
  hands on every seed (the colonies taken into their overlords: France and Britain doubling on 72006).
- **Left:** ADR-1120 (proposed, the user's decision): the bar or ADR-750, and what would change it. R144 is the cause's
  item; it waits on that answer.

### `seaBattleSeen1938` red in parallel runs under load (2026-10-17, PLAN 7.4f38, 7.4f40)
Red twice this day in large parallel e2e runs (53 spec files with PLAN 7.4f38's change, 7 with
7.4f40's, two unrelated changes), green alone five times (both changes and HEAD before them) and
in a run of 4 files. The failure's message was not kept (the run's output had its summary only).
Not on `tools/gate/knownRed.json`: if `npm run check:review` sees it red twice (in the run and
alone), it goes there with this entry; until then a red of it in a crowded run is load. Not
tried: its error under load, to see which of its waits is short.

### PLAN 3.10c1d2: France's far end is not manned by the rules of 3.10c1a, 3.10c1d and 3.10c1d2 (2026-10-07)
The case PLAN 3.10c1d was written for: seed 4242 after a year (`.cache/ck/4242-y1-c1a.bin`,
the state of 3.10c1a's game read by today's code), France (nation 19) against Italy. Of its
87 own front sectors, 31 have no French formation within 60 cells.

| France, on its day in eight | day 365 | 373 | 381 | 389 | 397 | 405 |
|---|---|---|---|---|---|---|
| formations (3.10c1d → 3.10c1d2) | 44 → 44 | 39 → 39 | 28 → 25 | 13 → 12 | 4 → 10 | 2 → 6 |
| ranked near the front | 21 → 21 | 11 → 13 | 9 → 8 | 6 → 3 | 2 → 7 | 1 → 4 |
| of them on the march | 19 → 19 | 11 → 11 | 9 → 8 | 4 → 3 | 2 → 7 | 1 → 4 |
| to spare (candidates) | 2 → 3 | 0 → 1 | 0 → 1 | 1 → 1 | 0 → 1 | 0 → 1 |
| sent to the far end | 1 → 1 | 0 → 0 | 0 → 0 | 0 → 0 | 0 → 0 | 0 → 0 |
| own sectors with nobody within the range | 31 → 31 | 32 → 32 | 33 → 33 | 34 → 34 | 33 → 33 | 33 → 33 |

- **Tried:** (1) 3.10c1a: formations far from every sector (France has two); (2) 3.10c1d:
  those near the front that stand still (2 of 21, one sent, formation 238, 139 cells);
  (3) 3.10c1d2: those not on an errand, on the march or not (19 of the 19 on the march
  were not on one; 3 candidates, one sent, formation 213, 121 cells, off its march).
- **Why the table does not move:** no longer for want of somebody to send: there are
  candidates on every one of its days. One of three is sent on day 365 and none after;
  which of ADR-191's limits held the others back (the share of point 3, the three ranges,
  an order refused) was not looked at. And after that day France has no army: 44
  formations, 12 four weeks later. It is losing the war it has, with 21 formations near 87
  sectors of its own.
- **Not tried:** a floor for a sector that has nobody whatever the threat elsewhere (ADR-191
  chose the share over it: "a front that is emptied to fill another"); what a far sector is
  worth (31 sectors in the Sahara that nobody attacks). Both are balance, and wait for
  Phase 7 (ADR-58).

## Watch list

In `docs/BLOCKERS_WATCH.md` (ADR-918): searched, not read.
