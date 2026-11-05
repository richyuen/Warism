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
- [ ] R23 **Naval back to its bar: the way out of the wait aboard** (critic run 35, focused: two blocking issues,
  R35-B1 and R35-B2, both in R22b's `ashoreAtPort`; naval 7 under its bar of 8 for them). Each sub-item its own
  commit; then the critic again.
  - [ ] R23a A refused order leaves the division aboard (R35-B2): the order is judged before the division goes ashore;
    a refused one leaves it aboard, its landing kept. AT: Japan's four to Shanghai, the one aboard at Tokyo ordered onto
    open sea and onto Calais (France at peace): refused (17, 15), still aboard, and all four land together; an e2e spec,
    the panel still "Aboard at Tokyo" with the refusal; red without.
  - [ ] R23b Ordered to the same landing again, the division aboard stays (R35-B1): an order of a division aboard a
    loading convoy to the landing it is bound for changes nothing, and no division is bound to a group beyond its room
    when another of its click is bound to it. AT: Japan's four to Shanghai, the one aboard clicked to Shanghai again:
    no division waits at Tokyo without room, all four land within a day of each other, no later than without the
    second click; red without (365 on the quay h512–h1367).
  - [ ] R23c A refusal notice goes with the next accepted order (R35-N1): not only when the state changes. AT:
    Germany's division marching to Hamburg, refused Paris, then sent to central Germany: no refusal under "On the
    march" once the new order is taken; red without.
  - [ ] R23d The escort's wait does not cost a lone landing time (R35-N3): one division to Belfast (seed 3517, the
    critic's case) lands no later escorted than unescorted. AT: `landingEscortWait1938.test.ts` on the critic's seed;
    red without (73 h against 59).
  - [ ] R23e A whole click clicked again keeps its landing together (R35-N2, older than R22): the four re-sent to
    Shanghai at hour 26 land within a day of each other. AT: a unit test of the critic's case; red without (185, 633,
    952, 1243).
