# BLOCKERS

Tasks that failed 3 attempts or cannot proceed, with what was tried. An entry
resolved is marked **RESOLVED** with the date and fix and moved to `docs/BLOCKERS_DONE.md` (ADR-804).

## Open

### R66b/c: the fronts' armies wait on two replay bars that HEAD passes on seed 1938's luck alone (2026-11-11)
- **The change** (`docs/patches/R66c-set-down.patch`, off `9dff3d7f`; `git apply` it): an `occupy` sets the land
  formations of those who held its land down on their own nearest land behind the new line, and a `withdraw` (not a
  pocket) does the same, the pool only for one with no own land within reach over land (Dunkirk). Before, they were
  left behind the line, out of supply, and starved or were deleted. With unit cases in `trackLevers1938h`.
- **What it does** (`tools/diag/trackFronts.ts`, the large Eastern stages of 1942-45, the smaller side's men near
  summed): seed 1938 618k on HEAD → 3.85M; seeds 1 and 2 1.86M and 3.98M; both sides near at 10 of 15 (7 on HEAD).
  Three other rules tried with it (held foes as a partner's foes when a stage is due, a sector with no threat and only
  held foes left out, the land of the coming stages weighed) moved the census within its noise both ways on three
  seeds (ablation); dropped.
- **The bars it turns red:** `historyMatch1938h`'s control strays on 1941-12-01 under 0.5 % (0.17 % on HEAD; 0.55-0.68
  % with it) and `chinaFront1938h`'s China army a year after November 1938 at least half its start (HEAD 402k of
  771k, 4 % over; with it 379k of 767k, 1 % under).
- **Why it is not the change:** the run is the same as HEAD's to 1941-06-01 (strays 0.13 % in every variant); China's
  1938 set-downs alone move Russia's 1941-12-01 strays from 0.17 to 0.55 % (the Barbarossa fighting of June to
  December, three years on). On HEAD seeds 1-5 read 0.53, 0.85, 0.63, 0.61, 0.53 %: every one over the bar (with the
  change 0.78, 0.59, 0.65, 0.76, 0.57 %). China's army a year on is held by its monthly budget (the start 719-856k
  and the end 379-402k in every tree tried): the 120k the change saves from starving are disbanded at the month's start.
- **Waits on the user:** whether the 1941-12-01 strays bar is read over seeds (or raised to what seeds 1-5 show), and
  China's army bar given its budget; the change is applied and R66 goes on when they are. Not worked around by
  another rule (a tree picked for its luck).
- **Left in the patch:** the withdraw's gate asks a hold of `n` with anyone, not with who takes the ring; the
  set-down puts a stage's formations on one cell (`fallBackCell`'s nearest), to be spread.
### `seaRow1938`'s Speed x1 test red on this machine again, the code not its cause; on `tools/gate/knownRed.json` (2026-11-08, R53g)
- **The bar:** from the row of Germany's and Britain's sea battle (seed 5591, hour 45), at Speed x1 for 6 s, a frame
  with both sides' ships' tracers on the screen (`seaRow1938.spec.ts`, PLAN 7.22a). Resolved once (docs/BLOCKERS_DONE.md,
  2026-11-03: green alone in a review).
- **What was read:** red in R53g's gate and again alone; then alone 1 of 2 with R53g, and on HEAD `db7953f0`'s battle
  rule (R53g's sim change stashed) 1 of 3. Each run the same battle, 25–27 frames in 6 s (SwiftShader), 6 ticks, at most
  1 German tracer and 4 British at once; it passes when the one German tracer and a British one share a frame. The machine
  idle (load 5 %, no node or Chrome left over).
- **Left:** the test leaves the list when it passes here twice running. The test is not changed. Nothing waits on the user.

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

### `godUi1938` "Revive after a Kill": France's name not on the map after its revival (2026-10-18, PLAN 7.25d)
Red at `7302970` (before 7.25d's change, stashed) and after it: `expect.poll(... nationLabels ...
l.id === FRA ...).toEqual(['France'])` gets `[]` after 15 s (`tests/e2e/godUi1938.spec.ts:474`);
France revived on 8,659 cells (10,474 before the Kill). The other nine tests of the file green. Not
tried: when it was last green (the e2e suite runs in full at a phase review), whether the label is
placed and dropped or never placed. Left to the next phase review's run (`npm run check:review`).

### Sweep on seeds 701–710: no stasis on 7 of 10 (2026-10-18, PLAN 7.18g)
`docs/sweeps/2026-10-18-sweep-718g.md`: the same five largest nations 22, 20 and 20 years running on
seeds 702, 704 and 706, the limit under 20; every other criterion on 10 of 10. Not tuned in answer
(one cause per commit; the measure first): PLAN 7.27.

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
