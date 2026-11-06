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
- [ ] R33 **The landing as one object** (ADR-829, the user's decision, 2026-11-05; the critic's objection since run
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
  - [ ] R33b The object, its save, and the player's whole landing path on it: `world.landings` (target, water,
    land, port, transports, divisions with the hour each joined, state, escort), saved only when not empty, older
    saves' convoy sections read into it; a click makes or joins one, an hour's orders edit it as a batch (all of
    its divisions: the landing redirects or cancels; some: they leave it, told); a recall or cancel at sea sails
    back to its own port; the per-division rules (`heldGroup`, `noteLeaving`, `turnBack`, `waitedFor`, `sailAboard`,
    `ashoreFromShip`, `soleAtSea`, `comingTo` …) removed, each with its test named; SPEC §6.2 rewritten; the AI's
    path and the pin unmoved; a save mid-voyage round-trips bit-identical. AT: the 33 landing test files' cases
    green (an hour pinned becomes "within a day"), the grid no worse than R33a's on any kind.
  - [ ] R33c The map's mark, the panel and the news read the object (`seaHint`, `voyageOf`, `landingWait`,
    `voyages`, the news's `landedAway`); a mark for a division aboard at sea (R43-N4). AT: the grid's mark column
    0 broken; the landing e2e specs green.
  - [ ] R33d `landingInvariants` (as `diploInvariants`) on several seeds and the fuzz (`landingReclickFuzz` with
    recall, redirect, cancel, port shut, late order; the 120-day run a tool): 0 broken. Then the grid on the final
    code (R33's AT), and the critic, full.

## Batch 3 — readability (after the release, ADR-829)

The carried non-blocking issues of critic runs 31–43 (why some dimensions are 7 and not 8; none gates a release)
and the small ideas from other games. Each one line until it is taken.

- [ ] R34 The critic's carried issues: R37-N4 (relations graph labels overlap); R32-N3 (a refusal toast cuts its
  reason); R37-N3 (God's Breakthrough at peace does nothing, says nothing); R31-N1 (hero counters under the HUD);
  R31-N6 (the graph eats the first tap after a drag; a hero hides fleets stacked with it); R32-N2 (trait text only
  on hover, none on a phone); R32-N5 (sea heroes die more); R36-N3 (a re-click of the same landing is silent);
  R39-N2 (no landing mark on touch); R39-N3 (Escape leaves the mark); R39-N4 (the tooltip points at a mark off
  screen); R40-N2 ("go by sea" for a selection most of which march); the ranking cuts long names.
- [ ] R35 Small ideas from the reports: an order's error cleared by any new order; a flag at the destination while
  choosing; a long-press preview of an order on touch; a mark on a fleet the AI has taken back.
