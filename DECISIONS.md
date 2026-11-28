# Decisions (ADR log)

Format: ID · date · status · decision · why · consequences. Deliberate deviations
from AoC are tagged **[AoC-DEVIATION]**.

---

## ADR-1169 · 2026-11-28 · accepted · An order given while the historical track runs ends it before it is judged, and is judged by the world the end sets free (R240)

- **The case** (found by R236's review). The first command applied while the track runs ends it in that hour (ADR-945),
  and an order (a march or a sailing, a wing's mission or rebase, a paradrop) counts as applied whether or not it is
  given: its "no" is a `MoveRejected` of its own. The order was judged first and the track ended after it, so it was
  judged by the world the track steers, by rules its own command was about to end. Since R236 the land of a foe whose
  front the track holds is closed to a nation's ways (ADR-1163, `passageOf`): a march across such a front was refused
  as `NoRoute` ("there is no way by land that keeps off the ground of nations outside its wars", which the held foe is
  not), the formation stood, the replay ended all the same, and the same order sent again was carried out. Before
  R236 it was given, and went as the free world has it.
- **Where it is met.** In the page a march, a wing's order and a paradrop are the played nation's (`Player.click`), and
  the taking of a nation is an intervention itself (`setPlayer`): the track has ended before such an order is judged.
  The case is a command sent while the track runs, by the sim's own API (`window.__warsim.sim.command`): the critic's
  probes and the tests, of each order kind, its nation named or not.
- **Decision.**
  1. An order's command ends the track once its own refusals are past (another nation's formation named, one on the
     retreat; a place that is no number or off the map refused before any kind) and before the order is judged
     (`applyCommand`'s `intervene`, given by `applyPendingCommands`). A command refused so ends nothing, as before.
  2. The order is judged by the world the end sets free: no hold (the march over the held foe's land is given, and
     waits at the front as in any war, PLAN 1.14), the occupations the track excused given back (ADR-1060: a march, a
     rebase or a paradrop onto that ground is refused at once), a war whose hold outlives the timeline at peace
     (ADR-1063: a march onto the former foe's land refused by that peace).
  3. Any other command ends the track once it is carried out, as before (a cell it changed stays as it made it,
     ADR-1060).
  4. The timeline's own orders (`redeploy`, ADR-931) are no intervention: they keep the holds and end nothing, refused
     across a held front as R236 made them.
- **Why the end first.** Not judged with the holds alone lifted and ended after: the end changes more than the holds,
  the ground it gives back (`returnHeld`) and the peace of a hold that outlives the timeline, and an order judged
  before them would be given onto ground that goes back to its owner in the same hour, and barred at its first step
  onto it. Not a refusal that names the hold and leaves the replay running (the AT's other way): every command is an
  intervention (ADR-945), an order refused across a third nation's land would end the replay while one refused across
  a hold did not, and the answer the timeline's `redeploy` counts its orders by would change with it.
- **Consequences.**
  - An order's rows in its hour: `TrackEnded` and the end's own (a peace, land given back), then the order's
    (`MoveRejected`, `FormationLanded`), then `CommandApplied`. Before, the order's came first.
  - The replay's course is the same: a run with no command never enters the change (`applyPendingCommands` returns at
    an empty queue) and the timeline's events call `applyCommand` with no `intervene`. On its own seed the same hash on
    1 January 1939, 1940 and 1941 by both codes (5a620a81, 151ef136, 1469d966), past 1940's `redeploy` events; its
    ten-year tests stand on that course and were not run again. A free game has no track: the pin of seed 99 unmoved.
  - The tick: nothing in its path changes (the replay's three years 1.38 and 1.37 ms, one run of each code on cores of
    its own, not a pair).
- **The decisions it stands on (ADR-803)**, each with its test green before and after: ADR-945, the end at the first
  intervention and a refused command none (`trackIntervention1938h.test.ts`, a march and a wing's mission added to its
  13 kinds: green before too, as an order counted as applied); ADR-1060, the occupations given back and a cell the
  command changed kept (`trackEndHeld1938h.test.ts`); ADR-1063 and ADR-1067, a held war at the end
  (`trackEndHolds1938h.test.ts`); ADR-924 and ADR-931, the runner and `redeploy` (the new test of a `redeploy` across a
  held front, and the replay's hash); ADR-1163, no way over a held foe's land (`heldFrontMarch1938h.test.ts`); ADR-173,
  no order on the retreat, and ADR-759, a player's march that meets the enemy (the new tests). It amends ADR-1163's
  decision 1 ("a God Mode order while the replay runs: that one with the reason of a way barred by nations outside the
  war, and it ends the replay as any command does") and ADR-945's rule (an order ends it before it is judged). SPEC
  §7.7 says so.
- **Read.** `trackOrder1938h.test.ts`, 15 tests, 13 red before. On two fronts (Germany on Poland, seed 1938; Japan on
  China, seed 5): a march onto the held foe's land 1, 3 and 8 cells past the front, 6 hours, 1, 2, 3 and 5 days in, of
  a formation standing and of one in the middle of a step, its nation named and not, by a tick and by `applyNow` (of
  the 120 a front, 84 and 108 with a formation to order; 6 of Germany's a player's march that met the enemy in its
  hour, given and told `Contact`); several marches in one hour; each kind of order refused for its own reason, after
  the end (across a nation outside the war `NoRoute`, the right reason there); the guards, ending nothing. On Germany
  and Poland: a march to its own land beyond the foe's, with a way round and with none; a `redeploy` refused, the track
  running on; a stage's days; a hold that outlives the timeline; ground given back (a march, a rebase to Warsaw's
  airbase, a paradrop on Poznań, each refused at once).
- **The checker (ADR-804).** The track's checker sends no command, so it cannot see the rule. The war-and-peace
  checker's lines of the world (`worldBreaks`: `held`, `realm`) are asked after the order in three of the tests: none,
  the track's own occupation read before it on ground given back and gone after.

## ADR-1168 · 2026-11-28 · accepted · In a fight a formation is held as its host is on its host's land; a cell taken under it, it is set down in that hour (R243, the rule the user chose: ADR-1167)

- **The case** (found by R239; ADR-1167, the user's "Yes try it"). A hold is between two nations wherever they stand
  (ADR-929). From 9 June 1944 the Soviet Union fights Finland with no hold and takes its land cell by cell; German and
  Romanian formations on that land are held off from the Soviet Union to May 1945, so they neither fought for the
  cell they stood on nor left it. R239's look set each down on Finland's next cell at the day's first hour, and that
  cell was taken by 08:00: a cell back each morning (29 set-downs of Germany's on the Soviet Union's ground, 5 of
  Romania's, 2 of Finland's the other way round in 1941; seven mornings running on seed 5).
- **Read first** (ADR-1167's "for the item").
  1. *Does a cell still change hands under a guest that defends it?* Yes. Territory asks by the cells' holders, and a
     guest's men count there for its host already, hold or none: the defence of a cell sums the pressure of its
     holder's bloc and of the nations on its side (`territory.ts`, `sameSide`), the attack that of the nations that
     fight the foe together (`together`). So the first of ADR-1167's two ways to finish the item ("the guest's men
     count for its host in territory") was the case before it. What a guest lacked was the fight.
  2. *What does a host's own formation do when its cell is taken?* It stays in the cell, in the fight, and the track
     does not touch it (a constructed world, `trackGuest1938h.test.ts`: a Polish formation on a Polish cell that
     Germany takes). ADR-1167's second way ("it retreats as its host's formations do") is, read so, "stays and
     fights": tried twice below, and not kept.
  3. *Is the ally's land alone enough?* No. With a guest held as its host only on its host's land, the history match
     and the own seed's checker pass and the replay keeps R239's course to 1 January 1940, but the hop stays: 26
     set-downs of Germany's on the Soviet Union's ground from 23 June 1944 (29). On the cell the foe has taken the
     ground is the foe's, no host is left to ask, and the pair's freeze is back, as ADR-1167 foresaw.
- **Decision.**
  1. `World.standsFor(n, cell, foe)`: the nation a land formation of `n` is taken for against `foe` where it stands:
     on the land of an ally in its war with that foe (`Wars.together`: on one side, both at war with the foe), that
     ally; else `n`.
  2. Combat's pairing asks the hold of the two stand-ins (`findBattles`; `World.holdsAt` of them, so a stage's days
     lift it as for any pair). Both ways: on an ally's fought front a formation fights, on an ally's frozen front it
     does not, its own nation's front free or not. Whether the two are at war is asked of their own nations.
  3. In the hour a cell is taken by fighting, each land formation standing on it that is held off there from the
     nation that took it is set down as the day's look sets down (R239's `setDownLeft`, called by the territory
     system with the hour's flips: `Track.groundTaken`): on the nearest land of its own or of an ally's in its war
     within `FALL_BACK_CELLS`, `SET_DOWN_PER_CELL` to a cell; with none in reach it is taken off, its men back to the
     pool. On a march or not (its march was over ground that is the foe's now). Not one on the retreat (it walks off
     that ground by itself; the day's look has it if it does not), nor one a `forces` event keeps for its stage.
  4. A guest so falls back with its host's line as the line is lost, and fights from its host's next cell.
  5. "Held off there" is asked by the formation's own cell (`World.holdsAt` of it), at a flip and at the day's look
     alike, and by the checker's `left`: a stage's days leave a formation where it stands only in the stage's area,
     where the hold is lifted. This amends ADR-1166's decision 3, which asked by the two nations (`holdsPlan`: "every
     one in the days of a stage between the two"). Found by the review before the push, on the code first committed:
     with a Soviet stage's days open a front away, German guests whose cell Finland lost stood on Soviet ground and
     did not fight, the set-down, the look and the checker all passing them over. Measured there
     (`.cache/r243/window.ts`, to 1991): 37 formation-days on the own seed and 81 on seed 5, seven mornings running at
     the most (25 August to 19 September 1944); 11 on seed 3.
- **Not changed: what still asks by the two nations.** Land (`holdsLand`: by the cells' holders, as before). Ways and
  the step R236 shuts (`passageOf`, `movementSystem`: a guest is routed by its own nation's holds, so it fights where
  it stands and does not lead an advance). The planner (`foesOf`, `sectorShape`: it sends guests to a partner's fought
  front already). The arrows (`advancing.ts`). Whom the day's look and the stages' own set-downs call held off
  (`setDownLeft`, `occupy`, `withdraw`: the two nations' hold, not the stand-ins'; a formation on a foe's ground
  stands for itself). A stage's sides (`Track.fightOpen`). And the fire within a battle: its sides are the
  formations at war with each other (`combatSystem`, by `atWar` alone, as before the holds), so two formations a
  hold keeps apart shoot each other only where each is in the battle by a fight of its own.
- **Three attempts at the cell lost under a guest**, each with its run (PROMPT's three).
  1. *It stays and fights, of its host's front while that host's land is the nearest behind it* (a formation on an
     enemy's ground, its own nation held off, taken for the holder of the land the look would set it down on, within
     40 cells; the look leaves it). In a constructed world it does as a host's own formation does. The replay's bars
     held (Paris Germany's from 13 June 1940, 861 French cells on 22 June, 10,040 Soviet cells after 1 December
     1941, the Soviet army 4,097k; the census's bars on three seeds) and the look's set-downs of Germany's on the
     Soviet Union's ground were 11, each on one day onto Germany's own land. But when the fight moved on the guest
     stood behind the foe's line with its march waiting (PLAN 1.14: before each of that foe's cells): a bar drawn for
     this attempt ("not a week on that ground in no fight") told a German formation on seeds 3 and 5, Finland's line
     up to 22 cells behind it (seed 3: 215 formation-days there in a fight, 208 in none).
  2. *The same, with its host's land beside it* (one cell: the cells of a foe's that a holder contests are those that
     touch its land). The same bar told a German formation on the own seed and on seeds 2 and 3 within 2,500 days: a
     week in no fight on a lost cell at the line. R239's own log had it (`second.ger.log`: formation 896 "waits"):
     the planner gives such a formation a march, a way from closed ground walks over that ground, and its next step
     is a cell of the foe's. It does not step back by itself.
  3. *Set down in the hour the cell falls* (decision 3). A formation held off there is then not on the foe's ground
     after the hour it was taken, whatever the pace of the front (but one on the retreat, or kept for its stage); the
     bar of attempts 1 and 2 has nothing to count, and `left` is held to its first and stricter wording again
     (below). Its first proof was clean on six seeds and still wrong: decision 5.
- **What it costs.** A guest does not do as its host's own formation does on a lost cell (that one stays and fights
  on): it is moved a cell back with the line, and its fight for that cell ends with the cell. And the other way of
  decision 2 freezes armies that fought: South Africa's, Southern Rhodesia's, the Belgian Congo's, Palestine's and
  Transjordan's formations on Kenya's and the Sudan's held fronts no longer fight Italy there from 1940 to 1942, as
  those fronts' own formations do not (the hold names the Sudan and Kenya alone); their marches wait at those lines
  as before, more of them now (R244).
- **Consequences** (on the code as committed).
  - The hop, by the track's set-downs on the replay's own seed to 1991 (`TRACK_PROBE.onLeft`, told apart by cause):
    of Germany's on the Soviet Union's ground the day's look makes 1 (29), on 23 August 1944, onto Germany's own
    land; of Romania's and Finland's none (5 and 2). In the hour a cell fell 113, all of them German formations on
    Finland's front (five formations, on 39 days from 21 June to 18 September 1944), each onto Finland's land: the
    guests falling back with that line. No other pair has one in 54 years.
  - The checker on six seeds, `left` at its first wording and by the cell: no line on the own seed, no warning on
    seeds 1 to 5 (R239: one on seed 5, and its first wording told the own seed on three days and seeds 2, 3 and 5).
    The formations decision 5 was found by (`.cache/r243/window.ts`): none on the own seed (37), 2 formation-days on
    seed 3 and 3 on seed 5 (11 and 81), each one morning: found, and set down in the next hour.
  - The replay's course is R239's on 1 January 1940 and another on 1 January 1941 (the first contact the probe
    reads with two answers is of 20 September 1940, on the Sudan's front); decision 3 first acts on 21 June 1944.
  - Inside its bars (`historyMatch1938h`, against R239's run): Paris Germany's from 14 June 1940 and 766 French cells
    on 22 June, both as before; 10,249 Soviet cells the Axis's after 1 December 1941 (9,401; the bar 6,000); the
    Soviet army of 1 November 1942 4,006k (4,365k; the bar 2,000k). Of its 44 map lines 40 are the same and four of
    control move: 1 June 1941 right 96.3 → 96.4 %; 1 December 1941 right 95.5 → 96.4 % and astray 0.35 → 0.48 %
    (the bars 90 and 1); 1 November 1942 right 96.3 → 96.9 %; 5 June 1944 astray 0.33 → 0.32 %. The China front
    (`chinaFront1938h`) is as before; of the ten free worlds' days to a first war one moves (11 for 15).
  - The fronts' census (`tools/diag/trackFronts.ts`, 1942 to mid-1945). On the own seed: of the large land fronts
    both sides near at 18 of 23 (20 of 25; ADR-969's bar two thirds); both engaged at the stage's hour at 12 (11;
    R66d's bar 9); the Sixth Army near Stalingrad's stage, 14 formations and 161k (R76d); Uranus engaged at its
    hour, 15 Soviet and 6 Axis formations (15 and 22); D-Day both engaged in 174 of its 200 samples (101; R77's bar a
    third). On 37701: both near 20 of 23, both engaged 12, Uranus 76 and 12, D-Day 133 of 200. On 38701: both near 19
    of 24, both engaged 12, Uranus 17 and 6, D-Day 126 of 200.
  - Where the two answers differ (`.cache/r243/reach.ts`: pairs in contact at a day's first hour, the hold asked of
    the nations and of the stand-ins, the own seed to 1991). On R239's course 378 formation-days, 72 where a guest
    would now fight and 306 where it would not. On R243's own course 1,808: 43 where it fights (the United States'
    on British-held ground against Germany in September 1944, 27; Germany's on Finland's against the Soviet Union,
    16) and 1,765 where it does not (the five nations' on Kenya's and the Sudan's fronts, 1,739; Finland's on
    Germany's front in September 1944, 14; Romania's, Germany's and Hungary's on Finland's in the autumn of 1941,
    12).
  - The tick, by pairs run at once on cores of their own, the masks then swapped: the replay's first eight years
    1.90 → 1.79 ms (1.97 and 1.84 against 1.75 and 1.83): the course's. The set-down of a flip itself is not
    measurable: on one course (the replay to 1944, the same hash with it and without) the territory system reads
    0.298 ms a tick either way by `--profile` (0.2980 without it, 0.2985 with), inside what untouched systems differ
    by. (A second pair, 0.2967 and 0.3003, was of a build with a pre-filter by nation, written for this and taken
    out again: nothing to gain.) A free game has no track: seed 99 over three years ends on the same hash by both (32ec3f7f)
    at the same tick (1.95 and 1.73 against 1.94 and 1.74 ms, by core), and the pin is unmoved.
  - The replay in the page, its five browser specs by hand (`arrowsHeld1938h`, `arrowReach1938h`, `replayYear1938h`,
    `scenario1938h`, `trackView1938h`): 15 of 15, their prints of 1939 and 1940 as before (the same course).
- **Stands on** (ADR-803). ADR-929, amended ("no pairing in combat" between the two sides of a hold: now by where
  the two stand; its bars `chinaFront1938h`, green before and after, their figures the same). ADR-1166, extended (its
  set-down asked in the hour of a flip too) and its decision 3 amended (a stage's days by the cell);
  `trackLeft1938h.test.ts`, seven tests green before and after, its formation left in a stage's days stands in the
  stage's area. ADR-974 to ADR-977 (a stage's days: `trackFight1938h.test.ts`, `trackTold1938h.test.ts`, green before
  and after; `trackGuest1938h` holds a guest to its host's days, and leaves one whose cell is taken in a stage's days
  where it stands). ADR-968 and ADR-973 (the set-down's reach, its two to a cell, an ally's land:
  `trackLevers1938h.test.ts`). ADR-1163 (no way over a held foe's land: `heldFrontMarch1938h.test.ts`, untouched).
  I4 on a world with a track (R237, R238: `trackAsked1938h.test.ts`, `World.holdsHere` asked after every tick beside
  the old questions; the set-down of a flip comes after the hour's fight and keeps the hour's list of open stages).
  R72c (the pairing's cache by nation pair: kept, the stand-in's answer not written into it). The pin of seed 99: a
  world with no track takes the path it took.
- **Read.** `trackGuest1938h.test.ts`, 36 tests on two seeds, 34 red before. Of decision 2, nineteen, eighteen red
  before: a guest on its host's fought front, its own nation held off, fights (the foe on its own land or on the
  host's; the guest alone or beside a host's formation), and on its host's frozen front does not, its own nation
  free (the same four); in a stage's days on a frozen front it fights as its host does, and not before them; a
  puppet host named by the hold alone (the Burma front's shape); on its own land either way (green before). Of
  decisions 3 and 5, seventeen, sixteen red without them: the cell taken under a guest at three hours of the day,
  alone or beside a host's formation (it fought for the cell; in the hour it falls it stands on its host's land a
  cell back, told once; the host's formation is where it was; the foe come on to the cell, it fights again); the
  line driven back twelve cells in eight days under an idle guest (at no hour's end is it on the foe's ground, no
  day's first hour finds it there); three guests on a cell (two to a cell at the most); with no land of its side in
  reach, taken off in that hour, its men in the pool (a one-cell exclave); a stage's days open elsewhere between
  the two nations (set down in the hour the cell falls, and at the day's first hour: red by the two nations,
  decision 5); left alone in that hour (green before): a host's own formation, one on the retreat (the day's look
  has it), one in the area of a stage in its days. The checker (`tests/helpers/historyTrack.ts`): `left` is its
  first wording again, a formation found on a held foe's ground at two days' first hours running in whatever cells
  (R239 narrowed it to one cell, and a week in any, because of these very guests: ADR-1166), and asks a stage's days
  by the cell (decision 5); a rule `guest`: a formation that stands for another nation is not found two mornings
  running out of a fight that nation fights there, nor in one it is held off from. On R239's combat `guest` tells
  both within 2,500 days of the own seed (South Africa's, Southern Rhodesia's, Palestine's, Transjordan's and the
  Belgian Congo's on Kenya's and the Sudan's held fronts in 1940 and 1941, fighting; Finland's on Germany's front in
  October 1941, the United States' on British-held ground in September 1944, standing).
- **Filed** (found by the item's probe of where the two answers differ, `.cache/r243/reach.ts`): R244, a march of a
  nation free against a foe that waits on an ally's frozen line (`stand` asks by the two nations and does not see
  it; R243 raises its days); R245, a stage's days open to one war's side alone (the Americans outside France's stage
  of 15 September 1944).

## ADR-1167 · 2026-11-27 · the user's decision ("Yes try it") · R243 by a freeze that follows the ground under a guest; the full cure of the holds not taken now

- **The case.** After R239 the user stopped the loop and asked why each item finds new ones. One report of the
  arrows (R235) had become nine items (R235 to R243), six of them done. Answered: (1) one root: the replay freezes
  fronts between pairs of nations (`hold`), and the rules of marching, planning and arrows were written for fronts
  that move, so whatever waits for a front to move waits for ever at a frozen one (R236, R239, R243, and the arrows
  that drew them); (2) each fix adds a rule to a checker that replays 1938 to 1991 on six seeds, and finds what was
  there before (the 330 American formations of 1972; R237); of the nine only R240 was caused by a fix; (3) every
  cause found is filed, three of the open items by the reviews before a push; (4) the first report was misread
  (stuck marches, for the arrows' length at a far zoom: R241), and four items came of that. The sizes fall: about
  150 marches stuck on a day (R236), 75,055 formation-days now 121 (R239), one formation for a week on one seed of
  six (R243), 1 to 6 arrows of 60 (R242).
- **The cure, as explained to the user.** The timeline's 81 holds name nations and dates and no place; four
  questions are asked of them (`World.holds`, `holdsAt`, `holdsLand`, `holdsPlan`) in about a dozen places (combat,
  territory, movement, the operational AI, the arrows). The full cure: a freeze is the closed border between the
  land two sides hold. One question, of two cells: is the border between them closed (no shot, step, way, plan or
  cell across it); nobody stands on its far side, seen to when a border closes or an event moves it; where a
  formation stands decides, not whose it is. Its cost: the replay proved again from 1938 (every bar, six seeds),
  several sittings, and the corner cases of a new course; it does not touch R240 or R242.
- **Put to the user:** the small version, on R243 alone: a formation on the land of an ally takes that ally's front.
  Said to be probably one item, and untried.
- **Ruled** (the user, 2026-11-27: "Yes try it", and to set it up for a later "continue"). R243 is done by the
  small version. The full cure is not taken now; it is the user's to raise again (it pays where more history is
  scripted).
- **The order, ruled too** (the user, 2026-11-27, asked whether "continue" starts with R243: "Yes, R243 first").
  R243 stands first of the open items in ROADMAP. The builder had put it there so that "continue" takes it, and
  before that had advised R240 first, the one a player can meet.
- **Not ruled.** Which of R240 and R242 are still fixed: asked ("R240 only" or "all three"), not answered. Both stay
  open as filed, after R243.
- **For the item** (read from the code on R239; to settle there, not decided here):
  1. First to read: whether a cell still changes hands under a formation that defends it. Territory asks by the
     cells' holders (3 below), so the cell may go to the Soviet Union whatever the guest does. The ground under the
     guest is then the foe's, no host is left to judge it by, the pair's freeze holds again, and the next morning's
     look sets it down: the hop goes on. Opening combat alone would then miss the AT, and the item has a second
     part: the guest's men count for its host in territory, or it retreats as its host's formations do.
  2. Combat asks by the two formations' nations and has both cells (`combat.ts`: `world.holds(ma, mb)`, then
     `holdsAt(ma, mb, cellOf(a), cellOf(b))`): there a guest can be judged as its host, the holder of the cell it
     stands on, where that holder is on its side of the war.
  3. Territory asks by the holders of the two cells already (`territory.ts`: `holdsLand(an, d, c)` with `an` the
     neighbouring cell's holder): the Soviet Union takes Finland's cells whoever stands on them. Whether a guest's
     men count for its host there is to read.
  4. Planning and ways ask by the pair (`foesOf`, `frozenFront`, `passageOf`: `holdsPlan`). Whether a guest plans
     and marches as its host does, or only fights where it stands, is the item's choice; the least change is the
     second.
  5. R239's look (`setDownLeft`) and the checker's `left` and `stand` call a formation held by the pair
     (`holdsPlan`): a guest that may now fight where it stands is not left behind a line, and must not be set down
     out of its fight.
  6. The other way round holds too: a formation on an ally's frozen front is frozen there though its own nation's
     front is free. A hold covers a side's puppets by their overlord (`Track.held`); the holds with `air` (R74h)
     are not this item's.
- **If it misses a bar:** a BLOCKERS entry, and the choice goes back to the user (park R243, or the full cure).

## ADR-1166 · 2026-11-27 · accepted · A formation the timeline leaves on a held foe's ground is set down behind the line at the day's first hour (R239)

- **The case** (found by R236: ADR-1163's decision 4, ADR-1164). Across a front the track holds nobody fights on land
  and no land is taken (ADR-929), and a march waits before each cell an enemy holds (PLAN 1.14). A formation on the
  held foe's own ground may walk on it (ADR-149), but each step to that foe's next cell waits for a front no one
  moves: it stood with its order until the hold ended, or starved first. An `occupy` and a `withdraw` set down the
  formations their own stage cuts off (R66c, ADR-968, ADR-973). Nothing did for the rest.
- **Each pair's cause, read from a run** (the replay's own seed on R241's code to 1991, asked at every day's first
  hour: 539 episodes of 447 formations, 75,055 formation-days, 68,628 of them waiting on a march and 6,393 with no
  order). By how the first day found each:
  - The ground changed under it, 366 episodes and 70,999 days. A `transfer` sets no formation down: the Easter
    Offensive of 1 April 1972 under 330 American formations (68,179 days: 157 gone before the armistice of January
    1973, 173 there until it), 3 South Korean, 3 of the Philippines and 1 of French Indochina; Poland's partition of
    28 September 1939 under 7 British divisions (494 days, all gone by 20 January 1940); France freed on 15
    September 1944 under 6 German; the NPFL's Liberia of 9 September 1990 under 2 Liberian; the Sinai of 8 June 1967
    under 5 Egyptian; Manchukuo's land become China's under 6 Japanese. And an ally's land become the held foe's:
    Finland's under 2 Hungarian (1944), Romania's under 1 German.
  - The hold closed over it on ground already the foe's (a stage's days over, a hold declared), 99 episodes and
    3,439 days: 61 Soviet on Germany's from 2 December 1941 (1,939 days) and 16 German on the Soviet Union's; 11 of
    Ceylon's and 2 Australian on Japan's from 23 July 1942; 6 Hungarian and 1 Slovak on the Soviet Union's in the
    autumn of 1944; 1 British on Germany's; 1 Japanese on the United States'.
  - New there, 30 episodes and 330 days: Soviet formations arrived on land Germany had taken.
  - War come to it where it stood, 5 episodes and 128 days: 4 Italian on Germany's ground from 14 October 1943 (the
    Kingdom's war on Germany of the 13th), 1 Hungarian on Romania's.
  - Walked onto it, 39 episodes and 159 days: 30 of them a day's coming and going (Japan's 18 on China's, China's 4
    on Japan's, the Soviet Union's 3 on Finland's); the rest ground entered in a stage's days that then closed (2
    German on France's 60 days, 4 Soviet on Germany's 48, 2 Sudanese on the SPLA's 11, 1 Khmer Rouge on Cambodia's
    10).
- **Decision.**
  1. At a day's first hour, after the hour's events, the track looks at every land formation not aboard. One that
     stands with no march, or waits on a march before an enemy's cell (`waitsForFront`), on the ground of a nation
     its own is at war with and holds a front with, no stage's days open between the two (`World.holdsPlan`), is set
     down as a stage's cut-off formations are (`setDownBehind`, R66c): on the nearest land of its own or of an
     ally's in its war within `FALL_BACK_CELLS` (40) over land, `SET_DOWN_PER_CELL` (2) of a day's to a cell, its
     march and its order ended.
  2. With no such land in reach it is taken off, its men back to its nation's pool, as a `withdraw`'s with none in
     reach (ADR-968). A hero stays where it is.
  3. Left where they are: a formation on a march that does not wait (it goes by itself: a step taken back, a way
     off that ground), one a `forces` event keeps for its stage (`kept`, ADR-976), and every one in the days of a
     stage between the two nations (they may be fighting for that land, ADR-974).
  4. One rule for every cause, asked once a day: no set-down written into `transfer`, `hold`, `war` and each other
     event that can leave a formation there.
  5. The look asks for the hour's open stages before the hour's systems do, so the track forgets the list after it
     (`eventApplied`; R237, R238): the systems make their own, as on a day when nothing is found.
  6. This replaces ADR-1163's decision 4 ("left as it was"); its decisions 1 to 3 stand. The checker's `stand` loses
     the exception ADR-1164 names, and has a rule `left` beside it (below).
- **Why set down, where ADR-1164 named a walk out too.** A walk out is a march across the held foe's ground, and it
  waits before each of that foe's cells (PLAN 1.14): it would need the march home's leave to cross them (ADR-222),
  given to every formation behind a held line for as many days as its way is long, through an army it may not
  fight. And 21 formations of the run have no land of their side within 40 cells to walk to (10 British in Poland,
  6 Italian on Germany's ground). The set-down is the rule the same case has at a stage (ADR-968, the user's
  decision), with its reach, its two to a cell and its tests.
- **Why the pool, with no land in reach.** A `withdraw` returns the men of a formation it cannot set down (ADR-968).
  Before this rule those formations were lost where they stood: of the 8 British episodes every one ended with its
  formation gone, of the 4 Italian 2.
- **Consequences.**
  - The same run with the rule: 102 episodes of 80 formations, 121 formation-days, the longest 5 (300 before). Set
    down 195 and taken off 21 to 1991: the United States' on the National Liberation Front's ground 74 and none; the
    Soviet Union's on Germany's 43 and none; Germany's on the Soviet Union's 29 and none; the United Kingdom's on
    Germany's 5 and 10; Germany's on France's 8 and 2; Pakistan's on Bangladesh's 8 and none; Italy's on Germany's
    none and 6; fourteen pairs more of 1 to 5, Hungary's on the Soviet Union's and Japan's on China's with 3 taken
    off between them.
  - What is left, 121 formation-days. Each formation found is there for one read (the look comes in the tick after
    it). And guests on a front fought beside them are found again. From 9 June 1944 the Soviet Union fights Finland
    with no hold between them (the Finnish front's ends that day) and takes its land cell by cell; German and
    Romanian formations on that land are held off from the Soviet Union (the Eastern Front's hold, to May 1945), so
    they neither fight for the cell nor leave it. The track sets such a guest down on Finland's next cell at the
    day's first hour, and that cell is taken by 08:00 the same day: a cell further back each day, five days running
    at the most on the own seed (a Finnish formation the same on Germany's land in November 1941), seven on seed 5
    (a Romanian, to 22 August 1944). Not this rule's to mend: ROADMAP R243.
  - The replay's course is the same to 28 September 1939 (the partition, the British divisions) and another from 1
    October. The look alone, setting nothing down, leaves the course as it was on 19 marked days to 30 December 1991.
  - Inside its bars (`historyMatch1938h`, against the same run on R236's code; R241 changed no rule of the sim):
    Paris Germany's from 14 June 1940 (10 June; the bar the 22nd); 766 French cells Germany's on 22 June (1,009; the
    bar 500); 9,401 Soviet cells the Axis's after 1 December 1941 (11,020; the bar 6,000); the Soviet army of 1
    November 1942 4,365k (4,005k; the bar 2,000k). Of its 44 map lines 39 are the same and five of control move: on
    1 December 1941 right 96.1 → 95.5 % (the bar 90) and astray 0.61 → 0.35 % (the bar 1); on the other four right
    rises by 0.2 to 1.8 points (1 June 1945: 94.7 → 96.5 %). The China front (`chinaFront1938h`) and the ten free
    worlds' days to a first war are as before.
  - The checker (`tests/helpers/historyTrack.ts`, every day of the replay to 1991). `stand` judges a march waiting a
    week at a held front from whatever ground it stands on (its exception counted 60,578 formation-days of the
    United States' alone). `left` has two bars: no land formation stands, or waits on a march, in one cell of a held
    foe's ground at two days' first hours running (the look did not take it); and none is found on that foe's ground
    at seven days' first hours running, in whatever cells (set down each day and overrun again: the item's AT, for
    a formation with no march too). On the own seed no line; on seeds 1 to 4 no warning; on seed 5 one, the
    Romanian guest above (R243). With the look switched off (`TRACK_PROBE.leftOff`) the first 790 days tell both
    rules, of the British by the Corridor (`left` on day 636, `stand` on day 641). How `left` came to its bars: it
    was first "two days running on that ground" in any cell, and told the guests on the own seed (days 1417, 2421
    and 2425) and on seeds 2, 3 and 5; narrowed to one cell, since what the rule promises is that a formation found
    is set down that hour, it told nothing; the week in any cells was added before the push, so that a formation
    set down and overrun day after day is still told.
  - The fronts' census (`tools/diag/trackFronts.ts`, 1942 to mid-1945), the bars of the items it was made for. On
    the own seed: of the large land fronts both sides near at 20 of 25 (21 of 24; ADR-969's bar two thirds); both
    engaged at the stage's hour at 11 (14; R66d's bar 9); the Sixth Army near Stalingrad's stage, 14 formations and
    161k (R76d); Uranus engaged at its hour, 15 Soviet and 22 Axis formations (62 and 6); D-Day both engaged in 101
    of its 200 samples (81; R77's bar a third). On the two other seeds those items name, with the rule: 37701 both
    near 21 of 24, both engaged 11, Uranus 4 and 4, D-Day 99 of 200; 38701 both near 18 of 24, both engaged 11,
    Uranus 26 and 13, D-Day 91 of 200.
  - The tick, by pairs run at once on cores of their own, the masks then swapped: the replay's first eight years
    1.78 → 1.90 ms (1.84 and 1.72 against 1.85 and 1.95). Five sixths of it is 1943 and 1944 (2.37 → 2.77 and 2.33
    → 2.75 ms), and there it is the land combat's time (0.46 → 0.77 and 0.41 → 0.80 ms a tick, by `--profile`):
    the course's, not the look's (0.04 to 0.06 ms a day, 0.002 ms a tick, 2.1 ms at the most). What in the course
    costs it is not read: the shots that hit are 265,514 → 365,988 in 1943 and 189,539 → 191,311 in 1944. A free
    game has no track: seed 99 over three years ends on the same hash by both, at the same tick (1.78 and 1.78 ms),
    and the pin is unmoved.
  - The replay in the page, its five browser specs by hand on the new course (`arrowsHeld1938h`, `arrowReach1938h`,
    `replayYear1938h`, `scenario1938h`, `trackView1938h`): 15 of 15. The arrows' spec prints 135 advances on 14 May
    1940 where it printed 64, Germany's 87 for 16: that day of the campaign in this course (18 German marches wait
    before a cell for 3, 56 German formations fight for 19).
- **Stands on** (ADR-803), each with tests green before and after: ADR-968 and ADR-973 (R66c's set-down, the pool
  for one with no land in reach, an ally's land: `trackLevers1938h.test.ts`); ADR-974 to ADR-977 (a stage's days,
  the arrivals kept for their stage, no window for a taker far outnumbered: `trackFight1938h.test.ts`,
  `trackTold1938h.test.ts`); ADR-1163's decisions 1 to 3 (`heldFrontMarch1938h.test.ts`); I4 on a world with a
  track (R237, R238: `trackAsked1938h.test.ts`, `trackHourEvents1938h.test.ts`); R62j, only a command ends the
  replay (`trackIntervention1938h.test.ts`); ADR-149 and ADR-222, closed ground walked on and the march home
  (`movement.test.ts`), untouched; ADR-929 and ADR-968's bars (`chinaFront1938h`, `historyMatch1938h`).
- **Read.** `trackLeft1938h.test.ts`, seven tests red before: land ceded under Poland's formations by a `transfer`
  at hour 0, 1 and 23 (set down at the next day's first hour, none lost, two to a cell at the most, and they stay);
  left where it stands in a stage's days and set down when they end; an ally's land where that is the nearest; with
  no land of its side in reach taken off, its men in the pool (against the same world with the look off); left
  alone, one kept for its stage and one on a march that does not wait. The checker's `stand` and `left`, on six
  seeds.

## ADR-1165 · 2026-11-27 · accepted · An advance's arrow ends at the cell its march presses on, found by its route (R241, the user's report)

- **The case** (the user, 2026-11-27, of the report R235 took up: "The issue was that the arrows in far zoom looked
  like they crossed far into enemy territory, but at close zoom it looked like it was in held territory for the
  French divisions"). An arrow is drawn along the first 70 to 136 px of its march's line at every zoom
  (`ARROW_LONG_PX` and three of its widths, ADR-1074: "the way a force is going, not the whole of its way"), a bold
  one never under 26 px (R96, ADR-1088), and the line of a march on land is straight from the formation to its
  target (PLAN 7.4g3). So how far an arrow reached on the map was the zoom's: a few km inside its own cell at 60
  m/px, 100 km at 1,000. Measured on fronts fought for, the part of a bold arrow past the front, median and most, in
  cells (a cell 19.6 km): on the replay's 14 May 1940 in the West nothing at 60 m/px, 0.49 and 2.16 at 400, 1.66 and
  5.16 at 1,000, 3.32 and 13.23 at 2,500, 6.15 and 23.91 at 5,000; in a free game (seed 99, day 120) 2.11 and 4.15 at
  1,000, 6.30 and 22.91 at 5,000. The user's own scene, the Rhine on 23 November 1939, has no arrow since R235 and
  R236: it was a held front. The reading was the same on every front that is fought for.
- **Decision.**
  1. An advance's arrow ends at the cell its march presses on: the first cell of its route that a nation at war
     with it holds and it may take today. There the march waits until the cell is taken (PLAN 1.14). Its way is
     from the formation to that cell's point and no further; the stretch of it drawn is as before (the first 70 to
     136 px, at least 26).
  2. The worker finds the cell by the route (`pressesAt`, `advancing`) and sends its point with the snapshot
     (`SnapshotFormations.front`; NaN for every other formation).
  3. Which march is an advance is asked of the route too, where ADR-1088 and ADR-1162 asked the line the view
     draws: one whose route comes to such a cell within 100 km of where it stands, as the crow flies. The line lies
     over land the route goes round, and misses land the route turns into.
  4. A march behind the lines, drawn faint for the nation looked at, is drawn as far as its own side goes: its line,
     still the straight one, cut before the first land an enemy holds (`ownSideLength`, the view's).
  5. Where a cell is smaller than the least length (past 1,000 m/px: 26 px are 3.3 cells at 2,500 m/px and 6.6 at
     5,000) an advance's arrow is that length: R96's sign that a front is pushed there, kept as it is. No arrow is
     longer than that for the length of its line.
- **Why at the cell, and not a head's length further.** An arrow lies under the markers and must still be seen.
  Counted at 400 and 1,000 m/px in the West: the tips of 8 of 23 and 13 of 27 arrows lie under a marker's box (7 of
  25 and 9 of 23 before), mostly the defender's on the cell pressed; their bodies and heads show beside it
  (`docs/evidence/R241/after/`). A longer cut is the old reading again at the zoom the user reported at.
- **Consequences.**
  - After, the same measure: the West 0.52 and 0.87 at 400 m/px, 0.67 and 1.33 at 1,000 (more than a cell and a half
    past the front: 13 of 23 arrows before, none of 27), 2.56 and 3.32 at 2,500, 5.88 and 6.64 at 5,000; the free
    game 0.82 and 1.47 at 1,000 (14 of 21 before, none of 22), 5.88 and 6.64 at 5,000. Faint arrows over an enemy's
    land at 5,000 m/px: half a cell and 3.3 cells at the most before, none after.
  - Which marches are advances, the West on 14 May 1940: 63 by the line, 52 by the route, 41 by both. Of Germany's
    30 by the line, 14 have routes with none of the enemy's land (marches along its own side of the front, their
    lines over French cells) and 6 come to it beyond reach; 6 more are advances by the route alone. In a free war's
    opening (Germany on Poland, seed 1938) the route has 11 of the line's 12 at hour 48 and 21 of its 24 at hour 96.
  - The snapshot has one array more, two numbers a formation. The worker's question costs a snapshot 0.06 ms at the
    median, as before (seed 99 a year on: 1,111 formations, 509 on the march, 69 advances). `npm run bench -- G`
    PASS (T0 402 fps, T2 151 fps; draw cpu 1.6 and 5.5 ms).
  - The line's rule (`advances`) is gone, and its tests are the route's, case for case.
  - Whether an advance still has an arrow. The advancing formations well inside the view that are in no bold arrow
    of the frame, before → after: Germany on Poland in a free game (seed 1938) at hour 48, 1 of 12 → 1 of 11 at
    1,500 and at 1,000 m/px; at hour 96, 1 of 23 → none of 21 at both; the West on 14 May 1940, 2 of 71 → 1 of 60
    at 1,000 m/px, 3 of 48 → 1 of 31 at 400, 3 of 71 → 6 of 60 at 1,500. Those are arrows cut away by one of their
    nation they would cross (`cutAtCrossing`, then under `ARROW_SHORTEST_PX`), as before: ROADMAP R242. The rest
    are one arrow of several marches, as before.
  - `orderLines1938.spec.ts` guards that the arrows are on the names' canvas by counting the points of their middle
    lines that lie on it, 21 an arrow: more than 50 until now. At 1,500 m/px that war's 12 advances in view were 3
    arrows, and its 11 are 2 (one formation in none, both times). The guard is more than 20: one whole arrow drawn
    there, which is what it guards. What the test holds of names and arrows is as it was.
  - Not changed: the least length (5 above); that arrows lie under the counters at the world's zoom.
- **Read.** `arrowReach1938h.spec.ts` (the two fronts at 60 to 5,000 m/px: a bold arrow past the front by a cell and
  a half at the most, or by the least length where a cell is smaller; a nation's faint arrows with half a cell of
  them over an enemy's land at the most; red before in ten places). `moveArrows.test.ts` (`pressesAt`: over the
  front, behind it, along it, round a corner of the enemy's land the line lies over, the reach as the crow flies
  from where the formation stands, land that may not be taken, the map's seam; `ownSideLength`).
  `advancing1938h.test.ts` (on the 1938 map: a march presses on the first of the enemy's cells along its route; one
  over its own land whose line lies over a corner of the enemy's is none, where the line's rule said an advance).

## ADR-1164 · 2026-11-27 · the user's decision ("Keep the tick") · R236's two days are read "from ground not the foe's"; the divisions on the foe's own ground are R239's

- **The case.** R236's AT: "on that day and three weeks on no land formation behind a held front has stood 7 days
  with one order whose way is over the held foe's land". On R236's code the replay has, on 23 November and 14
  December 1939: from ground not the held foe's, none and none (147 and 157 before); on the held foe's own ground,
  5 and 3 British divisions by the Polish Corridor (6 and 3 before), each a week or more with one order over land
  Germany holds.
- **What was done.** R236 is ticked on the reading that a formation "behind a held front" stands on its own side
  of it. The checker's rule `stand` has the same exception (it counts the marches on the foe's own ground,
  `TrackRun.stranded`, and judges none), and the exception was written after the checker's first run failed on
  those divisions: the bar was drawn to what R236's rule owns, and the rest filed as R239 with its counts on the
  replay's own seed (16 pairs, the United States' on the National Liberation Front's 60,578 formation-days).
- **Why it is not R236's.** A way from closed ground walks on it (ADR-149), so the way of such a march made again
  is the same way. What frees those formations is another rule (to walk out as a march home does, ADR-222, or to
  be set down on their own side's land as at a stage, R66c), with decisions of its own to check.
- **Put to the user:** keep the tick, and R239 takes the rest as filed; or read the AT by its letter, and R236 is
  open again until R239 is done.
- **Ruled** (the user, 2026-11-27: "Keep the tick"). R236 stays ticked on that reading. The formations on a held
  foe's own ground are R239's, as filed.

## ADR-1163 · 2026-11-27 · accepted · No way over the land of a foe whose front the historical track holds (R236)

- **The case** (found by R235, the user's arrows of the replay's 23 November 1939). A march waits where its next step
  is onto an enemy's land until the territory system takes the cell (PLAN 1.14, SPEC §4.2, `waitsForFront`). Across a
  front the track holds no cell is taken and no attack is planned (ADR-929: `holdsLand`, `foesOf`), but a way was
  still made over the held foe's land: for a march to the marcher's own land beyond it (the five German divisions at
  Strasbourg, ordered 4 to 7 cells along their own front), for the AI's other orders, for an order from before the
  hold. Such a march stood at the front with its order for as long as the hold lasted. By a run: from one save of
  that day 155 marches wait at a front, the land ahead of all 155 held (Germany's 23, France's 25, the United
  Kingdom's 8, Japan's 28, China's 57, Manchukuo's 12, Mengjiang's 2), and 21 days on 149 are in the same cell with
  the same order, each still waiting; from the same save with the holds taken out, 11 of them stand so after five
  days and 4 after 21.
- **Decision.**
  1. The land of a foe whose front the track holds is closed to a nation's ways, as a third nation's is
     (`passageOf`, by `World.holdsPlan`: a hold between the two and no stage's days open between them). A way goes
     round by its own side's land; with no such way the order is refused, whoever gives it (the AIs, the
     timeline's `redeploy`, a God Mode order while the replay runs: that one with the reason of a way barred by
     nations outside the war, and it ends the replay as any command does, ROADMAP R240).
  2. A march under way whose next step is onto such land, from ground that is not that foe's, does not wait: its way
     is made again from the cell it stands on, by the ground of now, or it halts there (the branch a barred step
     takes, ADR-171, ADR-172). A march home keeps its own rule (ADR-222).
  3. In the days of a stage between the two (R66d, ADR-974: `pairOpen`) the land is open as in any war and a march
     waits at the front as before; when the days end, (2) takes the marches still waiting.
  4. A formation that stands on the held foe's own ground is left as it was: closed ground is walked on and out of
     by who stands on it (ADR-149), so its way made again is the same way, and it waits before its next cell. The
     checker counts these and does not judge them: ROADMAP R239, and ADR-1164 for what that makes of this
     item's AT.
- **Why by the two nations, where R235's arrows ask by the cell.** An arrow is judged on the land its line crosses
  today (`holdsLand`). A way is over holders, not cells (a `Passage` opens or closes a holder's ground, and routes are
  kept by it), and the planners ask by the pair already (`foesOf`): in a stage's days they plan attacks on that foe,
  and their marches have to be routed. So in a stage's days a march of that pair may still be ordered over the foe's
  land away from the stage's, and wait there until the days end: 7 days, or the stage's own (five stages have 10 to
  80). The checker does not count those days.
- **Consequences.**
  - A hold has a fourth leg (it amends ADR-929): no fight on land, no land taken, no attack planned, and no way over
    each other's land.
  - Before and after, by one probe on both rules from the replay's start, read as the checker reads (a march
    waiting at a held front from ground not the foe's, a week or more with one order): 10 September 1939 99 → 0, 15
    October 131 → 0, 23 November 147 → 0, 14 December 157 → 0, 1 February 1940 181 → 0, 5 April 98 → 0, 9 May
    98 → 0. The land marches under way on 23 November: 269 → 141. The Rhine that day, pictures in
    `docs/evidence/R236/`: the two armies in their cells along the front, no arrow, none with France looked at.
  - The replay's course moves inside its bars (`historyMatch1938h`, against the same run on R238's code): Paris
    Germany's from 10 June 1940 as before; 1,009 French cells Germany's on 22 June (936; the bar 500); 11,020 Soviet
    cells the Axis's after 1 December 1941 (10,734; the bar 6,000); the Soviet army of 1 November 1942 4,005k
    (3,396k; the bar 2,000k). Of its 44 map lines 40 are the same and four of control move by 0.05 points at most
    (1 December 1941: whole 99.19 → 99.14 %, right 96.2 → 96.1 %, astray 0.56 → 0.61 % with its bar at 1 %).
    The China front (`chinaFront1938h`): Japan holds 15.2 % of China on 1 November 1938 and a year on, as before;
    China's army there 746k (809k), a year held 390k (381k; the bar 0.4 of the start's).
  - A free game has no hold: seed 99 over three years ends on the same hash by both rules, and the pin is unmoved.
  - The tick, by pairs run at once on cores of their own, the masks then swapped: the replay's first eight years
    1.94 → 1.76 ms (2.01 and 1.87 against 1.81 and 1.72: fewer marches under way); a free game 1.79 and 1.77 ms
    (1.83 and 1.75 against 1.78 and 1.75: the two cores differ by more than the rules).
  - Left, R239: formations on a held foe's own ground, counted on the replay's own seed in formation-days past a
    week: the United States' on the National Liberation Front's (Vietnam) 60,578, South Korea's there 882, the
    Philippines' there 588; the Soviet Union's on Germany's 1,754; Ceylon's on Japan's 773; the United Kingdom's on
    Germany's 451 (five divisions by the Polish Corridor on 23 November 1939, three on 14 December); and ten pairs
    more of 2 to 198.
  - The checker and this item's probes ask between two ticks, and `redeploy` orders its marches while an hour's
    events are applied: both asked for the track's open stages out of turn, and the asking changed the course. Found
    by this item's measuring and mended first (R237, R238); every figure here is read on their code, the probes'
    hashes the plain run's (23 November 1939: c43d19b9 by this rule, 1a5c4ff4 before it).
- **The decisions it stands on (ADR-803)**, each with its test green before (on R238's code: its gate and its
  ten-year run) and after: ADR-929, the hold (`chinaFront1938h`); ADR-931, the West in 1940 and `redeploy`
  (`historyMatch1938h`); ADR-974, a stage's days (`trackFight1938h`, and this item's test of a march ordered in
  them); ADR-971, a planner's own front across a frozen hold (`trackLevers1938h`, `trackEndHolds1938h`); ADR-947 and
  ADR-950, the checker, its own seed the bar (`historyTrack1938h` and seeds 1 to 5); ADR-1095, the march that waits
  for the front (`heroFront1938`); ADR-149, ADR-169, ADR-172 and ADR-222, closed ground, the march home and the
  barred step (`movement.test.ts`), and ADR-171, a path and a change of the ground (`pathsKept`); ADR-1162, which
  marches are advances (`advancing1938h`, its marches now ordered as before a hold, since across one none is
  ordered; `arrowsHeld1938h.spec.ts` by hand). SPEC §4.2 and §7.7 say the rule.
- **Read.** `heldFrontMarch1938h.test.ts` (a timeline of its own, Germany and Poland held: a march to its own land
  beyond goes round and arrives; with no way round, and onto the foe's land, the order is refused; a march under way
  when the hold begins is made again or halts; in a stage's days the taker's march onto the stage's land is ordered:
  three of the four red on the rule before). The track's checker has the rule (`stand`, ADR-804: asked every day of
  the replay to 1991): no line on the replay's own seed, no warning on seeds 1 to 5.

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

