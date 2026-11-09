# Warism — Roadmap

What is still to do after `release-2026-11-03` (ADR-805, the user's decision). PLAN.md and
`docs/PLAN_DONE.md` are the frozen record of the build up to that release.

Rules:
- Work top-down. "continue" means the first unchecked item (PROMPT.md).
- Each item says what it is for, its acceptance test (`AT:` names a figure, its bar and the run that
  reads it, or the case that must hold; ADR-554), and the rules it adds to a checker, when it changes
  a sim rule (ADR-803, ADR-804).
- An item too big for one sitting is split into lettered parts (R3a, R3b), one level only.
- Tick it (`- [x]`) in the commit that finishes it, with one line under it: the commit and the
  evidence. Ticked items stay until the batch's release, then move to CHANGELOG.md.
- A batch ends with a critic run and a release tag (`release-<YYYY-MM-DD>`, PROMPT.md "Releases"; a
  second on one day takes a letter, `release-2026-11-03b`, ADR-820).

## Released

- `release-2026-11-03b` (2026-11-03): R0a–R0i and Batch 1 (R1–R5, R7–R15), in CHANGELOG.md for
  players; the items with their evidence in `docs/history/ROADMAP-release-2026-11-03b.md`.

## Later

- [x] R6 **SPEC.md as the game is.** The rest of SPEC.md after R0i: each section rewritten to what
  the code does now, the history left to DECISIONS. Rules of the rewrite: ADR-821. Each part's AT:
  its section added to `tests/unit/specRefs.test.ts` at 0 misses, and every constant it states read
  from the code, listed with file and line in PROGRESS.
  - [x] R6a The references checker (`tools/spec/refs.ts`) and §10, testing and verification (§2's
    three stale names fixed).
    Done (ADR-821): `specRefs.test.ts` 4 of 4; §10 had 6 misses at HEAD (parity, critic:due), 0 now.
  - [x] R6b §3.1–3.3: map, cells, provinces, cities and zones. The test judges whole sections: add
    `'3'` (§3.4–3.7 have no miss now) and call §3.1–3.3 current in SPEC's header until R6c.
    Done: §3.1–3.3 rewritten from three read-throughs of the code (22 → 21 KB: the history and measurements out, the cell layer, air zones, basins and port state in); `specRefs.test.ts` 5 of 5.
  - [x] R6c §3.4–3.7: nations, diplomacy, military, tech and production.
    Done: rewritten from four read-throughs of the code (38 → 26 KB); `specRefs.test.ts` 5 of 5.
  - [x] R6d §4: territory, fronts and the strategic layer.
    Done: rewritten from two read-throughs of the code (29 → 11 KB), in six subsections; `specRefs.test.ts` 6 of 6.
  - [x] R6e §5: combat.
    Done: rewritten from a read-through of the code (11 → 7 KB); `specRefs.test.ts` 7 of 7.
  - [x] R6f §6.1–6.2: armour and the navy. As R6b: add `'6'`; §6.1–6.2 current until R6g.
    Done: rewritten from two read-throughs of the code (21 → 11 KB); `specRefs.test.ts` 8 of 8.
  - [x] R6g §6.3–6.4: aircraft and nuclear weapons.
    Done: rewritten from two read-throughs of the code (24 → 13 KB); `specRefs.test.ts` 8 of 8.
  - [x] R6h §7: the AI.
    Done: rewritten from three read-throughs of the code (29 → 9 KB); `specRefs.test.ts` 9 of 9.
  - [x] R6i §8: semantic zoom.
    Done: rewritten from three read-throughs of the code (43 → 10 KB); `specRefs.test.ts` 10 of 10.
  - [x] R6j §9: UI and UX.
    Done: rewritten from three read-throughs of the code (39 → 11 KB); `specRefs.test.ts` 11 of 11, every
    section at 0 misses (SPEC.md now 1,878 lines).
- [x] R16 **Traits that do nothing** (found by R6c). Of a trait's modifiers only `income` and
  `manpower` act; `landAttack`, `org`, `stability` and the rest are validated and read by nothing.
  The user's decision (2026-11-03, ADR-822): make them act where the game has a rule, drop the rest,
  let God set a nation's traits.
  - [x] R16a Traits are state (`nations.traits`), shown in the nation panel, set by `setTraits` and
    the God tab; save format 2. AT: seed 99's year hashed without the new column equals the old pin.
    Done: 614c24dd without the column; pin f7089e32; `traits.test.ts` 4 of 4.
  - [x] R16b The modifiers act (ADR-822's list); `fortStrength` and `industry` as there; the others
    dropped from the data. AT: a test a modifier that its system moves the right way for a nation
    given the trait; `diploInvariants` and a ten-seed sweep within the sweep's bars; the pin moved
    and logged.
    Done: all 16 kinds act (none dropped), `stability` on core land only; `traitEffects1938.test.ts`
    11 of 11; sweep limits 7 of 10 as done31 (bar 8), the rest 10 of 10 bar stasis 9 (reported);
    `diploInvariants` 99 0 broken; pin aa1a5dbb.
  Also: `src/sim/systems/war.ts`'s header says a side fights to the death by any
  member's flag, the code by its leader's. And the scenario's `revival.cooldownDays` is read by
  nothing (the cooldown is `REVIVAL_COOLDOWN`); found by R6d. `retreat.ts`'s header puts the retreat
  point 3 cells from the enemy, the code 3 cells beyond the formation; the snapshot's `majors` is read
  by no UI (R6e). `air.ts`'s header says no land rule reads a wing (R6g). `src/app/player.ts`'s header
  says taking control switches the nation's AI off (ADR-759: its layers but nukes stay on), and
  `exportScenario` clears every statistic but `stats.nuke` (R6j). SPEC §9.3 says a right-click orders
  a march; it is a left-click with formations selected (the right-click is the nation menu).
  Done: the headers of `war.ts`, `retreat.ts`, `air.ts` and `player.ts` and SPEC §9.3 say what the
  code does; `exportScenario` drops `stats.nuke` too (`scenarioFile.test.ts`, red without it).
  `revival.cooldownDays` stays: `scenario1938.test.ts` pins the files to `REVIVAL_COOLDOWN`. The
  `majors` of `inspect` stays: that reply is for tests and the critic, not the UI.
- [x] R18 **Blocks of two stacks stand in one another** (found 2026-11-04 by `stackBlocks1938.spec.ts`, red
  since R16b's new history). Seed 1212, the Soviet Union at war with Poland from tick 0, day 20: Soviet
  blocks of two stacks, attacking two neighbouring Polish divisions, overlap (66/164 0.024, 153/164
  0.027, 156/200 0.024 slot apart, under the 0.05 gap). `deployOf` (`src/sim/systems/elements.ts`) keeps a
  block clear of enemy blocks in its way and stacks the lines of one stack, but not clear of a friendly
  block of another stack. The rule was always so; R16b's history made the scene. AT:
  `stackBlocks1938.spec.ts` green unchanged (its scene now on day 20), and a unit case of two stacks of
  one side on neighbouring enemies whose blocks keep the gap.
  Done: `deployOf` reads its own side's blocks of other stacks before it in the order (ADR-824);
  `deployStacks1938.test.ts` (seed 1212 day 20, no two Soviet blocks in one another; red without: four
  pairs), `stackBlocks1938.spec.ts` 2 of 2 unchanged; pin 6012d9d2.
- [x] R17 **Landings the player can order** (the user's decision, 2026-11-04, ADR-823). A left-click on
  land over the sea with divisions selected already lands them, but only when the player's transports
  wait at a port of their land; else it is refused. Nothing shows a division bound for a port, waiting
  or at sea; divisions land one by one; the player's transports sail unescorted.
  - [x] R17a Transports come to the troops: with none at a port of the division's land, the nearest
    idle transport group of its nation (not under the player's own order) sails to the port of that
    land nearest the division; the division marches there and boards when both are in. AT: a 1938
    case, a British division in England and Britain's only transports at Gibraltar, ordered to land
    in France: it boards at an English port and lands within the days the voyage takes; with no
    transports at all, the refusal says so.
    Done: `callTransports`, `world.seaFetch` (saved, optional); `landingCall1938.test.ts` 3 of 3 (Ulster
    from London, the group from Gibraltar boards on day 6 and lands on 8.5; red without the call);
    pin unmoved (no player in the pinned run).
  - [x] R17b Landings together: divisions ordered over the sea in one click share the transports,
    sail as one convoy and land on the same stretch of coast; those that do not fit wait for the next
    voyage. AT: three divisions, room for two: two land together, the third on the return trip.
    Done: `assignTransports`, `convoySystem`, `world.convoyPort` (saved, optional);
    `landingCall1938.test.ts` 4 of 4: one group at Portsmouth (room 25,200), three full divisions
    (12,460): two land in the same hour, the group returns, the third boards after they landed and
    lands later; red with the hold off (hours 111 and 228). Pin unmoved.
  - [x] R17c Shown: the formation panel says marching to port, waiting for transports, at sea, or
    landed; the map draws the sea leg and the landing point; the cursor over land across the sea
    says the order goes by sea. AT: an e2e spec of an order over the sea, each state in turn.
    Done: `FormationDetail.voyage`, `Snapshot.voyages` (`drawVoyages`), the `overSea` request and the
    tooltip's line; `landingVoyage1938.spec.ts` 1 of 1 (Britain's transports at Gibraltar, a division
    from London to Belfast: tooltip by sea, then to port, waiting, at sea, landed, the leg drawn).
  - [x] R17d Escort: an "Escort with warships" box in the panel of the selected divisions, ticked by
    default and remembered. Ticked, the order takes the nearest idle warfleet of the nation (never
    one under the player's own order) to the landing water ahead of the transports; it stays until
    the divisions are ashore, then goes home or back to its station. None free: the transports sail
    alone and the message says so. AT: a case with a free warfleet (escorted, at the water before the
    transports) and one without (alone, told); the box's state survives a reload.
    Done: `escortConvoy`, `escortSystem`, `world.escorts`, the panel's box (`Settings.escort`);
    `landingEscort1938.test.ts` 3 of 3 (escorted, there first, back once ashore; none free: alone,
    `ConvoyUnescorted`; no box: none), `landingEscort1938.spec.ts` (the box, the told notice, a reload).
  Also: a fleet the player orders stays the player's while it lives (`playerOrderSystem` ends a
  march only off the water; `afloat` holds for any fleet), though the header says on arrival. R17a
  relies on it: a called group stays the player's from the call through the landing. Ending it on
  arrival needs the called group kept another way first (R17b's convoy).
- [x] R19 **A rule change runs the seeded e2e specs** (found 2026-11-04). R16b changed the sim's rules and
  passed the gate, which ran the specs whose files changed; ten specs that set up a scene in a seeded
  1938 world (a battle on a day, a fall of a capital) were red, found only by a full run of the suite.
  The gate: when a sim input changes (as for the pin of seed 99), the e2e specs that step a seeded
  world too, or all of them. AT: a changed sim rule makes the gate run them (`gate.test.ts`).
  And a full-suite run at four workers turned six or seven specs red by load in each of two runs
  (green alone): such a run needs the gate's rule of a red run again alone, or its reds are noise.
  Done: a moved pin (its file changed) runs the e2e stage in full, with the gate's rerun-alone rule
  (ADR-825); `gate.test.ts`.
- [x] R20 **A landing on a neutral coast is undone overnight** (critic run 32, R32-B1, blocking). A
  player's order over the sea onto the ground of a nation outside its wars sailed and landed; the next
  day start's march home set the division back at its spawn point across the sea, untold. AT: such an
  order is refused, with the reason; the same order onto an enemy's ground goes; a jump home is told.
  Done: `seaConvoy` refuses `Neutral` (15) by `foreignTo` of the target's and the landing's holders;
  `FormationSentHome` (71), a row below the ticker (ADR-826); `landingNeutral1938.test.ts` 3 of 3,
  `landingNeutral1938.spec.ts`. Pin unmoved.
- [x] R21 **Naval back to its bar: the edges of the landing order** (critic run 33: no blocking issue, naval 7 under
  its bar of 8 for R33-N1–N4 and R32-N1). Each sub-item its own commit; then the critic again.
  - [x] R21a A sea order outlives the peace (R33-N1): a division bound for a landing (marching to its port,
    waiting, or boarding) whose landing's ground became a neutral's is stopped, `Neutral` told, as a march is
    stopped at the border. AT: Japan's division ordered to Java at war, peace before it boards: it never
    boards, and is told; red without the rule.
    Done: `neutralLanding`, checked hourly for the bound and before a loading convoy sails (ADR-826);
    `landingPeace1938.test.ts` 2 of 2 (Britain on German-held Calais, peace before boarding and while loading).
  - [x] R21b A port bombed shut says so (R33-N2): a division refused at its own shut port is told that the
    port is shut, not "no port of its nation". AT: Britain at Portsmouth, the port shut: the reason is the new one.
    Done: `tryLanding` tells `PortShut` (16) where the only ports it stands at are shut;
    `landingPortShut1938.test.ts` (red without: `NoPort`).
  - [x] R21c A refusal is read in full (R33-N3): a refused order keeps the formation panel open with the
    reason in it; the tooltip over a neutral's coast says the landing would be refused, not "go by sea". AT: an
    e2e spec with a real mouse click over Calais at peace: panel open with the reason; the tooltip's line.
    Done: `overSea` 0/1/2 and `tooltip-sea-refused`; a refusal reopens the selected formation's panel
    (ADR-826); `landingNeutral1938.spec.ts`'s mouse test.
  - [x] R21d Many sent home are told (R33-N4): divisions of the player's set home in one hour are one row
    that counts them, and each is a History event. AT: ten set home at once: one row naming ten, ten History rows.
    Done, restated: one History record that counts them, as the row does (`FormationsSentHome`, ADR-826);
    `sentHomeMany1938.test.ts`.
  - [x] R21e One click lands together (R32-N1): the divisions of one click to one target board one convoy
    where one group has room, rather than two groups at two ports weeks apart. AT: Japan's two divisions
    to Shanghai land within a day of each other.
    Done, restated (no group has room for both there): a full convoy's port first for the click's next
    division, and convoys there for one landing sail together; the panel's `aboard` (ADR-826);
    `landingTogether1938.test.ts` (hours 632 and 633; before, 123 and 510).
- [x] R22 **Naval back to its bar: the refusal at the port, the wait aboard** (critic run 34, focused: one blocking
  issue, R34-B1; naval 7 under its bar of 8 for R34-B1 and R34-N1). Each sub-item its own commit; then the critic again.
  - [x] R22a A refusal at the port is told (R34-B1): the worker's `orderNews` forgets a player's order at the hour's
    `FormationArrived` and drops the `MoveRejected` that follows it, so a division refused at the port it marched to
    (shut, no port, no transports, no sea way) is told nothing. AT: an e2e spec, Britain at war with France, divisions
    to Calais, Portsmouth bombed shut: the row and the panel say the port is bombed shut; red without the fix.
    Done: an arrival forgets the order only when no refusal of the formation follows in its hour (`refusedLater`);
    `serverPortShutNews1938.test.ts` (Belfast via the worker: told `PortShut`; red without, nothing told),
    `landingPortShut1938.spec.ts` (seed 3517, three to Calais: division 270's row and panel "its port is bombed
    shut"; red without). Worker only: pin unmoved.
  - [x] R22b The wait aboard has a way out (R34-N1): a division aboard a player's convoy still loading at its port
    takes an order: it goes ashore at the port and the order stands. AT: four Japanese divisions to Shanghai, a recall
    of the first while it waits aboard at Tokyo is obeyed (ashore, marching; not refused); red without the rule.
    Done: `ashoreAtPort` (ADR-826, R22b); `landingAshore1938.test.ts` (ashore by the port, marching; the other three
    land together; red without: refused `Aboard`). The AI's embarked untouched: pin unmoved.
  - [x] R22c The wait aboard is accounted for (R34-N1): the waiting division's panel says how many of the landing are
    aboard and the furthest one's days to the port. AT: four Japanese divisions to Shanghai: "1 of 4 aboard" and the
    days, at the hour the first boards.
    Done: `voyage.wait` (`landingWait`), the panel's "Landing" row; `landingWait1938.test.ts` (said 47 days at hour 2,
    the last at the port after 46.6; red without), `landingWait1938.spec.ts` (desk and phone). Worker and UI: pin unmoved.
  - [x] R22d The escort waits for the sailing (R34-N1): the escort of a new convoy sails when the convoy is loaded,
    not at the click, and is at the landing first. AT: four Japanese divisions to Shanghai: no escort at Shanghai's
    water more than a day before the last division is aboard; each convoy's escort there before its transports;
    landed together, and no later than without the escort.
    Done: kept where it stands, it sails when its voyage (`sailHours`) is at least the wait left (`waitLeft`); a
    loaded convoy waits only for one that would be late (`escortAhead`; ADR-826, R22d). `landingEscortWait1938.test.ts`
    (escorts there 1117–1120, last aboard 1121, landed 1242–1243 as unescorted; Belfast 110 either way; red without:
    there from hour 23). `landingEscort1938.test.ts` unchanged. Pin unmoved.
  - [x] R22e The aboard status keeps to its column (R34-N2): "Aboard at Tokyo, waiting for the rest of the landing"
    wraps under its value, not into "Status". AT: the panel's crop at 1600 × 900 and 390 × 844, label and value apart.
    Done: `.panel-row` keeps its label's width, a gap, the value right-aligned (`style.css`); `landingWait1938.spec.ts`
    (Status and Landing rows: label ends ≥ 4 px before the value's leftmost line, desk and phone; red without, 0 px).
  - [x] R22f A refusal notice goes when it stops being true (R34-N3): the panel's refusal is cleared when the
    formation's order or state changes. AT: the recall refused in Tokyo, then the convoy sails: no refusal under
    "At sea, bound for its landing".
    Done, restated (R22b obeys that recall now): `staleNotice`, a refusal only; `orderNews1938.spec.ts` (Switzerland
    refused London, the notice held over two hours standing, gone once marched to Zurich, the ticker's row kept; red
    without). The rest of the news stays (`landingEscort1938.spec.ts`'s "no warships free" while bound).
  - [x] R22g A sea order on open water says so (R34-N4): a click onto the sea off Bergen is refused for the sea, not for
    "a way by land". AT: Britain's division clicked onto the water off Bergen: the reason speaks of the sea.
    Done: `RejectReason.OpenSea` (17, "there is only sea there"); `orderOpenSea1938.test.ts` (the player's order and an
    order of no player; the Thames water still goes; red without, `NoRoute`), `landingNeutral1938.spec.ts`'s click.
    A reason only: pin unmoved.
  R22 done; then the critic again.
- [x] R23 **Naval back to its bar: the way out of the wait aboard** (critic run 35, focused: two blocking issues,
  R35-B1 and R35-B2, both in R22b's `ashoreAtPort`; naval 7 under its bar of 8 for them). Each sub-item its own
  commit; then the critic again.
  - [x] R23a A refused order leaves the division aboard (R35-B2): the order is judged before the division goes ashore;
    a refused one leaves it aboard, its landing kept. AT: Japan's four to Shanghai, the one aboard at Tokyo ordered onto
    open sea and onto Calais (France at peace): refused (17, 15), still aboard, and all four land together; an e2e spec,
    the panel still "Aboard at Tokyo" with the refusal; red without.
    Done: `orderMove` judges the order with the division ashore and puts it back aboard on a refusal (`ashoreAtPort`'s
    way back); `landingAboardRefused1938.test.ts` (open sea 17, Calais 15: still aboard, its place kept, the four land
    together; red without, ashore), `landingAboardRefused1938.spec.ts` ("only sea there" over "Aboard at Tokyo", "1 of 4
    aboard"; red without). The player's convoys only: pin unmoved.
  - [x] R23b Ordered to the same landing again, the division aboard stays (R35-B1): an order of a division aboard a
    loading convoy to the landing it is bound for changes nothing, and no division is bound to a group beyond its room
    when another of its click is bound to it. AT: Japan's four to Shanghai, the one aboard clicked to Shanghai again:
    no division waits at Tokyo without room, all four land within a day of each other, no later than without the
    second click; red without (365 on the quay h512–h1367).
    Done: `sameLanding` (same land and water): the order is taken and the division stays aboard;
    `landingSameAgain1938.test.ts` (escort on: landed 1242–1243 as clicked once, none on the quay; red without,
    ashore). Sent instead to four other Chinese coasts, it is refused `NoTransports` and stays aboard (R23a), so no
    rebinding happens to leave another on the quay: no rule of binding changed. Pin unmoved.
  - [x] R23c A refusal notice goes with the next accepted order (R35-N1): not only when the state changes. AT:
    Germany's division marching to Hamburg, refused Paris, then sent to central Germany: no refusal under "On the
    march" once the new order is taken; red without.
    Done, Switzerland's division (the critic's Germany case in the spec's own nation): the panel's detail carries the
    cell of its march (`goal`), part of `staleNotice`'s state; `orderNews1938.spec.ts` (marching, refused London, the
    notice held an hour on; sent to the other of Zurich and Geneva, gone, "On the march"; red without). UI only.
  - [x] R23d The escort's wait does not cost a lone landing time (R35-N3): one division to Belfast (seed 3517, the
    critic's case) lands no later escorted than unescorted. AT: `landingEscortWait1938.test.ts` on the critic's seed;
    red without (73 h against 59).
    Done: the escort is the one of the eight nearest that is there soonest by sea (`ESCORT_TRIES`, `sailHours`); the
    nearest had Scotland to go round. `landingEscortWait1938.test.ts` (Belfast, the fourth nearest London: 58 h either
    way; red without, 72; the nearest: 110 either way); `landingEscort1938.test.ts`'s "under way at hour 1" restated
    to R22d's rule (under way, or kept where it stood). Pin unmoved.
  - [x] R23e A whole click clicked again keeps its landing together (R35-N2, older than R22): the four re-sent to
    Shanghai at hour 26 land within a day of each other. AT: a unit test of the critic's case; red without (185, 633,
    952, 1243).
    Done: `sameLanding` covers a division bound for a convoy still at its port: the order stands, the binding kept
    (cleared, its convoy lost its landing with it and it went on another's next voyage). `landingSameAgain1938.test.ts`
    (all four again at hour 26: the same transports, landed 1242–1243; red without, three bound to 1136). Pin unmoved.
  R23 done; then the critic again.
- [x] R24 **Naval back to its bar: a click near the landing** (critic run 36, focused: two blocking issues, R36-B1 and
  R36-B2, both a click a cell off Shanghai; naval 7 under its bar of 8 for them). Each sub-item its own commit; then
  the critic again (a full run, run 37).
  - [x] R24a A refused order leaves every division's landing standing (R36-B1): a division bound for a convoy (walking
    to its port, or waiting there) keeps its binding when its new order is refused, as the one aboard does (R23a); a
    convoy never sails because its bound divisions' refused orders cleared them. AT: Japan's four to Shanghai, all four
    re-clicked one cell east at hour 26 and a walking one ordered onto open sea: whatever is refused stays bound or
    aboard, and all four land within a day; red without (364 lands alone at t148, the rest at Tokyo).
    Done: `orderMove` restores the binding on any refusal (`keep`); `landingRefusedBound1938.test.ts` (the walker onto
    open sea: refused, still bound to 1144; all four a cell east: all refused, each keeps its transports; landed
    1242–1243 both; red without). Pin unmoved.
  - [x] R24b A click a cell or two off the landing is the same landing (R36-B2): for a division aboard or bound, an
    order whose landing is within two cells (water and land) of its own, on the same land holder, is that landing.
    AT: the two nearest Tokyo to Shanghai, the one aboard re-clicked one cell east: both land within a day; red without
    (h633 / h1285).
    Done: `sameLanding` takes a landing within `SAME_LANDING_CELLS` (2), same holder; `landingNearSame1938.test.ts`
    (one cell east, one south, two east: still aboard, landed 632–633; Fuzhou another; red without, 633 / 1285). Pin
    unmoved.
  - [x] R24c A refusal notice goes with any order taken (R36-N1): an order given after the refusal, even to the march's
    own goal, ends it. AT: Germany's (here Switzerland's) division marching, refused, re-clicked on its own goal: no
    notice; red without.
    Done: `Hud.orderedAt` (the news `seq` at a formation's last order sent), read by `staleNotice`;
    `orderNews1938.spec.ts`'s fourth test (re-clicked on its own goal: no notice, "On the march"; red without). UI only.
  - [x] R24d The one aboard sent to another landing is told why (R36-N2): not "no transports … at a port it can
    reach" while it sits aboard transports at that port. AT: the one aboard ordered to Fuzhou: the reason names its
    transports as loading for another landing; red without.
    Done: `RejectReason.Loading` (18, "its transports are loading for another landing…") for the one gone ashore
    from its convoy; `landingAboardRefused1938.test.ts` (Fuzhou: 18, still aboard, the four land together; red
    without, 6), its spec (the panel's words over "Aboard at Tokyo"; looked at). A reason only: pin unmoved.
  R24 done; then the critic again (run 37, full).
- [x] R25 **Naval back to its bar: a click two cells off the landing** (critic run 37, full: one blocking issue, R37-B1;
  naval 7 under its bar of 8 for it, every other score at its bar). Each sub-item its own commit; then the critic again.
  - [x] R25a The near-miss is measured from the click (R37-B1): for a division aboard or bound, a clicked cell within
    `SAME_LANDING_CELLS` of its landing's land, on the same holder, is that landing, whatever landing the click itself
    resolves to. AT: the two nearest Tokyo to Shanghai, the one aboard re-clicked two cells south (1715.5, 415.5) at
    hour 26: both land within a day; red without (633 / 1288).
    Done: `sameLanding` also takes a click within `SAME_LANDING_CELLS` of the cell the landing was ordered for, same
    holder; `landingNearSame1938.test.ts` (two south, two south-west: landed 632–633; red without, 633 / 1288 and
    633 / 1291). Pin unmoved.
  - [x] R25b A division aboard never leaves its transports untold (R37-B1): the one aboard a loading convoy, sent to
    another landing and taken to another port's transports, is told it leaves its landing (a notice in its panel and
    a row). AT: the two to Shanghai, the one aboard ordered to a landing far off with other transports free: a notice
    says so; red without (none).
    Done: `LeftLanding` (73), the order's news "leftLanding" ("its transports are loading for another landing; it
    left them for other transports and will not land with the rest"); `landingLeftTold1938.test.ts` (Fuzhou: taken,
    1136 → 1151, told) and its spec (the row and the panel's notice; looked at). Red without. Pin unmoved.
  - [x] R25c No false refusals for a near re-click (R37-N1): the walkers of a whole click re-clicked near their landing
    keep it and are told nothing. AT: all four re-clicked two cells south at hour 26: no refusal for the three walking,
    all land within a day; red without (three refused 6).
    Done: by R25a's rule (`sameLanding` takes a bound division too); `landingNearAll1938.test.ts` (all four two south,
    and two south-west: none refused, each keeps its transports, landed 1242–1243; red without R25a). Pin unmoved.
  R25 done; then the critic again (run 38).
- [x] R26 **Naval back to its bar: news true to the landing kept** (critic run 38, focused: one blocking issue, R38-B1,
  new in R25; naval 7 under its bar of 8). Each sub-item its own commit; then the critic again.
  - [x] R26a A landing kept by a near re-click is judged against that landing (R38-B1): an order the sim keeps as the
    same landing (`sameLanding`) keeps the order's target in the worker's news, so "came ashore away from its target"
    is not told for a landing that went as ordered. AT: the two to Shanghai, the one aboard re-clicked two cells south
    at hour 26: both land within a day, no `landedAway` for either; and the four, all re-clicked there: no news at the
    landing; red without (364 told at h632).
    Done: the worker asks `sameLanding` when the order comes and keeps the landing's target as the order's;
    `landingNearNews1938.spec.ts` (seed 3517: two, and all four, land with no news; red without, 364 told, and all
    four). Worker only: pin unmoved.
  - [x] R26b R25b's notice says which landing it leaves (R38-N1): its transports load for the landing it had; it is
    the division that goes to another. AT: the words of the notice in `landingLeftTold1938.spec.ts`.
    Done: "it left its transports, which stay with the landing it had, for others bound for its new landing; it will
    not land with the rest"; the spec checks the words (red without). Words only.
  R26 done; then the critic again (run 39).
- [x] R27 **The landing shown while it is chosen** (ADR-827, the user's decision 2026-11-05, after six rounds R21–R26 of
  one class: a click resolved, unseen, to a landing cells away). Each sub-item its own commit; then the critic again.
  - [x] R27a The worker's hover answer names the landing: with land formations selected and the cursor over a target
    over the sea, the landing's water and land, and whether it is the first selected division's own (`sameLanding`:
    then its own landing, not the click's). From the functions the order uses. AT: unit test of the answer (Shanghai
    from Tokyo: `landingOf`'s pair; the one aboard, two cells south: its own pair, `same`).
    Done: `landingFor` (amphibious; `ownLanding` factored out of `sameLanding`), `SeaHint`; the order news takes its
    `goal`; `landingFor1938.test.ts`. Every landing unit test green. Pin unmoved.
  - [x] R27b The map marks it and the tooltip says it: a dashed line from the landing's water to its land and a ring
    there, another colour for the landing the division already has; the tooltip says "the landing it already has".
    Asked again when the sim's state changes under a still cursor. AT: e2e (hover Shanghai: the mark at `landingOf`'s
    land; the one aboard, hover two cells south: the tooltip says its own landing; looked at).
    Done: `drawLandingMark` (orange new, green kept, over a dark edge, over the markers), `Hud.hoverLanding`, the
    tooltip's "the landing they already have"; the hover asked again each tick; the one aboard asked from its port
    (`aboardAtPort`, `overSeaFrom`). `landingMark1938.spec.ts` (two cells south before the order: a new landing; the
    cursor still while they board: green, Shanghai's landing; Fuzhou new; looked at). Pin unmoved.
  - [x] R27c A fuzz of re-clicks about a landing: two and four divisions to Shanghai, re-clicked (the one aboard, and
    all) at hours 26 and 200, at cells one, two and three off in each direction. Inside `SAME_LANDING_CELLS`: none
    refused, all land within a day, no "landed away" (the worker's judgement, factored out to a pure function). Outside:
    any division whose transports change is told (refused, or `LeftLanding`). A case it finds is filed, not tolerated.
    Done: `landingReclickFuzz1938.test.ts` (288 cases, the one aboard, one walking, or all; 26 s). Two finds fixed
    here: a whole click sent elsewhere told the one aboard it lands without the rest; one walking sent alone left
    its partner untold. `LeftLanding` is told once the hour's orders are in, where another keeps the landing left
    (`tellLandingsLeft`, by landing, not transports); the news judges against the marked land (`seaOrderLanding`,
    `landedAway`). Red without. Pin unmoved.
  R27 done; then the critic again (run 39).
- [x] R28 **A changed landing takes its own transports** (critic run 39 on `99ba6c07`: R39-B1 blocking; naval 7, bar 8,
  for R39-B1 and R39-N1). Each sub-item its own commit; then the critic again.
  - [x] R28a R39-B1: when an order takes divisions off a landing, the transports of that landing are theirs to take
    first (released before the choice), so a click that leaves a landing takes its ships with it, and no division is
    refused "no transports" where the click's own stand idle. AT (seed 3517, Japan, the two nearest Tokyo to Shanghai):
    both re-sent to Fuzhou two hours after the first boards sail from Tokyo on their own groups and land within a day
    of each other by ~h700 (red: h1291); of three, the two sent to Fuzhou land within a day of each other (red: 21
    days apart); the four re-clicked three cells south-west: none refused, they land together. The R27c fuzz gains
    these checks (all re-clicked far: no refusal; each landing of a click lands within a day).
    Done: the hour's orders are judged together (`noteLeaving`, `heldGroup`): the transports of a landing they leave
    are theirs to take. Two: h657/h658 on their own groups; of three, the two h657/h658; four: none refused, on
    their own four groups, together. The one aboard sent alone takes its own transports where they carry no one
    else (R24d's refusal kept where they carry another). `landingLeftTakesShips1938.test.ts`; the fuzz gains a
    whole click refused nothing, one port a landing, one target a convoy (a landing within a day: by the three
    cases, too slow for 288). Red without. Pin unmoved.
  - [x] R28b R39-N1: the mark speaks for the whole selection. Where the selected divisions would land at different
    landings, each is marked, and the tooltip says so ("2 landings") rather than "they keep their transports". AT:
    unit test of the answer (the one aboard and a fresh one, two cells south: two landings); e2e looked at.
    Done: `seaHint` (the worker's `overSea` takes the selection), a mark for each landing, "{n} landings, each
    marked: they will not land together". `landingHintSelection1938.test.ts`, `landingMark1938.spec.ts` (looked
    at: green at Shanghai, orange two cells south). Pin unmoved.
  - [x] R28c (found tracing the critic's `c39_ll_three_stagger`) A landing re-sent by two clicks an hour apart: the
    second's own transports, under way to the port for it, are offered there. AT: two to Fuzhou an hour apart, the
    second on its own transports, landing by ~h700 (red: another port's group, h794).
    Done: `comingTo` in the general choice; h658. Red without. Pin unmoved.
  R28 done; then the critic again (run 40).
- [x] R29 **A click's orders judged as the game sends them** (critic run 40, focused, on `76b88197`: R40-B1 and
  R40-B2 blocking; naval 7, bar 8, for both). Each sub-item its own commit; then the critic again.
  - [x] R29a R40-B2: the game applies each selected division's order at once (`player.ts` one `hud.command` each,
    `now = true`, the worker's `applyNow`), so R28a's `noteLeaving` and R27c's `tellLandingsLeft` judge one division
    at a time: a whole landing re-clicked tells all but the last "the rest keep the old landing". A click's orders
    reach the sim as one batch, applied together. AT, through the game's path (the hud's command, applied at once),
    seed 3517: the four re-clicked three cells SW: no `LeftLanding`; the two re-sent to Fuzhou by one click: none;
    of three, the two sent away: both told; landings as R28a's by that path.
    Done: the click's orders go in one message (`cmds`, `Hud.commands`), taken then applied once. Four SW3: none
    told, h1244/1245; two to Fuzhou: none told, h657/658; of three, the two: both told. `landingClickBatch1938`
    test (the worker as the page drives it) and spec (by `Player.click`); red without. Pin unmoved.
  - [x] R29b R40-B1: a landing redirected to a target another convoy already serves (a fresh division sent to Fuzhou
    first, then the two of the Shanghai landing): the one aboard is put ashore and walks ~50 days to Sasebo while its
    own group sails there empty. A leaver aboard or bound for a group that joins a convoy at another port keeps its
    group, which sails there with it (offered first). AT (by the game's path; the fresh one first, the same hour and
    an hour before): all three land within a day of each other by ~h980 (red: 657 and 1291); 364 never "Marching to
    Sasebo".
    Done: the one aboard is offered its own group at the convoy's port; it stays aboard, and the group sails there
    with it (`sailAboard`). Same hour: h792/792/794; an hour before: h794/794/796; never ashore. Red without (walked,
    h1292). `landingJoinsAboard1938.test.ts`. Pin unmoved.
  R29 done; then the critic again (run 41).
- [x] R30 **The one aboard sails with the convoy it joins** (critic run 41, focused, on `77d37526`: R41-B1 blocking;
  naval 7, bar 8). Then the critic again.
  - [x] R30a R41-B1: R29b's transports, sailing with the one aboard to the port where a convoy for its new landing
    loads, are not that convoy's mate: it sails once its own are aboard, its first lands alone and dies. Britain at
    war with France (seeds 15101, 7019): 270 and 271 to Calais; the hour after 270 boards, 276 to Caen, then the two:
    276 h84 alone (destroyed h233), the two h289 (76b88197: the three h290/291). AT by the page's path (ids
    ascending, applied at once): the three land within a day; R29b's Japan cases unchanged.
    Done: a group carrying and under way to its own convoy's port is still to load (`stillLoading`). Both seeds:
    h288/288/289. `landingJoinsAboardMates1938.test.ts`; red without. R29b's unchanged. Pin unmoved.
  - [x] R30b (critic run 41, R41-N2 and R40-N1's re-click; the advisor's reading: the naval clause lists them, and
    run 42 would hold naval at 7 for them) The one aboard R29b's transports under way to their port takes an order
    as at that port: the same landing changes nothing; another over the sea from there, its transports keep it.
    AT: the R40-B1 case, the two clicked back onto Shanghai four hours later: none refused, both at Shanghai within
    a day (red: refused, Fuzhou h478 against Shanghai h772); clicked onto Fuzhou again: none refused.
    Done: `sailingToPort` in `aboardAtPort` and `ownLanding`; `assignTransports` keeps its own first. Recall h766/772.
  - [x] R30c (R41-N3) Its panel while its transports sail to the port: "Aboard, sailing to {port} to load the rest of
    the landing" (`toPortAboard`), not "At sea, bound for its landing". Red without.
  R30 done; then the critic again (run 42).
- [x] R31 **A convoy's transports and the one aboard: no one stranded or sent off alone** (critic run 42, focused, on
  `1eb4bf85`: no blocking issue; naval 7, bar 8, for six non-blocking ones; ADR-828, the user: "Fix all six, then
  critic"). Each its own commit; then the critic, full.
  - [x] R31a R42-N3: a player's fleet order to the transports of a convoy (loading, or under way to its port) is
    refused, with why; the one aboard is never left at sea. AT: Britain 15101, 270 aboard 1068 at Portsmouth, 1068
    ordered onto the Channel: refused, still aboard at Portsmouth; the landing goes on.
    Done: `Convoy` (19). `convoyFleetOrderRefused1938.test.ts`; red without. Pin unmoved.
  - [x] R31b R42-N2: the division bound for a convoy refused `PortShut` at its port: the convoy does not sail with the
    one aboard alone for that. AT: Britain 16117, the recall case: 274 does not land alone.
    Done: a convoy whose port is shut while it loads is over, all told `PortShut`, those aboard ashore at the port.
    Britain 15101 (the same shape, Calais): nobody lands alone (red: 270 h99). `convoyPortShut1938.test.ts`.
  - [x] R31c R42-N1: the one aboard transports under way between home ports, given a land order: told it takes it at
    the port, and not taken abroad untold. AT: Britain 15101, R41-B1's case, 270 and 271 onto the Midlands while
    270's ship sails to Plymouth: 270 does not land at Caen untold.
    Done: ashore on its side's coast nearest its transports (`ashoreFromShip`), the order taken from there. 270
    marches; neither lands in France (red: refused, Caen h99). Pin unmoved.
  - [x] R31d R41-N1: the bound one of a redirected landing walks to the other port (~29 days) while the transports
    called for it stand empty: where its own transports are free and nearer, they fetch it (as R29b's one aboard).
    AT: seed 3517, R40-B1's case: 365 does not walk to Sasebo while 1144 idles at Tokyo; the three together.
    Done (measured, then the smaller fix): transports with no convoy and nobody aboard are the AI's again, not
    idle under the player's order (a fleet's never ended). The ferry would save ~2 days: not built (DECISIONS).
    R22b's test checks the three (the recalled one is the AI's, ADR-759). Red without. Pin unmoved.
  - [x] R31e R40-N1: one re-sent alone sails at once and cannot be recalled: a convoy of one waits an hour for the
    rest of its click (or the recall takes it back). AT: the one aboard sent alone to Fuzhou, recalled a day later:
    not refused, it rejoins its landing.
    Done: a convoy of one at sea turns back for the nearest port on an order (`turnBack`), taken as there. Both at
    Shanghai h633 (red: refused, Fuzhou h151). `landingRecallAtSea1938.test.ts`. Pin unmoved.
  - [x] R31f R37-N2: a loaded convoy waits for any later order to the same coast (two fresh ones to Fuzhou, one in
    the far north: 364 and 366 still aboard at Sasebo on day 60). A convoy waits only for those whose march to its
    port is near enough; the rest go on the next voyage. AT: the critic's case, both aboard land within ~a month.
    Done: a landing waits for its click (bound within a day of its first) however far, a later order within a week's
    march (`waitedFor`, `seaFetchAt`). Seed 3517: the two h632/633 as without the late one (red: h1289), the late
    one h1290 on the next voyage. `convoyLateOrder1938.test.ts`. Pin unmoved.
  R31 done; then the critic, full (run 43).
- [x] R32 **A recall at sea rejoins its landing** (critic run 43, full, on `813eb375`: R43-B1 blocking, a regression of
  R31e; naval 7, bar 8). Then the critic again.
  - [x] R32a R43-B1: the one alone at sea, recalled to its landing after the first day, was put ashore at the nearest
    port and walked weeks to its landing's port while its partner landed alone (2 d: 16 days apart; 3 d: marching
    on day 60; 5 d: alone, before it). AT: recalled at 1, 2, 3 and 5 days, the two land within a day, or it is
    refused and told; never ashore.
    Done: the transports turn back only for the port where a landing for the order's target loads, and it rejoins
    it there; no such landing: refused "aboard", as before R31e. All four h633 together (red: h1015, h1563, h230).
    `landingRecallAtSea1938.test.ts`. The seed-2207 news test's Kassel order is refused `Aboard` again. Pin unmoved.
  - [x] No critic lap on R32a alone (ADR-829, the user's decision): the rebuild R33 replaces the rules it fixes.
    R43-N1–N4 are inputs to R33. R32a's code went in the critic-run-43 commit `dc365b36`; the next critic run
    diffs from `813eb375`.
  R32 done.
- [x] R33 **The landing as one object** (ADR-829, the user's decision, 2026-11-05; the critic's objection since run
  35 and the Hearts of Iron line in every report since run 32). The player's landing is today resolved per division
  and per hour from a dozen rules (`landingOf`, `sameLanding`, `noteLeaving`, `heldGroup`, `assignTransports`,
  `waitedFor`, `seaFetchAt`, `turnBack`, `ashoreFromShip`, `endConvoy` …); twelve critic runs found where two meet.
  Make it one object: its target (water, land), its port, its transports, its divisions, one state (assembling,
  loading, sailing, landing, over), one sailing. A click makes or joins one; a re-click, a redirect, a recall or a
  cancel is an edit of it, refused with a told reason when it cannot be done; a cancel at sea sails back to its own
  port. The map's mark, the panel and the news read the object. Constraints (ADR-829 "How"): player landings only,
  AI path untouched, pin unmoved; `world.landings` saved only when not empty, older saves load; each landing test's
  case kept, a test removed only with the rule it pinned, named in the evidence. Split into lettered parts when
  started; a likely cut: the object and its save; orders as edits of it; sailing and landing read from it and the
  per-division rules removed; mark and panel from it; the checker and the fuzz.
  AT (a grid, PROMPT "KEEPING WORK SHORT"): every case of R21–R32 and R43-N1–N4, and each of re-click, redirect,
  recall and cancel at {6 h, 1, 2, 3, 5 days} × {0, 1, 2, 3 cells off} × {the one aboard, one walking, all}, on
  seed 3517 (Japan) and 15101 (Britain): every division of a landing lands within a day of the others, or is
  refused and told why; nobody idle aboard over 72 h; the mark agrees with the outcome. `landingInvariants`
  (a checker as `diploInvariants`, on several seeds, the 120-day sea-order fuzz of critic run 43): no division
  bound to a landing without transports, none aboard transports without a landing, no landing with two ports,
  none over while one of its divisions is at sea; 0 broken. Then the critic, full.
  - [x] R33a The AT's instrument, at HEAD, no sim change: the grid (`tests/helpers/landingGrid.ts`,
    `tools/diag/landingGrid.ts`): {re-click, redirect, recall, cancel} × {6 h, 1, 2, 3, 5 days after the first
    boards} × {0, 1, 2, 3 cells off} × {the one aboard, one walking, all} on 3517 (Japan, Shanghai / Fuzhou) and
    15101 (Britain, Calais / Caen), each case from one saved state. Per case: a landing's divisions land within a
    day, or are told; none lands away from its marked landing; the longest idle spell aboard; a mark before the
    click for each that then lands. AT: the grid runs on both seeds; HEAD's figures (cases, broken by kind,
    longest idle aboard) in `docs/sweeps/` and PROGRESS, the baseline R33b–d are judged by.
    Done: `docs/sweeps/landingGrid-R33a-b166998e.md`. 480 cases, 140 broken, all on 3517: idle 125 (aboard at
    Tokyo up to 507 h while 365 walks), split 15 (recall: the one walking lands alone at h128, its mate h634), mark 5
    (recall at sea: no mark, R43-N4). 15101: 0 broken, but weak: its port is bombed shut, 236 of 480 divisions told
    `PortShut` (R31b); R33b adds a seed whose port stays open.
  - [x] R33b The object, its save, and the player's whole landing path on it: `world.landings` (target, water,
    land, port, transports, divisions with the hour each joined, state, escort), saved only when not empty, older
    saves' convoy sections read into it; a click makes or joins one, an hour's orders edit it as a batch (all of
    its divisions: the landing redirects or cancels; some: they leave it, told); a recall or cancel at sea sails
    back to its own port; the per-division rules (`heldGroup`, `noteLeaving`, `turnBack`, `waitedFor`, `sailAboard`,
    `ashoreFromShip`, `soleAtSea`, `comingTo` …) removed, each with its test named; SPEC §6.2 rewritten; the AI's
    path and the pin unmoved; a save mid-voyage round-trips bit-identical. AT: the 33 landing test files' cases
    green (an hour pinned becomes "within a day"), the grid no worse than R33a's on any kind.
    Done (ADR-830): `src/sim/systems/landings.ts`; divisions wait at the port ashore and board at the sail hour;
    an hour's orders edit a landing as a batch. Grid 15 of 480 broken (R33a: 140): idle aboard 0 (125), mark 0
    (5), split 15 (15), longest wait at the port 507 h (the old idle, ashore now) (`docs/sweeps/landingGrid-R33b.md`).
    36 landing/convoy test files green, `landingSave1938` new (saved gathering and sailing, bit-identical);
    tests changed with the rules they pinned: ADR-830's list. Whole unit suite green; 14 landing specs green;
    pin unmoved.
  - [x] R33c The map's mark, the panel and the news read the object (`seaHint`, `voyageOf`, `landingWait`,
    `voyages`, the news's `landedAway`); a mark for a division aboard at sea (R43-N4). AT: the grid's mark column
    0 broken; the landing e2e specs green.
    Done: the reading went in with R33b (grid mark column 0 of 480). New here: one of a landing at sea ordered
    alone is refused `AtSea` (20, "select all of the landing"), not `Aboard`'s false "no order until it lands";
    alone at sea, the landing's own reason (`NoLanding`, `Neutral`, `NoSeaWay`). `landingAtSeaOrder1938` (one
    refused and told, the two land at Shanghai together; both by one click land at Fuzhou together; the hint's
    mark for the one at sea, R43-N4); `landingMark1938.spec` at sea: one mark at Fuzhou (new), Shanghai's its own.
  - [x] R33d The grid's open case (R33b: the one walking re-sent elsewhere, then recalled: its mate sailed alone
    meanwhile; 15 cases split). `landingInvariants` (as `diploInvariants`) on several seeds and the fuzz (`landingReclickFuzz` with
    recall, redirect, cancel, port shut, late order; the 120-day run a tool): 0 broken. Then the grid on the final
    code (R33's AT), and the critic, full. Also R43-N1 (a player's order to idle transports undone by R31d's "idle
    transports with no landing are the AI's", `playerOrders.ts`): landings now free their groups themselves; drop
    the blanket rule, `landingJoinsAboard`'s `idle` check kept green.
    Done (ADR-831): the recalled one rejoins its landing at another port, keeping the hour it joined; grid 6 of 480
    broken (R33b 15, R33a 140), all the recall after 3–5 days, its mate sailed (by decision, R31f)
    (`docs/sweeps/landingGrid-R33d.md`). `PlayerOrderKind.called`: only transports a landing called go back to the
    AI (`fleetOrderKept1938`, red at t26 before). `landingInvariants` (helper, tool, test): 120 days on six seeds,
    0 broken; found a sunk group kept in its landing (fixed). The critic, full: run 44.
  R33 done; then the critic, full (run 44, on `0fba90d8`: naval 6, bar 8; two blocking issues, both regressions of
  R33: the loop stopped, ADR-832 proposed).
- [x] R36 **Run 44's blocking issues** (critic run 44, full, on `0fba90d8`). ADR-832 accepted (way 1): fix both inside the
  object, the checkers widened first; then the critic. A third regression of the landing there means way 2.
  - [x] R36a R44-B1: a gathering landing re-sent in part by one click keeps too few transport groups; the sail hour
    boards those at the port that fit and sails, leaving the rest standing at the port, still members, untold
    (`gather`: `if (fleet === undefined) continue`); they land alone one by one, ~12 days apart. Split grid: 6 of 8
    shapes split on HEAD, 0 of 8 at `813eb375`; `four_hourly` too. AT: the critic's 8 shapes plus `four_hourly` on
    3517 and 15101, every one-click group lands within a day (or is refused and told); `landingInvariants` gains
    "no sail leaves a division of the landing standing at its port" and "a landing's room covers its divisions"
    (red on `0fba90d8`), and its pool clicks parts of a landing elsewhere.
    Done: a landing sails with room for all at its port (`noRoom`, first fit as at boarding): short, a group free
    at its port or called joins it and it waits; no group anywhere, R17b's next voyage (`landingCall1938`). The
    critic's 10 cases: every one-click group lands within 2 h (HEAD: 7 split); the cost is the call, e.g.
    `four_two_far` 788/789 (HEAD 656/951). `landingPartResent1938` (3517 and 15101, three shapes each, and the
    four one an hour): red on HEAD for the 3517 cases. `landingInvariants` gains `leftBehind`; it did not fire
    in 24 runs on HEAD (the fuzz's nations have spare groups), so the test above is R36a's AT.
  - [x] R36b R44-B2: all of a landing at sea ordered onto water (its own beach's water, open sea, the Yellow Sea) is
    taken as a cancel, sails home, and is refused `OpenSea` a day later at its port. AT: the four waters by click,
    refused `OpenSea` at the click, the landing keeps its course and lands as planned, the hover over water says why;
    the grid and `landingInvariants` click water too (red on `0fba90d8`).
    Done: an order of a landing at sea to the sea is refused `OpenSea` at the click and the landing keeps its
    course; the hover over the sea with one at sea selected says so (`seaHint` 3, "tooltip.bySeaOpen"; the map
    now reports a hover over water while formations are selected). `landingSeaClick1938` (the four waters, red
    on HEAD), `landingMark1938.spec` (the tooltip). `landingInvariants` clicks the sea and checks `cancelWater`:
    HEAD 19 of 24 runs broken; this code 0 of 30 (six seeds × five order seeds, 120 days). Grid 6 of 480, as
    R33d (`docs/sweeps/landingGrid-R36.md`).
  R36 done; then the critic (run 45, focused, on `7e09b7b3`: naval 7, bar 8; one blocking issue, R45-B1: the loop
  stopped, ADR-833 proposed).
- [x] R37 **Run 45's issues** (critic run 45, focused, on `7e09b7b3`). ADR-833 accepted: keep fixing the landing
  until naval is at its bar; its non-blocking issues taken too; the critic's probes replayed on new seeds first.
  - [x] R37a R45-B1: a part re-sent while the group it frees is busy sails short and leaves one at the port untold
    (seed 18705, three of four re-sent: 976/977/1272). At the re-send the new landing keeps the groups it needs
    (also R45-N1's 5.5–6.7 days); the call may take a busy group; one left at the sail hour is told. AT: the
    critic's 40 shapes on its five seeds and run 44's 8 shapes on 3517/15101: every one-click group within a
    day, or told; no later than `813eb375` by over a day; `leftBehind` red on `7e09b7b3` with a pool one
    group short.
    Done: the groups a leaving division frees are the hour's (`World.freed`), and the landing its order makes or
    joins takes them first; short at the sail hour, the call may take a group busy on the AI's errands; one left
    at the port is told (`NextVoyage`, "nextVoyage"). The critic's 162 headless cases replayed: 18705's three
    975/976/976 (HEAD 976/977/1272; `813eb375` 975/976/976); re-sent parts land as at `813eb375` (656/657,
    975/976; HEAD 788/789, 1108/1109); no one-click group split. `landingPartResent1938` (+18705, +the h681
    bound, red on HEAD), `landingCall1938` (the third told). `leftBehind` not given a short pool: the cases
    above and the replay stand for it.
  - [x] R37b R44-N1: the panel around a recall: the notice "it will not land with them" stays 20+ days after a
    recall that rejoined; "At sea, bound for its landing" while it sails back to its port; the recall's tooltip
    does not say it first sails back and waits. AT: the recall cases at 6 h, 1, 3, 5 days by page probe: each
    panel line true at every day.
    Done: aboard and its landing not sailing reads "Aboard, sailing back to {port}"; left at the port by a
    voyage, `nextVoyage`; all at the port, `waiting` (a group on its way) or `ready`, never "the rest"; the
    notice of a landing left goes at the next order; the hover of a recall says it turns back to the port and
    joins the landing there (`rejoin`). `landingRecallPanel1938` (1, 3, 5 days), `orderNewsStale`; the critic's
    recall page probes (6 h, 1, 3, 5 days): no stale notice, "Aboard, sailing back to Tokyo", both h660.
  - [x] R37c R44-N2: two clicks for one place in one hour make two landings from two ports; the first lands alone a
    week early (Japan 366 h500, the two h682; Britain the fresh one alone at h78, destroyed). AT: the critic's
    cases (`mk2_freshfirst` on three seeds, `g_eng` on 15101–15121): one landing, or the mark and tooltip say there
    are two.
    Done: a landing waits for another of its nation for the same place from its click while that one would land
    over a day after it, unless that one's own wait is over a week (`waitsForSiblings`). `freshfirst` on 3517,
    14003, 14011: 366 h658, the two h682 (HEAD 502 / 682; headless 634 / 656–657). `landingTwoPorts1938`
    (three seeds, red on HEAD); R30a's Britain case unchanged (276 h85, the two h94).
  - [x] R37d Before the critic: its probes replayed on new seeds (split shapes, recall, sea click, port shut, late
    order; page probes of the panel and tooltip), anything found fixed; then the critic.
    Done: the critic's 162 headless cases (18 seeds) and 22 page probes (recall, split, two ports, wait, sea
    edits, sea hover; desk and phone) replayed on this code. Found and fixed before commit: a sibling wait on a
    landing weeks from sailing (`steal_fresh2`: no one landed), and the landing-left notice dropped at once.
    Left as before: walkers from Korea in the n5/n6 shapes (never at sea), `gwater_tokyo` (the AI ships idle
    divisions, ADR-759), R31f's long waits (R44-N3, by decision). `landingInvariants` 0 broken on 30 runs;
    grid 6 of 480 as R33d. No page error in any probe.
  R37 done; then the critic (run 46, focused, on `4040cad6`: naval 7, bar 8; one blocking issue, R46-B1).
- [x] R38 **Run 46's issues** (critic run 46, focused, on `4040cad6`; ADR-833: fixed until naval is at its bar, its
  non-blocking ones too, the critic's probes replayed first).
  - [x] R38a R46-B1: a sailing landing whose transports are sunk: its divisions aboard, lost with them, were told
    `NoTransports` ("no transports ... at a port") and nothing said they were lost; `voyageOf` read `nextVoyage`;
    landingInvariants `aboardNoLanding` (19113/15101, t1463). AT: a unit case (a sailing landing's group
    destroyed): no `MoveRejected`, the news names the loss; landingInvariants on ten new seeds of each setup: no
    `aboardNoLanding`.
    Done: those aboard transports sunk leave their landing in the hour and are told `LostAtSea` (75, news
    "lostAtSea": "its transports were sunk at sea; it was lost with them"); none refused; the panel reads "at
    sea" till the hour's end. `landingSunk1938` (red without the fix: two refused); 19113/15101 0 broken.
  - [x] R38b R46-N1: a landing waiting for its sibling (R37c) reads `ready`; a state `sibling` ("waiting for the
    landing from {port} for the same place; they land together") with the days.
    Done: `siblingWait` gives the port and hours; `landingTwoPorts1938` checks `sibling` shows and `ready` lasts a
    day at most (run 46's 50 x-cases replayed: `ready` 1 h at most).
  - [x] R38c R46-N2: the rejoin hover (and R45-N2's sea hover) cut on a phone: the tooltip wraps within the screen.
    Done: notes wrap; the box is placed and sized within the screen (border-box). Run 46's phone probes: 562 px
    wide past a 390-px screen before, now 200 px ending 8 px inside it.
  - [x] R38d R46-N3: a division walks 40 days within its land to a far port's free group (18705, 19111: `stuck`)
    rather than wait at the near one for a called group: choose the called group at the near port when the march
    to the far one is over a week longer.
    Done: a free group's port over `FAR_PORT_CELLS` (20) cells farther than the land's nearest port: a group is
    called to the nearer. 18705 and 19111 0 broken. Not done: joining a gathering landing at a far port (19206,
    19207 Japan: 45 days on the march from the north of Honshu, landingInvariants `stuck`). Tried: it made one click
    of four into four landings at four ports (run 46's 383 cases replayed: splits 35 → 160); dropped. A follow-on.
  - [x] R38e R46-N4: `leftBehind` exempts a division told `NextVoyage` in that hour; the checker's pool one group
    short (R37a's AT).
    Done: the checker takes `groups` (only the nearest groups kept) and an `hour` hook; 1 and 2 groups on three
    seeds of each setup: 0 broken.
  - [x] R38f R45-N3 (carried): no hover over the sea for a gathering landing's divisions (or any land selection):
    the tooltip says a click there is refused.
    Done: `seaHint` 3 with `ashore` (a gathering landing: "your landing stays as it is") and `plain` (land
    formations in no landing, open sea with no coast near: "they cannot march there"); `landingSeaClick1938`.
  - [x] R38g Before the critic: run 46's 383 headless cases and 35 page probes replayed (landings as in run 46, no
    page error); landingInvariants on 20 new seeds (19201–19210, both setups) and 12 short pools: 0 broken but the
    two `stuck` of R38d's follow-on.

- [x] R39 **Run 47's issues** (critic run 47, focused, on `f464db35`; ADR-833: fixed until naval is at its bar, its
  non-blocking ones too, the critic's probes replayed first).
  - [x] R39a R47-B1: a landing whose last group is destroyed (bombed at port while gathering; sunk at sea with some
    left for the next voyage) ended `NoTransports` ("no transports ... at a port it can reach"), false where another
    group stood idle (USA 3517 to Norwich: 1119 bombed at Norfolk t272, 1123 idle at San Francisco), and nothing told
    the sinking. Fix: the landing calls another group (as R37a's call) and ends only if none comes; when it ends, its
    own news ("its transports were sunk"), for those at the port too. AT: `c47_far.ts` USA 3517: no reason 6 at
    t273; a unit case (a gathering landing's group destroyed, another idle): no reason 6; case B: those at the port
    told the sinking.
    Done: `replaceGroups` (gathering, or after a voyage with some left): a group free at the port, the nearest
    idle, or a busy one called, and the landing goes on; none: over. Groups destroyed (`World.sunk`, not saved):
    each told `TransportsSunk` (76; news "transportsSunk", 1 another called, 0 over), no reason 6. `c47_far.ts` USA
    3517: t273 told, 1123 called (the landing ends at t895 as Norfolk is bombed shut, `PortShut`, true); case B
    (`c47_sunk.ts` n3k1, n3k2, n4k2, n5k3): those at the port told, none refused; `landingSunk1938` two cases.
  - [x] R39b R47-N1: the lost-at-sea row names the division (its name sent with the news).
    Done: the page keeps the name it drew with each notice on arrival (`Hud.nameOf`; `OrderNews.name`).
  - [x] R39c R47-N2: the tooltip flips above the cursor where it would pass the screen's bottom.
    Done: within 180 px of the bottom it is anchored by its bottom above the mouse.
  - [x] R39d R47-N3: R38d judges the call by hours (`sailHours` of the called group plus the voyage, against the
    march plus the voyage), and keeps the free group where no call can reach (Moscow to Cyprus).
    Done: `callSooner` (march by `octileKm` at its pace; the call's `sailHours`; voyages by `sailHoursFrom`; a day
    sooner to be taken). Moscow to Cyprus keeps Sevastopol's group (as at `4040cad6`; it ends there `PortShut`);
    18705, 19111 still clean; run 47's 383 cases as in run 47.
  - [x] R39e R47-N4: 19206/19207 `stuck` (a 45-day march to a far gathering landing), without splitting a click.
    Done by R40e (`5da444a8`, ADR-835): `stuck` counts days with no ground gained; critic run 50 confirmed (19
    landing seeds 0 broken; 19206's 367 28.1 days gathering, 46.0 in run 49).
    Not done: one click of two divisions ~70 cells apart; together means the far one walks. A port chosen for the
    whole click (the least latest march) is the way left; it changes every landing's port choice, the kind of
    change that split clicks in R38d; held.
  - [x] R39f Before the critic: run 47's 383 headless cases (as in run 47), its far, sinking and checker jobs, and
    its 37 page probes replayed.

- [x] R40 **Run 48's issues** (critic run 48, full, on `4ebaee76`; ADR-833 for naval; the critic's probes replayed first).
  - [x] R40a R48-B1 (diplomacy): a puppet rising against an overrun overlord: `whyNotWar` refuses `Overrun`, and the
    rising becomes a free release told as "rose against" with no war (diploInvariants 20429 random, day 546, `rise`).
    AT: diploInvariants 20429 random 3650: 0 broken; a unit case (a puppet at loyalty < 20, its overlord overrun,
    rises on the month's start): at war with it, or told released, not "rose against".
    Done (ADR-834): the rising is told once the war is known: a war it may not declare (an overlord overrun, ADR-229)
    makes it freed (`PuppetReleased`, "was freed from"), not "rose against". 20429 random 3650: 0 broken; the
    critic's other ten-year seeds (20491, 20493, 20413, 20495) 0 broken; `puppets.test` red without it.
  - [x] R40b R48-N1: `World.sunk` saved while not empty (or decided from saved state): a save and load in the sinking
    hour still tells `TransportsSunk` (`c48_far_save.ts`, `c48_sunk_save.ts` with SAVE=1).
    Done: section `world.sunk` while not empty. `c48_far_save.ts` SAVE=1: told at t273; `landingSunk1938` loads into
    a world that knows no sinking (red without it).
  - [x] R40c R48-N2: two divisions lost at sea in one hour: one row ("2 divisions lost at sea"), not one cut row.
    Done: the page merges the hour's same loss into one row naming them ("2 divisions lost at sea with their
    transports: Square infantry division 364, Square infantry division 365."; `c48_lost.mjs` desk and phone).
  - [x] R40d R48-N3: hero tags at world zoom collide like nation labels.
    Done: from 10,000 m/px (the whole world in view) a hero's counter is its nation's size; T0 at 5,000 m/px keeps
    twice (PLAN 7.184b3). `heroes1938.spec` R40d (red without it).
  - [x] R40e R39e (held under naval's 8): 19206/19207 `stuck`.
    Done (ADR-835, the user's decision): the checker's `stuck` counts a landing's days with no ground gained (none
    of its divisions or groups a cell nearer its port), not its days gathering; each division's longest gathering
    spell is told in the notes (19206's 367: 46 days, 3.5 with no ground). A new rule, `farPort`, keeps R46-N3's
    class caught: a division making a landing alone at a port whose whole way is over a week longer than by its
    land's nearest port with an idle group to call (R39d's rule as a checker); at `4040cad6` it breaks on 18705 and
    19111 (30–49 days to Sasebo against 9–15). It found one game fault, fixed: a group freed by the click's own
    re-send (R37a) was taken however far (19207: 366 walked 24 days from Hiroshima to Tokyo); now judged as a free
    group (`callSooner`). Planted stalls (frozen, circling) still `stuck`. All the critic's checker seeds 0 broken;
    run 47's 383 cases as in run 47 (35 split, none later).

- [x] R41 **R38d's gate of 20 straight cells** (found by R40e's `farPort`, not taken). Within it the free group is
  taken by rule though a call to the nearer port lands 7–13 days sooner (18705 t784: Lianyungang 20 days, by
  Shanghai 7; 3517 t1574; told as notes). Removing the gate (and sending the free group itself to the nearer port,
  'fetch') splits R37c's same-hour clicks: `landingTwoPorts1938` red, run 47's splits 35 → 58 (366 at 158, the two
  at 656: a lone landing sails before its sibling, `LATE_WAIT_HOURS` caps the wait). It needs one port for a click
  first (R39e's class).
  Critic run 49, R49-N4: reproduced on 20621 t526 (Weihai 18 days, by Rizhao 10), the recorded rule.
  Done (ADR-836): the gate is gone (a far port's free group against a call to the nearer is `callSooner`'s, by
  hours, at any distance), and a landing waits up to a month for a sibling of its click (`SIBLING_WAIT_HOURS`, a
  week before: R37c's fresh one is ready ~22 days before its pair; run 47's `fresh2`, a mate two months off, still
  not waited for). Not taken: no cap (fresh2: four divisions stood the whole case). Run 47's 383 cases: 35 split as
  in run 47, none changed but four English cases where 274 now lands at hour 64 (a call to Portsmouth) instead of
  walking to London to be refused `PortShut`. Every checker seed the critic has run 0 broken, `farPort` now at any
  distance, a landing waiting for a sibling gaining ground as it does; 19206's 367 46 → 28 days gathering.

- [x] R42 **Run 49's issues** (critic run 49, focused, on `5da444a8`: no blocking issue; naval 7, bar 8: "nothing new
  earns an 8"; ADR-833: each finding fixed; the critic's probes replayed first).
  - [x] R42a R49-N5 (naval feel): a click whose landing waits for a marching sibling says so in days at the click
    (20661 Tokyo→Shanghai: 26 days, 21 waiting for a division 22 cells off), as the sibling wait does elsewhere.
  - [x] R42b R49-N3: the merged loss row beside a panel is cut (desk, phone, landscape phone), and the at-port
    division's "landing is over" row is off screen: the row wraps to two lines beside a panel, or shows the count
    with the names in its tooltip; more than the last order row shown.
  - [x] R42c R49-N1: hero counters blend from 1× at 10,000 m/px to 2× at ~3,000 m/px, sized by screen width too
    (no jump at 10,000; at a Europe view they do not cover nation names; a phone name under 38 % of the screen).
  - [x] R42d R49-N2: `PuppetReleased` ticks (at least the release that ends a rising), so "left its war" has its cause.
  - [x] R42e R49 #6: `order.transportsSunkMany` agrees in number ("their landing… their port").
  Done (ADR-837): R42a the hover over the landing they have says when it sails, in days, and the marching one's panel
  its days (`landingClickWait1938` unit and spec: said 47, sailed after 46.6; the sibling's branch on
  `landingTwoPorts1938`); R42b beside a panel the last two order rows, the loss of several by its count with its
  names in the tooltip, on a phone too, two orders in place of the newest event (`orderRowsPanel1938`; the user's
  amendment of ADR-760); R42c 1× at 10,000 m/px to 2× at
  5,000 by zoom level, within a quarter of the screen (`heroes1938` R42c: 1.32× at 8,000, phone 12 %; 7.184b3 green);
  R42d `PuppetReleased` ticked; R42e one number.

- [x] R43 **Run 50's issues** (critic run 50, full, on `3fe138b1`: no blocking issue; naval 7, bar 8; stability up to 8;
  ADR-833: each finding fixed; the critic's probes replayed first).
  - [x] R43a R50-N1 (naval): one click's last division has no bound on its landing's wait while a sibling landing's is
    a month (ADR-836): 20861/20841 Tokyo→Shanghai, three divisions, 35 days at Tokyo for 366 walking 41 cells, a
    4-day crossing. The same bound for the click's own last division (past it, sail and let it follow), or it boards
    at its own nearer port as a sibling landing.
    Done (ADR-838, the user's choice): a week sooner at its own port, a sibling landing there; 20841 39.6 → 5.4 days,
    20661 26.3 → 5.3; run 47's grid splits 5 → 5, 259 sooner, none later; `landingOwnPort1938`.
  - [x] R43b R50-N2: a single order row beside a panel cut before its meaning ("366: the transports of its…", a
    refusal "not done: there is o…"): a brief for each single kind, the full text in the tooltip.
    Done (ADR-839): a division by its number, a hero or wing by its name, a refusal by its reason's gist ("365: not
    done, no coast to land on"); `orderRowsBrief1938` (each kind, 20 reasons, the longest names, desk, landscape,
    phone: red before).
  - [x] R43c R50-N3: on a phone the merged loss row's names are only in a tooltip a phone cannot hover: the names where
    a tap reaches them (the panel the click opens, or the row).
    Done (ADR-840): on a phone the first tap opens the row to its full words (six names), the next flies; one open at a
    time; a desk one click. `orderRowsTap1938` (phone with and without a panel, landscape, desk; red before).
  - [x] R43d R50-N4: a freed rising's "left its war" rows tick before "was freed from", their cause: within the hour,
    the release first. Done: the ticker moves a release or rising above the wars its nation left in that hour
    (`causeFirst`; the sim's order kept: the pin unmoved); `realmWars` Manchukuo's rising red before.
  - [x] R43e R50-N5 (naval): 20845 Berlin→Norwich, the group sunk at t89, both told the landing is over, then both
    marched on to Hamburg for six days: a landing ended stops its divisions' march to its port.
    Done (ADR-841): `endLanding` stops them, however it ends; 20845: none at Hamburg (1 the AI's, 4 stands).
    `landingEndedMarch1938` (sunk, port lost; red before); checker `marchOn`: run 50's 19 seeds 5 broken (28) → 0.
  - [x] R43f R50-N6 (God Mode): Revolt and Spawn name the new nation for a province other than the one clicked ("Free
    Saxony" for Bavaria): the clicked province's name.
    Done (ADR-844): the capital in the province clicked, so its name; Spawn on Greater Poland was "Free Silesian
    Voivodeship" (Katowice), now its own; the "Bavaria" click was Saxony. `nationNames` sweep: 1,698 of 2,000+ wrong → 0.
- [x] R44 **A click's landing has a bound (`slowClick`; ADR-843, the user's decision: before critic run 51).**
  `landingInvariants` gets a rule `slowClick`: a click's landing whose first division ashore is over 7 days later than
  the click's best single-division way (march to its own nearest port or a called group, the later, then the voyage;
  as `farPort` reckons it), and the player was not told why at the click. R49-N5 and R50-N1 are its cases: break at
  `3fe138b1` (20841 three to Shanghai, 20661 two), pass at HEAD. AT: run 50's 19 landing seeds and run 47's grid
  (`tools/diag/landingGrid.ts`, 403 jobs) at 0 broken, with the worst click's days over its best way named in
  PROGRESS. No new landing rule unless the checker finds a break; each one it finds is a part of its own (R44a …).
  The checker is in (ADR-845): the critic's two break at `3fe138b1`, pass at HEAD; 18 of the 19 seeds and the grid
  clean (worst 3.8 days over; grid 14 h).
  - [x] R44a 20827 (Britain, Newcastle the nearest port of all): t708's click of six, 277 at Liverpool with a group
    there (best 5.8 days); landing 6 waited at Newcastle for 273 walking ~12 days from London to the same port (R43a's
    sibling needs another port). Not ashore after 12.8 days.
    Done (ADR-846): a ready landing waits 6 days from its ready hour; 20827 ashore after 10.5 days; 19 seeds 0 broken.

## Batch 3 — readability (after the release, ADR-829)

The carried non-blocking issues of critic runs 31–43 (why some dimensions are 7 and not 8; none gates a release)
and the small ideas from other games. Each one line until it is taken.

**The next critic run comes after R47, not after R43f** (ADR-842 and ADR-843, the user's decisions, 2026-11-07):
R43f, R44, R34, R35 and Batch 4's R45–R47 are done first, and critic run 51 judges them together.

- [x] R34 The critic's carried issues: R37-N4 (relations graph labels overlap); R32-N3 (a refusal toast cuts its
  reason); R37-N3 (God's Breakthrough at peace does nothing, says nothing); R31-N1 (hero counters under the HUD);
  R31-N6 (the graph eats the first tap after a drag; a hero hides fleets stacked with it); R32-N2 (trait text only
  on hover, none on a phone); R32-N5 (sea heroes die more); R36-N3 (a re-click of the same landing is silent);
  R39-N2 (no landing mark on touch); R39-N3 (Escape leaves the mark); R39-N4 (the tooltip points at a mark off
  screen); R40-N2 ("go by sea" for a selection most of which march); the ranking cuts long names.
  Split (one cause a part; each AT a screenshot or figure at desk and phone where it is drawn):
  - [x] R34a R37-N4: the relations graph's labels collide ("AustraliaUnited Kingdom"), illegible on a phone: no two
    labels overlap, at desk and at 390 px, on a late world (run 50: `c50rg_20887_desk_d365`, `_20889_phone_d365`).
    Done (ADR-847): 11 px at any zoom, placed in order of importance, none over another; 0 overlaps (18 before).
  - [x] R34b the ranking cuts long names ("French Equatorial…", "Anglo-Egyptian S…"): the whole name, or a shortening
    that keeps it readable, with the full name on hover and tap.
    Done: the panel as wide as its longest row, 15–20rem; each name's title the name; `rankingNames1938` (red before).
  - [x] R34c R32-N3: a refusal toast and History rows cut their reason mid-word ("not done: there is no …"; "lost 42
    aircraft, / Iraq 18"): the reason whole, wrapped, desk and phone.
    Done: a History row's text wraps in its own column (73 desk / 194 phone rows had a line under the date → 0);
    the refusal beside a panel whole since R43b (`orderRowsBrief1938`).
  - [x] R34d R37-N3: God's Breakthrough at peace does nothing and says nothing: refused with a reason, or disabled
    and told why.
    Done: refused since PLAN 7.165, but told only in the God tab; a map tool's refusal is now on the tools' bar.
  - [x] R34e R31-N1: hero counters drawn under the HUD at a desk start view (Japan's two): kept clear of the HUD.
    Done: a hero counter under a panel is drawn beside it, at its height, a line to its place; 5→0 under a panel.
  - [x] R34f R31-N6: the relations graph eats the first tap after a drag (R30-N3).
    Done: the browser sent no click for the tap after a drag's fling; the graph reads a finger's tap itself.
  - [x] R34g R31-N6: a hero hides the fleets stacked with it: both visible, or the stack told.
    Done: a hero's T1 marker steps clear of the markers it would cover, a line to its place.
  - [x] R34h R32-N2: a trait's description only on hover; a phone shows names with no meaning: reachable by tap.
    Done: a chip's tap shows its words under the chips; the God tab says the trait touched.
  - [x] R34i R32-N5: sea heroes die more (Sovetsky Soyuz 46.7 times in 20 years over ten seeds): the cause found; a
    rule only if one is wrong (an AI rule: the pin moves in its own commit).
    Done (ADR-848): raised under an enemy fleet on its port's water; now not. Also found: the naval AI fights at
    even odds (`AVOID_RATIO` 1.5), and a lone sea hero sails at Hood and the bombers: left as it is.
  - [x] R34j R36-N3: a re-click of the same landing is taken in silence: told it changes nothing.
    Done: an order's notice, "already bound for this landing; the order changes nothing" (the escort box not applied).
  - [x] R34k R39-N2, R39-N3, R39-N4: the landing mark: none on a touch screen; Escape leaves it; at unit zoom the
    tooltip points at a mark off screen.
    - [x] R34k1 R39-N3: Escape empties the selection, and the mark and the tooltip go at once.
    - [x] R34k2 R39-N4: at unit zoom the tooltip points at a mark off the screen: the way to it shown.
    - [x] R34k3 R39-N2: no mark on a touch screen: a tap asks, a second tap orders.
  - [x] R34l R40-N2: "your selected forces go by sea" for a selection most of which march: the tooltip says which go
    by sea and which march.
- [x] R35 Small ideas from the reports: an order's error cleared by any new order; a flag at the destination while
  choosing; a long-press preview of an order on touch; a mark on a fleet the AI has taken back.
  Done (ADR-850): the first three were so already (R24c; ADR-827's mark; R34k3's two taps); the fourth is new.

## Batch 4 — naval evidence (ADR-843, the user's decision)

Before critic run 51 (the user, 2026-11-07: "let's do all before 51"), after R35. R44 (`slowClick`) is in R43's
batch. R45's replay runs before the critic, as ADR-833's replay does.

- [x] R45 **The critic's replay as a tool.** `tools/diag/replayCritic.ts` builds the job list from the last report's
  JSON and `critic/scripts` (the hand-built `.cache/replay49/jobs.txt` and `suiteP.sh`, committed as a tool), runs it
  5–8 sims at a time (20 at once were killed for memory), and adds new seeds for each probe family. AT: it replays run 50's 65 headless
  jobs with the same results as run 50, and runs each family on 5 new seeds; its report names every case that differs.
  Done (ADR-851): at run 50's commit 65 of 65 the same; at HEAD 30 the same, 35 named (`docs/replays/`); 95 new.
- [x] R46 **Sea battles the critic can find.** `tools/diag/seaBattles.ts <seed> [scenario|random] [--years N]`: each
  sea battle and sinking with its day, place (sea zone, cell), sides and ships, and the camera (x, y, m/px) to look at
  it. AT: on 3 seeds × 5 years, every battle it lists is drawn at its camera in the page (a probe shows ships), and run
  50's `c50_sb_20885` case (0 elements) gets a battle to look at.
  Done (ADR-852): 20885, 7019, 3517 × 5 years: 85, 90, 100 battles, every one seen at its camera; 20885's first is
  t107, Soviet v Romanian ships in the Black Sea (`docs/replays/seaBattles_*.txt`, `docs/evidence/R46/`).
- [x] R47 **A landing as one row** (the critic's idea since run 32). A panel or bar for each of the player's landings:
  its target, its port, its divisions (at the port, marching, with days), its transports needed and assigned, the
  days to sail, the outcome once for the operation, and a cancel (the transports back to the port they left). Read
  from `world.landings` (R33b); no new sim rule. AT: on the critic's landing cases (run 47's grid, run 50's far
  routes) the row says, hour by hour, what the divisions' panels say; desk, landscape and phone; Playwright specs.
  - [x] R47a The rows' data: `landingRows` (sim, read only) and the worker's `landings` message, sent when they
    change; each division with its panel's voyage; the outcome kept a day (ADR-853).
  - [x] R47b The rows on the page: a landings bar, a row each (target, port, divisions with days, ships, days to
    sail, outcome); a click on a row goes to its land; desk, landscape and phone (ADR-854).
  - [x] R47c A row's cancel: its divisions ordered back to its port by the orders a click gives (no new rule; ADR-855).
  - [x] R47d The AT on the critic's cases: run 47's grid and run 50's far routes, hour by hour against the panels.
    108 cases (100 of the grid, 8 far), 19,905 hours: 0 broken (`tools/diag/landingRows.ts`; ADR-856).

## Batch 5 — run 51's naval findings (ADR-833: naval's findings are items, fixed, then the critic again)

Critic run 51 (full, on `14a85a51`): no blocking issue, 0 broken on every checker; map visuals and stats up to 8; naval
7 (bar 8), resting on the landings bar's cancel words (R51-N1, N2). Each of its naval findings, design objections,
ideas and "what the bar needs", filed (PROMPT's RELEASES, ADR-843); then critic run 52.

- [x] R48 **Run 51's naval findings.**
  - [x] R48a R51-N1 and the ADR-855 objection (EU's "halt"): a gathering landing's cancel stops those ashore where
    they stand (as R43e's end does), those aboard sail back to the port; the row says what is true each hour ("turning
    back to {port}", then "back at {port}"; ashore "stopped where they stand"), the tooltip "go to", not "go back to".
    AT (the bar's): `c51_lbar.mjs 21107 GER ENG … 3 ger_norwich3_phone` from the cancel day on the row and the panels
    agree; `landingRows` and `landingInvariants` at 0 broken.
    Done (ADR-857): ashore stop, aboard turn back (with one ashore too); "stopped where they stood; the AI commands
    them again" on 21107, as its panels; `landingRows` 108 cases 0 broken; the 25 seeds 0 broken (`marchOn` skips a
    retreat: 20829's 364, beaten at Jiaxing).
  - [x] R48b R51-N2 (and §7.1's AI layers objection): a division the AI ships says so in its panel ("At sea with the
    AI's landing"), as R35 does for a fleet. AT (the bar's): `c51_cancel_page.mjs 20661 JAP CHI … jap_sh 26 240`.
    Done (ADR-858): 20661's 364 from h216 "At sea with the AI's landing (not one of yours)", no row.
  - [x] R48c R51-N3: on a landscape phone (844 × 390) an open row's last division and its cancel are on the screen
    (the cancel in the row's head at a short height).
    Done (ADR-859): the cancel in the open row's head; under 500 px tall the bar's list runs down to the bottom bar.
    21107's three to Norwich at 844 × 390: all on the screen (`docs/evidence/R47/landings-landscape-open3.png`).
  - [x] R48d R51-N6: "waits for the landing from {port}" only when it does wait for it (20861 row 2 sailed first); a
    landing at sea says its days to land.
    Done (ADR-860): "sails in about a day, to land with the landing from Hiroshima" (and the panel so); at sea "lands in
    about N days". On 20861 each row sails and lands within its days and a day.
  - [x] R48e R51-N7: "they land together" for landings 12 hours apart (20661 t117/t129): the words as the rule is
    (within a day), or the landings within the hour.
    Done (ADR-861): the words as the rule, "to land within a day of the landing from …" (row, panel, hover); on 20661
    and 20841 each pair so told lands within 24 h.
  - [x] R48f The ADR-838 objection and Hearts of Iron's idea: one click's landings from several ports grouped as one
    row (each port a line in it), with one cancel for the click.
    Done (ADR-862): rows carry their click (siblings taken through); the bar draws one row a click, its ports in the
    title, a line a port opened, one cancel for all. 20861: one row of three, cancelled whole.
  - [x] R48g The ADR-854 objection: on a phone, taking control leaves the nation's panel open and hides the bar after
    the first order; the bar is seen with a panel open (or the panel gives way at an order).
    Done (ADR-863): on a phone a new landing closes the nation's panel; the bar is seen. Run 51's 25 landing seeds:
    0 broken after R48a–g.
  - Not taken: the bar gives way to a nuclear alert (ADR-854; the critic: "the user's choice; noted").
  - Kept: `landingInvariants` at 0 broken on run 51's 25 landing seeds (the bar's third line), checked in each part.
- [x] R49 **Run 51's other findings** (dimensions at their bars; after R48).
  - [x] R49a R51-N4 (God Mode): Breakthrough at war is taken in silence: its corridor drawn for its 10 days, or a
    ticker row.
    Done (ADR-864): a `GodBreakthrough` row, "God opened a breakthrough for Germany (near …)", in the ticker and
    History; the critic's `c51_kw_breakthrough.mjs 21151` sees it after the clicks (`docs/evidence/R49/`).
  - [x] R49b R51-N5 (history): History lists a release after its "left its war" rows within an hour: R43d's
    `causeFirst` in History's order too.
    Done (ADR-865): History's rows cause first (`causeFirst`), shown newest hour first, each hour as logged
    (`newestHourFirst`); 20429 (random diplomacy): the release above its wars left.

## Batch 6 — run 52's naval findings (ADR-833)

Critic run 52 (focused, on `d8dba302`): one blocking issue, R52-B1 (the landings bar's outcome line, R47a's tally);
God Mode up to 8; naval 7 (bar 8). Run 51's seven findings fixed on their cases; every checker 0 broken. Each finding,
objection, idea and "what the bar needs" filed; then the probes replayed and critic run 53.

- [x] R50 **Run 52's naval findings.**
  - [x] R50a R52-B1 (blocking) and Hearts of Iron's one notice per operation: a landing's outcome from where each of its
    divisions ended (at its target, ashore elsewhere: broke off, at a port or inland: never sailed, gone), not R47a's
    tally (`TransportsSunk` as lost, every `FormationLanded` as landed); the row says what the order news says.
    `landingRows`' `outcome` reads each division's state, red before on 22103, 3517 and 21105. AT (the bar's):
    `STEP=3 c52_lland.mjs 22103 GER ENG … 2 ger_norwich 130` (sunk before boarding: not "lost at sea"); `c52_lland.mjs
    21105 ITA ENG … 2 ita_malta 240` (broke off, ashore away from Valletta); `c52_lost.mjs 3517 desk` (no "lost at sea"
    for 366).
    Done (ADR-866): each division by where it ended (landed at the land, broke off, lost at sea, never sailed); "over:
    its transports broke off; 2 came ashore away from Valletta", "over: its transports were sunk; 2 never sailed".
    `landingRows`' `outcome` from the world (red before on 22103 and 21105); its 108 cases 0 broken.
  - [x] R50b R52-N2 and the ADR-862 objection: one click's row holds to its end: a part over or turning back stays in
    it until the last is over; the click's outcome summed and kept a day from the last. AT: `STEP=2 c52_lland.mjs
    20861 JAP CHI … 3 jap_sh3 200`: one row from t1 to its end, "over: 3 landed".
    Done (ADR-867): each landing keeps its click as first seen; a part over stays while its click runs and a day after
    its last end. The critic's script: one row t1–t153, "over: 3 landed"; 20661's cancel: one row turning back.
  - [x] R50c R52-N3: while a landing's transports are engaged at sea the row says so ("under attack at sea") and its days
    count from when it moves again (21105: "about a day" for four days, group 1195 engaged t63–t147).
    Done (ADR-868): "at sea: under attack, held up" while a group of it is engaged, and only then (21105).
  - [x] R50d R52-N5: a row turning back says its days to its port, as one at sea does.
    Done (ADR-869): "turning back to Tokyo: there in about N days" (20661 cancelled at hour 26: within them).
  - Kept: `landingInvariants` 0 broken on the 25 seeds; `landingRows` 0 broken with R50a's reading.
  - For the user (SPEC §7.1, ADR-759; the critic, not blocking): a cancelled division of a played nation is the AI's
    at once; an option to keep the player's divisions where the player left them. Not taken without the user.
- [x] R51 **Run 52's other findings** (after R50).
  - [x] R51a R52-N4 (God Mode): the Breakthrough row names its place ("near Berlin"): `nearestCity`'s id is not one
    `cityName` reads.
    Done (ADR-870): the ticker's names had no city role (History's had); the ticker row reads as History's.
  - Not taken: the corridor drawn on the map for its 10 days (the ADR-864 objection: the ticker row's "Show where"
    flies to it; a map layer for one God tool).

## Batch 7 — run 53's findings, before the full run

Critic run 53 (focused, on `5f8ef9e8`): no blocking issue; naval 8 (at its bar); every dimension at its bar. A focused
run is followed by a full one before a release (PROMPT's RELEASES 3). Its three non-blocking findings are small and in
code of this month's; fixed first, then critic run 54 (full).

- [x] R52 **Run 53's findings.**
  - [x] R52a R53-N1: a thrown-back division keeps "thrown back" when it comes ashore after (`endLanding` overwrote
    it): "over: 2 thrown back" (with where they came ashore); `landingRows` gains a repulse case. Not taken here:
    whether a thrown-back division may stray-land on its own side's beachhead at the target (PLAN 4.8n's rule; the
    critic's unstaged 23081 is consistent with "home").
    Done (ADR-871): thrown back stays so; "over: 1 landed, 2 thrown back"; the checker reads a throw-back from the
    world (a place aboard with no water); 108 cases 0 broken.
  - [x] R52b R53-N2: a click's row turning back from several ports names them all, with the longest days
    (`SHOTAT=30 c53_turnback.mjs 20661 …`: "turning back to Tokyo, Ōsaka"; `c53_lbar.mjs 22101 …` day 3 all three);
    and with one part ashore and others at sea, "1 of 3 ashore" as gathering's "2 of 3 at sea".
    Done (ADR-872): "turning back to Tokyo, Ōsaka: there in about a day" (the critic's 20661 h30 and 22101 day 3 in the
    page); "1 of 3 ashore; at sea: lands in about a day".
  - [x] R52c R53-N3: "under attack, held up" names the attacker or is said only with a foe engaged near (a one-sided
    `engaged` checked: 21105 t55–t144, no British fleet engaged within 15 cells); the division's panel says the same.
    AT: `SHOTAT=60 c53_lhold.mjs 21105 ITA ENG … 2 ita_malta 200`.
    Done (ADR-873): the engagement is mutual (British fleet 1080, 19 cells off, engaged too: a fight at sight's
    range); the row "at sea: under attack by United Kingdom, held up", the panels "At sea, held up: its landing is
    under attack by United Kingdom".
  - [x] R52d The replay of run 53 at 585e20a8 (ADR-833's step): on 23071 271, aboard the group with thrown-back 270,
    read "came ashore away" (the repulse's event names one; its group sails home with all aboard). Done (ADR-874): all
    of the landing aboard a thrown-back group are thrown back, in the worker and the checker; "over: 1 landed, 2
    thrown back"; 108 cases 0 broken.
  - Kept: `landingInvariants` and `landingRows` 0 broken.

## Batch 8 — run 54's findings

Critic run 54 (full, on `8d7d02fe`): one blocking issue, R54-B1; naval 7 (under its bar of 8); every other dimension
at its bar. No release: R54-B1 is fixed first, then the probes replayed (ADR-833) and critic run 55.

- [x] R53 **Run 54's findings.**
  - [x] R53a R54-B1 (blocking): a thrown-back landing tells one story in the bar, the panels and the ticker. Rome →
    Valletta (23105; 24151, 24153, 24155, 24159, 24171) is thrown back at h156–162, then reads "at sea: lands in about
    a day" for 18–24 h; one panel says "At sea, bound for its landing" above "the landing was thrown back"; at the
    end the bar reads "over: 2 thrown back" beside the ticker's two "landed away from its target" and 319's panel
    "Landed", ashore near Catania; 321 is never told "thrown back" in the ticker. From the repulse the row and the
    panels say "thrown back: sailing home" (no voyage hours); at the end all three agree (e.g. "2 thrown back; came
    ashore near Catania"); a "thrown back" row for each division counted, not only the one the event names;
    `landingRows` gains the Malta case with a row, panel and last-news check. AT:
    `SHOTAT=162,168,174,180,186 node critic/scripts/c54_lhold.mjs 23105 ITA ENG 1095.5,344.5 1106.5,383.5 2 ita_malta
    200`, and `c54_lland.mjs` with the same arguments (240 h) on the five new seeds. Design (the report's Hearts of
    Iron idea): a landing has one status from start to end, and the bar, the order, the panel and the news say it in
    the same words.
    Done (ADR-876): "thrown back: sailing home to Catania" in the bar and both panels from the repulse, each
    division told; ashore, "thrown back; it came ashore near Catania" and "over: 2 thrown back; came ashore near
    Catania" (23105 and 24151 headless); the sim unchanged; 108 cases 0 broken.
  - [x] R53b R54-N1: `heldBy` names the nation of a foe fleet in the landing's sea battle (`world.seaBattles`), not
    the nearest engaged formation of any kind at war.
    Done (ADR-877): the nearest foe fleet in a held group's sea battle; a French division in a fight beside 21105's
    transports is not named.
  - [x] R53c Small: on 22105 day 2, every division line gives its days (two drop them: "Marching to Portsmouth to
    board transports"; `c54_lbar.mjs 22105 ENG GER 1023.5,275.5 1072.5,259.5 3 eng_br3_phone 390 844 14 4`).
    Done (ADR-878): under a day, "about a day"; every line on 22105's march has its days.
  - [x] R53d The three places checked, not the bar alone: `landingRows` compares, hour by hour, each division's row,
    its panel and its last order news (the ticker), and fails on a disagreement; the Malta click (23105, 24151) among
    its cases. 0 broken on every case.
    Done (ADR-879): a `news` kind; `PAGE_CASES` (the Malta clicks, seven seeds); before R53a 6 broken, now 115 cases
    0 broken.
  - [x] R53e Run 54's design objections (each was "no score lowered"; taken before run 55 by the user's call; the
    ADR-759 one, a cancel handing the army to the AI, not taken: ADR-875):
    - ADR-864: the Breakthrough corridor is drawn on the map for its 10 days.
      Done (ADR-881): every corridor in force (God's and a battle winner's), a band edged in amber with chevrons;
      at the critic's click (1500 m/px) and where "Show where" flies.
    - ADR-873: a mark joins a held landing's transports to the fleet that holds them (21105: the fight 14–19 cells
      off, nothing drawn between).
      Done (ADR-880): a red ring on the held transports and a dashed line in the foe's colour from the fleet that
      holds them (`Snapshot.holds`), over the markers; 21105 h60 at 1500 and 250 m/px.
  - [x] R53f Run 54's idea from other games, the other one (the Hearts of Iron one is R53a's design): History has a
    "my wars only" filter, as Europa Universalis' message log.
    Done (ADR-882): "My wars only" while a nation is played, its war rows (`WAR_KINDS`); desk and phone.
  - [x] R53g History's first rows on 7019 (year 20) repeat a pair: "A major battle began near Tangier" and "The
    major battle near Tangier was won by Germany", twice on 25 December 1957, once more on the 26th
    (`critic/c54_hi_7019.json` `firstRows`): one begin and one end a battle.
    Done (ADR-883): not a repeated row, a battle ended by one quiet hour; a lull of a day with both camps there
    goes on. Restarts within a day 36 % → 10 % (7019, two years). Pin → `bd1b6944`.
  - [x] R53h On the phone (390 × 844), the nation panel's 16 "Build" buttons sit below the screen inside its scroll
    (`critic/c54_p.json`, `actions`: panel 139–1289 px of 844): reachable at a glance.
    Done (ADR-884): production is a Build tab by kind (Infantry, Armour, Navy, Air), tiles two to a row; every tile of
    a kind whole in the panel and nothing off the screen on Build or Actions, at 390 × 844 and 1280 × 720
    (`buildTab1938`).
  - [x] R53i The run-26 scenario loads, or says what it changed to load it
    (`node critic/scripts/c54_os2_scen.mjs critic/c26_critic_standoff.warsim-scenario c54`; now "made by an older
    version of Warism, and this one cannot start it").
    Done (ADR-885): it lacked `nations.traits` alone; a scenario file lacking only that starts with no traits, the
    title saying "Made before nation traits: its nations start with none" (`scenarioUpgrade1938`, the critic's file).
  - [x] R53j A typed filter narrows the editor's nation list (one flat list of 100+ names; `c54_g_editor.mjs 24121`).
    Done (ADR-886): a box above the lists narrows them as typed, "n of N", typing a name picks it
    (`editorNationFilter1938`).
  - [x] R53k Emergent dynamics: on 21099 and 20899 for 25 years (`node critic/scripts/c48_top.cjs` on `npm run sim
    -- --scenario 1938 --seed <s> --years 25`), no top-5 holder within ±0.2 % of the same share for 20 or more years
    (Denmark at 5.4 % all 25 years); on 24099 the first three places are not the same three nations in the same
    order every year.
    Done by area, the user's choice (b) (ADR-889, with the user's choice (a) of the reach): longest still share 13,
    12 and 5 years; the first three change on 24099.
  - [x] R53l Year-one dogpiles: on 20887, 21129 and 24129 at day 365 (`node critic/scripts/c54_rg_relations.mjs
    <seed> 365 1600 900 desk '&heroes=on'`) no war chip with one side more than 4 times the other's count of nations
    ("Germany +6 ⚔ United Kingdom +36", "United Kingdom +35 ⚔ Brazil"); diploInvariants 0 broken on run 54's seeds.
    Done (ADR-887): a puppet, and an attacker's ally, join only within 500 km of the other leader's realm; 21129
    and 24129 have no chip over 4 to 1 at day 365. 20887 has "Italy +1 ⚔ United Kingdom +10", a front (each of the ten
    borders Italy's Africa or is a pact ally; Italy's army twice the United Kingdom's): a front, the user's decision (a).
  - [x] R53o Grey tanks on green ground (the user's, 2026-11-08, found at R53l): on seed 7781, Germany on Poland, the
    first German armoured division in contact with over 20 enemy figures in its view at 10 m/px, French border included
    (day 3, division 41 at 77982f47), the tanks' middles at least 20 of lightness from the ground (now 13: tanks
    92,92,93 on ground 91,111,89) and over 40 from the enemy's figures; Poland's front as `tankSides1938` judges it
    still passes, and `infantryRanks1938`'s German men from the Polish.
    Done (ADR-888): a grey's tint judges the ground blended as drawn; the French border 73 apart, Poland's front 99.
  - [x] R53m The unit zooms on a late world: `tools/diag/lookFps.ts 7019 critic/c54_seed7019_y20.bin`, alone, at 45
    frames a second or more at 120 m/px in both looks with a draw forced each frame, the fight picked again before each
    row (ADR-890, the user's (a); was the critic's `c54_pf_lookfps.mjs` draws, 33–39, over an empty map). Done: 59.6–60,
    a draw 0.9 ms.
  - [x] R53p Units glide at Max (the user's, 2026-11-08, after R53m): at Max the view draws only on a snapshot (about
    33 a second, each about 6 hours), so units hop. Between snapshots at Max the sprites go from where they were drawn
    to where the snapshot has them, over the measured gap between snapshots (PLAN 2.7h's "Max has no tick length" no
    longer). The bar: the critic's `c54_pf_lookfps.mjs 7019 critic/c54_seed7019_y20.bin`, alone, at 45 or more at 120
    m/px in both looks; `tools/diag/lookFps.ts`'s idle draws as its forced; tracers as now; a pause still lets the step
    finish (PLAN 2.7y). Done (ADR-891): the critic's probe 50–55 at 120 m/px, 54–55 at 30; `maxGlide1938` red before.
  - [x] R53n Before critic run 55, the landings only (the user's call, 2026-11-08: R53k and R53l remade every seed's
    wars, and the landing fixes were read on the histories before): `c54_lhold.mjs` and `c54_lland.mjs` on the 11
    Malta seeds and about 10 new ones, the spread of endings read, not one case. A landing short of its bar is an item
    before the run. No replay of run 54's jobs (the critic runs them); the other bars were read as each item closed.
    Done (no code changed): 21 seeds (the 11 and 25151–25169), each over by h174–186. 11 thrown back at h156–162,
    "thrown back: sailing home to Catania" in the bar and the panel from that hour, ending "over: 2 thrown back; came
    ashore near Catania" with the same in the panel's note and both divisions' news; 10 broke off, "2 came ashore away
    from Valletta" in all three. No hour with "lands in" after a throw-back; no page error. `landingRows`' page check
    on the 21: 0 broken. None short of its bar. Seen, not a bar: "away from Valletta" does not name where (Palermo on
    25153), as "near Catania" does; Italy reaches Malta on none of the 21.
  - Kept: `landingInvariants` and `landingRows` 0 broken; every dimension's evidence in run 54 kept (the pin of seed
    99 moves only with a logged rule change, R53k and R53l the likeliest).
- Run 54's carried findings are R53g–R53m (the user's call, 2026-11-08), each from the report's "what the bar needs".

## Batch 9 — run 55's findings

Critic run 55 (full, on `715a5448`): one blocking issue, R55-B1; naval 7 (under its bar of 8); every other dimension
at 8. No release: R55-B1 is fixed first, then the probes replayed (ADR-833) and critic run 56. R55-B1 broke on HEAD
and not on `8d7d02fe` (a regression since run 54), but naval's findings are items, not the exit (ADR-833).

- [x] R54 **Run 55's findings.**
  - [x] R54a R55-B1 (blocking, naval): a player's landing click sails within READY_WAIT_HOURS of being ready, whatever
    a click-mate in another landing does. 24033: t2004's click of 367 is 17.1 days against its best way of 10.1
    (landing 6 ready at Tokyo t2125, 367 alone in it from t2142 to t2315, sails t2393; the lead is `siblingWait`,
    unconfirmed). 26045 (both commits): t1358's click of 366, 9.5 days against 2.5 (123 h to reach Tokyo from 7 cells,
    turned back near the target): find whether it is a stall or a throw-back the checker reckons as slow, and say which
    in landingInvariants' line. AT: `npx tsx tools/diag/landingInvariants.ts 24033 3517 120 24033 30,90 2` and
    `… 26045 3517 120 26045 30,90 2` at 0 broken; `sh critic/scripts/c55_liab.sh` (26031–26049) still 0; the Malta
    spread (R53n's 21 seeds) unchanged.
    Done (ADR-892): not `siblingWait`. 24033: ready at Tokyo short of room, the landing called a group 273 hours off and
    stood for it; now a group called for room comes within the landing's wait, else those that fit sail. 26045: not a
    stall: three of the click were already in China and walked, and their sea way set its best (2.5 days; 366's own,
    10.2); the checker now reckons a click's best over those that cross. Both 0 broken; `c55_liab.sh`'s setups on
    HEAD 33 of 33 at 0; the Malta endings the same on all 21; `landingRows all` 0; the pin unchanged.
  - Kept: `landingInvariants` and `landingRows` 0 broken.
- Naval's design objections (ADR-843): a cancel hands the army to the AI at once (ADR-759): not taken, ADR-875, the
  user's call. Malta is never taken (18 seeds, held ~90 h then thrown back or broken off, nearly seed-independent):
  not taken, it is the rules working (a two-division landing under a superior fleet fails); the user may ask for it.
- Filed, not in this batch (dimensions at their bars): R55-N1, a war joined by guarantee or alliance leaves no History
  row, and "My wars only" drops the war's own rows (Hearts of Iron's "honours its guarantee" row, Europa Universalis'
  wars outliner); R55-N2, landscape phone (844 × 390) Build tab shows 2 of 10 tiles and Actions puts 8 air-wing
  controls off the screen; small: a phone Breakthrough's clicks land on the nation panel; the editor filter has no
  aliases ("uk", "ussr") and shows the chosen nation alone on a miss; "lost 1 ships", "United States's"; a broke-off
  landing's "away from Valletta" names no place.

## Batch 10 — run 56's naval findings

Critic run 56 (focused, on `d016ed2a`): R55-B1 closed; one blocking issue, R56-B1 (not a regression: the same on
`715a5448`); naval 7, every other dimension carried at 8. Naval is under its bar for a third run (54–56), but naval's
findings are items, fixed, then the critic again (ADR-833), not the exit. No release.

- [ ] R55 **Run 56's naval findings.**
  - [x] R55a R56-B1 (blocking): a returning landing whose groups are at its port ends; those not aboard leave it (stand,
    or take the order that cancelled it), told; a returning landing is not joined (`chooseTransports`' `mine`); the
    "they come back for it" news goes when the division leaves; `landingInvariants`' `stuck` counts a returning landing
    standing still. AT (the report's): (i) `node critic/scripts/c56_turnback.mjs 27125 ITA ENG 1095.5,344.5
    1106.5,383.5 6 ita6_cancelbtn 66 300`: 324 freed within a few hours of the groups' return, the row "cancelled: back
    at Rome …", its panel no longer "they come back for it"; (ii) `CANCELAT=66 ORDERAT=198 ORDERTO=1106.5,383.5
    ORDERIDS=323,324 node critic/scripts/c56_retstuck.mjs 27125 ITA ENG 1095.5,344.5 1106.5,383.5 6 x 480`: the re-click
    forms a landing or is refused with a reason; (iii) `npx tsx critic/scripts/c56_stuckret.ts <seed> 3517 120 <seed>
    30,90 <g>` with no returning-and-still spell ≥ 48 h on 24033 g2, 26041 g1, 27033 g1, 27035 g1, 27039 g1, 27053 g1;
    (iv) `sh critic/scripts/c56_liab.sh` still 0 and the 18 Malta endings unchanged.
    Done (ADR-893): the cancel's "stop where you stand" for 324 on Rome's port cell read as the landing's way home; one
    ashore in a returning landing now takes its order and leaves, none joins a returning landing, and one not aboard
    leaves it at its hour. (i) 324 "Holding" at h69, the row "cancelled: 4 back at Rome, 2 stopped where they stood"
    at h78; (ii) the re-click makes a new landing (h204), sails h324, ends "broke off" h348; (iii) 0 spells on the six,
    the new `stuck` breaking each before; (iv) 78 of 78 at 0, Malta the same on 21 seeds. `landingCancelFreed1938`.
  - [x] R55b R56-N1: a landing that sails without a marcher: the row's "lands in" counts down (not 54 h frozen on 27123),
    and after the landing it says how many are ashore ("7 ashore · 1 marching to Portsmouth"; Hearts of Iron's
    invasion list). AT: `node critic/scripts/c56_frozen.mjs` on 27123, 27127, 27129: no "lands in" text over 24 h, the
    row naming those ashore after h144.
    Done (ADR-894): its days to land are the carrying groups' (the one kept at the port counted its voyage each hour);
    the row counts those ashore. In the page on the three: the longest same "lands in" 18 h, "7 of 8 ashore; sails in
    about 6 days" from h150 to "over: 8 landed". `landingRowAshore1938` (59 h before).
  - [x] R55c R56-N2: a click that joins a sailed landing's next voyage from far off is bounded as a new one is
    (`farPort`): 24033 with orders stopped after day 8 (`ORDERDAYS=8 npx tsx critic/scripts/c56_orderdays.ts`), 367 not
    77 days from click to shore.
    Done (ADR-895): a far port's next voyage is joined only within a week's march of the nearest (`farVoyage`); else
    refused at the click, told why. 367 no longer joins; `landingFarVoyage1938` (73 days before).
  - [x] R55d R56-N3: the fuzz judges more clicks: a `landingInvariants` mode with orders that stop early (`orderDays`),
    in the checker's suite of seeds, so that R56-B1's and R56-N2's cases would have broken it.
    Done (ADR-896): a click with no idle group is reckoned by its nation's other groups (from their leg's end); the
    tool takes order days; the suite runs three cases with orders for 8 days. R56-N2's case breaks before R55c, not
    after. On the critic's 26 seeds × 6 setups, 149 of 156 at 0; the 7 found are R55f and R55g.
  - [x] R55e Small: after a cancel, 323's ticker says "left its landing for a new one"; the "they come back for it"
    news stays after the division has marched off (with R55a); "transports 48, 6 needed" when 48 are at hand reads as
    a shortage.
    Done (ADR-897): a cancel's stopped ones are not told they left (the row says so); one leaving for a march is told
    "for its new order"; "6 transports needed, 48 at hand". The stale "they come back for it" went with R55a.
  - [x] R55f Found by R55d: a click's division walks weeks to a far port, no group free to come to its own (the
    "marches are slow against voyages" objection, measured). `npx tsx tools/diag/landingInvariants.ts <seed> <setup>
    120 <seed> <probe> <groups> [order days]` at 0 broken on: 26035 3517 30 2 8 (t188's 367, 44 days), 26039 3517 30 2 8
    (t39's 366, 88.5 days: joined a landing at port 95, which sailed without it, walked ~80 days to its next voyage),
    26041 3517 30 2 8 (t151's three, 32.9), 26041 3517 30,90 2 (t286's 366), 26041 3517 30,90 1 (t151's 365), 27045 3517
    30 2 8 (t69's 365, 71.5). Each traced first; a rule (e.g. a late marcher whose march to the landing's port is over
    SPLIT_SOONER_HOURS longer than to its nearest leaves it, told; or the next voyage gathers at its port) checked on the
    156 setups.
    Done (ADR-898): a sibling is waited for no longer than the landing's own wait, and one not ready reads its march;
    a gathering landing all of whose divisions march to a port a week further than their own moves its port there;
    a click does not join such a landing. 155 of 156 at 0 (the one left is R55g); four cases in the R55d suite, red
    before; Malta the same on 21 seeds; `landingRows all` 0; pin unchanged.
  - [x] R55g Found by R55d: 26039 Britain, orders for 8 days (`… 26039 15101 120 26039 30 2 8`): t1318 `stuck`, 273 in
    gathering landing 3 with no ground gained for 45 days. Traced; 0 broken.
    Done (ADR-899): 273 (12,412 men) waited on a group of 4,200 with none to call within the wait; nobody fitted, so
    nothing sailed, untold. Now a group from anywhere is called, else those at the port are told. Red before, in the
    R55d suite; 156 of 156 at 0.
  - [x] R55h Run 55's small items (the user's call, 2026-11-09: before critic run 57): "lost 1 ships" (a plural by
    count); "United States's" (a possessive of a name ending in s); a broke-off landing's "came ashore away from
    Valletta" says where (as "near Catania"); the editor filter takes aliases ("uk", "ussr") and on a miss does not
    show the chosen nation alone; a phone Breakthrough's clicks fall on the map, not the nation panel.
    Done (ADR-900): "lost 1 ship"; "United States' air force"; "2 came ashore near Palermo, away from Valletta" (row
    and news); the filter takes tags and aliases, an exact one chosen first, and a miss lists all ("none match; all
    shown"); on a phone the nation panel is closed while Breakthrough or Territory is on. New tests red before.
  - [x] R55i R55-N1: a war joined by guarantee or alliance leaves a History row ("France joined the war on Poland's
    side (guarantee)"), a guarantee given has one, and "My wars only" keeps a war's rows when the player is on one of
    its sides (26309, France).
    Done (ADR-901): `WarJoined`, "France joined the war on Poland's side, as its guarantor" (an ally: "as its ally");
    My wars only keeps the declaration and the peace of a war the player was called into. No guarantee-given row: none
    is made in play. Pin e0da3e5f → c64a53fb (the log's rows alone).
  - [x] R55j R55-N2: landscape phone (844 × 390): the Build tab shows its tiles, not 2 of 10 in a 170-px panel, and
    the Actions tab's air-wing controls are on the screen; `buildTab1938` gains 844 × 390.
    Done (ADR-902): on a phone on its side the panel is wide and reaches the bar, Build has four columns, Actions two;
    `buildTab1938` at 844 × 390 red before, every tile whole and no control off the screen.
  - Kept: `landingInvariants` and `landingRows` 0 broken; R55-B1's commands 0; the Malta endings.
- Naval's design objections (ADR-843): a cancel hands the army to the AI at once (ADR-759): not taken, ADR-875, the
  user's call. Malta is never taken: not taken, the rules working (run 55). Marches are slow against voyages (a
  division walks about a cell a day, so the port decides weeks; a group sailing to the division would often be
  quicker): taken as R55f once R55d's checker measured it (five clicks up to 88.5 days); R55c bounds the case of a
  sailed landing's next voyage.
- Carried: R55-N1, R55-N2 and run 55's small items: taken as R55h–j by the user's call (2026-11-09).

## Batch 11 — run 57's naval findings

Critic run 57 (full, on `d3519cb0`): R56-B1 closed; one blocking issue, R57-B1; naval 7, every other dimension at 8.
Naval's findings are items, fixed, then the critic again (ADR-833). No release.

- [ ] R56 **Run 57's naval findings.**
  - [x] R56a R57-B1 (blocking): a click's landing held past its best way. (i) `npx tsx tools/diag/landingInvariants.ts
    28037 3517 120 28037 30 2 8` at 0 broken: a division whose march to a shared port would hold the click past its
    bound splits or is left, told, so `SPLIT_SOONER_HOURS` and `slowClick` cannot disagree; (ii) `… 28039 3517 120
    28039 30,90 1` at 0, or the checker shown wrong to reckon a sea way for a division already on the target's land
    (ADR-892); (iii) `sh critic/scripts/c57_liab_head.sh` (246 runs) all at 0; `c57_stuckret` 0; Malta's 18 the same.
    Done (ADR-903): the landing's waits were anchored on its ready hour (28037's, 94 hours after the click), the
    checker's on the click. Now a landing is due ashore by its click's best way (`Landing.due`, the checker's
    `bestWayHours` moved into the sim) and waits for no march or call past READY_WAIT_HOURS of it: 28037 ashore 9.1
    days after the click (best 6.7), 366 on the next voyage. 28039 was the checker's: 365, aboard, clicked again onto
    its landing, left t853's click, judged by 366 left for the second voyage (the critic's "in China" was a two-group
    trace, `GROUPS`); one aboard is kept in its click. (i), (ii) 0; (iii) 246 of 246 at 0, Malta's 21 the same.
  - [x] R56b R57-N1: a landing whose first wave broke off says where they came ashore ("4 ashore near Palermo, away
    from Valletta; 2 at Rome"), not "4 of 6 ashore". AT: `SHOTAT=114,120,132 node critic/scripts/c57_lhold.mjs 27125
    ITA ENG 1095.5,344.5 1106.5,383.5 6 ita_malta6 140`.
    Done (ADR-904): the row's `ashore` is those at the target; those away are `away`, named where all at one place:
    "4 came ashore near Palermo, away from Valletta; sails in …". `landingRowAshore1938` red before.
  - [x] R56c R57-N3: an ended landing tells every division it counts (28113, six to Norwich: 1 and 2 untold). AT:
    `node critic/scripts/c57_whotold.mjs 28113 GER ENG 1100.5,267.5 1031.5,266.5 6 120`.
    Done (ADR-905): the worker told all six; the page kept the last four news. It keeps four rows of the ticker, a
    loss of several in one hour as one: `c57_whotold` all six told, "6 divisions: … (1, 2, 3, 4, 5, 42)".
  - [ ] R56d R57-N2 (the user's call, 2026-11-09): the Actions tab's "Offer peace" the menu's: greyed when the enemy
    would refuse, the reason in its title (`peaceVerdict`/`peaceWhy`), not a silent no-op. AT: 28401 as Germany, day
    30, "Germany ⚔ Poland (+0)": the button disabled with the reason; at +32 it still makes peace.
  - [ ] R56e Run 57's small items (the user's call, 2026-11-09): the bar's "12 transports needed, 7 at hand" for the
    two left at Rome counts what those two need; `seaBattlesLook` counts a battle seen only with both sides' ships
    drawn; a destroyer and a cruiser squadron told apart at 40 m/px.
- Design objections: a cancel hands the army to the AI (ADR-875, the user's call); Malta never taken (the rules
  working); "ashore" counts those thrown ashore away (R56b takes the words); alliances ignore the map (carried).
