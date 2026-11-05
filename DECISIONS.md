# Decisions (ADR log)

Format: ID · date · status · decision · why · consequences. Deliberate deviations
from AoC are tagged **[AoC-DEVIATION]**.

---

> The ADRs of earlier months are in `docs/history/DECISIONS-<YYYY-MM>.md` (ADR-805), in the order they had here. Search them by number (`grep -rn "ADR-623 " DECISIONS.md docs/history/`).

### ADR-826 · 2026-11-04 · accepted — No landing on a neutral's ground (ROADMAP R20, R32-B1)

- **Context.** Critic run 32 (R32-B1): a player's order over the sea (R17, `seaConvoy`) checked only
  that a landing exists. A division landed at Calais (France at peace with Britain) stood there until
  the day start, when the march home (`repatriationSystem`, ADR-169) found it on foreign ground with
  no land way home and set it on Britain's spawn point, untold. A march by land onto such ground is
  refused (`NoRoute`); the two orders disagreed.
- **Decision.** The sea order is refused as the march is: where the target cell's holder or the
  landing cell's is `foreignTo` the nation, `MoveRejected` with a reason of its own, `Neutral` (15:
  "it would land on the ground of a nation outside its wars"; `NoRoute`'s words speak of the land).
  The march home keeps its jump, which a peace made while a convoy is at sea still brings about, and
  says it: `FormationSentHome` (71), a row below the ticker for a formation of the player's.
- **Not chosen.** Keeping a landed division where it is: it would stand idle on a neutral's ground,
  the state ADR-169 exists to end; a landing to make war on a neutral is a declaration of war first.
- **Pin.** Unmoved: the AI never gives a player's sea order, and an event is no state.
- **R21a (critic run 33, R33-N1).** The same holds after the order, until the transports sail: a
  division bound for its convoy is stopped where it stands (`Neutral`), as a march is stopped at
  the border (`Barred`); a loading convoy with its landing a neutral's ends, those aboard ashore at
  the port. A convoy at sea goes on: turning it back is a voyage of its own, and the landing is told.
  `landingPeace1938.test.ts` (bound at the peace; aboard a loading convoy at the peace), red without.
- **R21b (R33-N2).** A port of its nation that it stands at, bombed shut, is `PortShut` (16), not
  `NoPort`: a reason only, for the player's order and the AI's alike (no state, the pin unmoved).
  `portBombing1938.test.ts` asserted `NoPort` for that case; it now asserts the new reason.
  `landingPortShut1938.test.ts`: the critic's case through a player's convoy.
- **R21c (R33-N3).** A click on the map closes the formation panel (PLAN 2.14b) before the order
  goes, so a refusal had only a ticker row, one line beside a panel (ADR-754). The refusal now opens
  the panel of the formation refused again, if it is selected and no formation panel is open: the
  reason is read in full where the order was given. The tooltip's sea line asks the worker for a
  neutral's landing (`neutralLanding`) and says no landing instead of promising the voyage.
- **R21d (R33-N4).** The player's formations sent home in one day start are one event,
  `FormationsSentHome` (72: the nation, how many), a History kind, and one row below the ticker
  (the page keeps four rows; ten sent home lost six). The player's only: the AI's are mechanics, not
  history (seed 9419: 255 in 30 years), and with none played (the pin's run) nothing is recorded, so
  the pin stands. `sentHomeMany1938.test.ts`: ten at once, one event, one History record, one row.
- **R21e (R32-N1).** One click, one port, one sailing. A division whose target has a convoy loading
  at a port of its land, full, takes a group standing at that port or calls one there, before the
  nearest standing group elsewhere (an amendment of R17b's order of choice); and a loaded convoy waits
  while another at its port for the same landing is still to load. The wait is not bounded: on the
  critic's case (Japan to Shanghai, room for one division a group) the second division is some 500
  hours from Tokyo's port, and no bound short of that lands them together; so both land at hour 632
  and 633 where they landed at 123 and 510. The trade is the landing together; the panel says why the
  first waits (`aboard`, "waiting for the rest of the landing"). A click that wants speed gives the
  far division a target of its own. The second group, a new convoy, takes its own escort (two
  warfleets for such a click with the box ticked). The ROADMAP's "where one group has room" did not
  cover the AT's own case; restated. `landingTogether1938.test.ts` (red without: 387 hours apart).
- **R22b (critic run 34, R34-N1).** The unbounded wait gets a way out. A division aboard a player's
  convoy still loading at a port of its nation takes an order (an amendment of PLAN 4.5a's "aboard it
  takes no order", ADR-262): it goes ashore at the port's cell and the order stands; the convoy waits
  on for the rest, or is over with nobody aboard or bound. Not a landing (no event, no loss of
  organisation: it never left the quay). The AI's embarked and every convoy under way keep 4.5a: the
  AI never has a player's convoy, so the pin stands. Checked against: `rejectReasons1938.test.ts`
  (an order aboard a landing's transports refused `Aboard`), `serverOrderNews.test.ts` (an order
  while the voyage is under way refused, the voyage told on), `landingTogether1938.test.ts`,
  `landingPeace1938.test.ts`: green before and after. `landingAshore1938.test.ts`: red without.
  R23a (critic run 35, R35-B2): the order is judged with the division ashore, and a refused one puts
  it back aboard as it was (`ashoreAtPort` returns the way back): "a refused order leaves the one
  before it standing" holds aboard too. `landingAboardRefused1938.test.ts` and `.spec.ts`: red without.
  R24a (critic run 36, R36-B1, older): and for a division bound for a convoy, walking to its port or
  waiting there: a refused order restores its `seaBound`/`seaFetch` (cleared, it stood at Tokyo for
  good, and a convoy whose bound divisions were all refused sailed with the one aboard alone).
  `landingRefusedBound1938.test.ts`: red without.
  R23b (R35-B1): an order to the landing it is aboard for (the same land and water, `sameLanding`)
  is taken and changes nothing; ashore, it was bound anew to transports another division of its
  click was walking to, and that one waited on the quay for weeks. `landingSameAgain1938.test.ts`:
  red without. R23e (R35-N2, older than R22): the same for a division bound for a convoy still at its
  port; its order cleared its binding, which was all that gave its convoy a landing (`convoyTarget`),
  so it was put on another convoy's next voyage, and a click clicked again landed one at a time
  (148, 633, 952, 1243 h). Now the four land together (1242–1243). Red without.
  R24b (critic run 36, R36-B2, older): "the same landing" is a landing within two cells (water and
  land, `SAME_LANDING_CELLS`), the land of the same holder, not only the same cell pair: a click a
  cell off (14 px at the default zoom, nothing on the screen to tell) sent the one aboard ashore to
  Sasebo's transports, landing 27 days after its partner. **Not chosen:** moving the convoy to the
  new cell: it changes the landing of every division of the click for a difference the player
  cannot see. A marker of the landing while choosing (the critic's design objection) stays open.
  `landingNearSame1938.test.ts`: red without (one cell east: 633 / 1285).
- **R22c.** The wait aboard is accounted for: "1 of 4 aboard; the last 47 days from the port"
  (`voyage.wait`, the furthest bound division's `marchHoursLeft`). Worker and UI only.
- **R22d (R34-N1).** The escort is not sent weeks ahead. R17d sent it at the order; with R21e's wait
  it stood at Shanghai's water from hour 23 to hour 1243. It is now kept where it stands and sails
  when its voyage (`sailHours`) is at least the wait left (`waitLeft`), so it is there about when
  the last division is aboard; a loaded convoy waits only for an escort in a battle or one that
  would be there after its transports (`escortAhead`). **Not chosen:** sailing it with the
  transports and holding the loaded convoy at its port until the escort is there: the escort is
  there first by construction, but every escorted landing is later (Belfast 110 h → 172 h,
  Shanghai 1243 → 1289 h), a cost with nothing bought. With the timing, both land as without an
  escort (110 h; 1242–1243 h). The pin stands: the AI has no player's convoy. Checked against:
  `landingEscort1938.test.ts` (R17d: sails at the click on Belfast, there first, held until ashore,
  none free told, none asked none taken), unchanged and green; `landingTogether1938.test.ts`.
  `landingEscortWait1938.test.ts` (Shanghai: none there more than a day before the last is aboard,
  each there before its transports, together, no later than unescorted; Belfast no later): red
  without (the escorts there from hour 23).
  R23d (critic run 35, R35-N3): the escort is the one of the eight nearest by straight cells that is
  there soonest by sea (`sailHours`), not the nearest: Britain's nearest to Belfast had Scotland to go
  round (72 h), and the loaded transports of a division already at the port waited for it (landed
  73 h against 58). `landingEscortWait1938.test.ts`'s fourth-nearest case: red without. Its nearer
  escort waits where it stands, so `landingEscort1938.test.ts`'s "under way after the first hour"
  (R17d's sailing at the order, which R22d replaced) is restated: under way, or kept where it stood.
- **Tests restated.** `serverOrderNews.test.ts` (Britain on Cuxhaven) and `orderNews1938.spec.ts`
  (Switzerland on London) each order a landing at peace to see a refusal told with its reason (no
  port, no transports); `Neutral` now comes first. Each now makes that war first, and its assertions
  stand unchanged: a neutral's coast is refused whatever ports there are, so `Neutral` comes first.
- **Test.** `landingNeutral1938.test.ts` (Calais at peace refused `Neutral`; held by an enemy, by
  sea; idle there, sent home with the event; the first and last red without the rule),
  `landingNeutral1938.spec.ts` (the panel's reason; the ticker's row).

### ADR-825 · 2026-11-04 · accepted — A moved pin runs the whole e2e suite (ROADMAP R19)

- **Context.** The gate runs the e2e specs whose files changed (ADR-87; its full run at each
  numbered tick went with the plan, ADR-805). R16b changed rules, moved the pin and passed; nine
  specs that find a scene in a seeded 1938 world (a battle, a fall, a fleet on a day) were red,
  found by a full run by hand. R18 moved the pin again and turned `declutter1938` red. ADR-87's own
  amendment (PLAN 3.4Rn) had found the same: rule changes that moved the pin broke `wrecks1938`.
- **Decision.** `planE2e` runs every spec when the pin's file (`tests/sweep/baselineHash.test.ts`)
  changed. A rule that moves the history must move the pin in the same commit, so that file is the
  mark of a moved history; a sim change that leaves the history alone runs what it ran before. The
  whole run goes through the gate's rule of a red run again alone (ADR-779), which the hand-run
  full suites lacked: six or seven specs red by load in each, green alone.
- **What it costs.** About fifty minutes on a commit that moves the pin, a few a batch. Narrower
  than ADR-87's rule of a full run at every numbered tick, which the user found too often; a
  spec that steps a seeded world cannot be told from one that does not without running it.
- **Test.** `gate.test.ts`: a change with the pin's file plans the e2e stage in full; the same
  sim change without it plans none.

### ADR-824 · 2026-11-04 · accepted — A block keeps clear of its own side's other stacks (ROADMAP R18)

- **Context.** `stackBlocks1938.spec.ts` went red after R16b moved its scene: on seed 1212 (the
  Soviet Union at war with Poland from the start, day 20) Soviet blocks on two neighbouring Polish
  divisions stood in one another (66/164, 153/164, 156/200, 153/156; up to 0.036 cells deep).
  `deployOf` kept a block clear of the enemy's blocks before it in the hour's order and of its own
  stack's lines, but read no block of its own side's other stacks. The rule was always so.
- **Decision.** Of the blocks near it in contact and before it in the hour's order (`orderOf`), a
  block reads its own nation's and its side's (`sameSide`) as it reads an enemy's: it stops the gap
  short of one in its way, or takes the next file out with room.
- **Consequences.** The deployment is read by the air AI's patrols, so a game moves: pin aa1a5dbb →
  6012d9d2. `deployStacks1938.test.ts` (red without: the four pairs), `stackBlocks1938.spec.ts`
  green unchanged; `diploInvariants` 99 0 broken; the whole e2e suite run (ROADMAP R19's lesson).
  The sim reads a block's place in the air AI's missions (`air.ts`: `deployOf`, `withFreshDeployments`);
  land combat reads it only for the fire events it tells.
- **The full suite on it:** 330 passed, 7 red; six green alone (load), one of the history:
  `declutter1938.spec.ts`'s "more clusters in the box at each finer level" fell to a tie (5 → 3 at
  6 px per cell, 6 → 6). A probe of the cluster keys showed each of the six with its formations in
  one fine cell and one child, the whole view 223 → 328: a tie the nested grids allow. Restated
  (ADR-79, seventh addendum in the spec): at a level change no fewer clusters in the box and more in
  the whole view; over the whole way in more clusters in the box, and more than twice the counters.

### ADR-823 · 2026-11-04 · accepted — The player orders landings overseas, with escort (ROADMAP R17)

- **Context.** A left-click on land over the sea with divisions selected lands them (PLAN 4.5a,
  4.9b), but only when the player's transports already wait at a port of their land; transports
  never come to the troops, divisions land one by one, no screen shows the voyage's state, and
  only the AI escorts its landings.
- **Decision (the user's, 2026-11-04).** Keep real transports (no abstract sea lift: it would make
  transports, the sea's control and the invasion AI pointless). The same left-click order; the
  transports come to the troops (R17a); a click's divisions land together (R17b); the state and the
  sea leg are shown (R17c); an "Escort with warships" box, ticked by default and remembered, sends
  the nearest idle warfleet not under the player's own order with the landing (R17d). A fleet the
  player orders is never taken; ordering a fleet to the landing water stays the way to pick one.
- **R17a.** Only a player's order calls (`moveFormation` naming its nation; God's and the AI's
  orders never take this path, so the pin holds). The group called is the nearest idle one by
  straight cells that has a sea way (4 tried), never one under way, fighting, carrying, held by the
  editor, or called already; it sails under the player's order, which the naval, invasion and
  economic AIs leave alone, and which lasts while the fleet lives (a fleet's player order never ends
  on arrival today; relied on here, filed under R17). The formation waits at the port while the
  group is under way; sunk or stopped elsewhere, the order ends refused (`NoTransports`). The call is
  saved as an optional section (`world.seaFetch`): no new save format.
- **R17b.** A convoy is a transport group bound for one target cell (`world.convoyPort`, the
  group's port; `world.seaFetch`, the divisions bound for it); a later order to the same cell joins
  it while it loads. The group waits at the port until no division bound for it that would fit is
  still to come, then sails; one left over waits for the voyage back. No timer: a division whose
  march ends short of the port is not waited for (refused `NoTransports`), and a contact cancels as
  any player's march. A repulse ends the convoy. Every player's order over the sea goes this way,
  transports at the port or not; the AI's and God's orders keep the old path (`tryLanding` sails on
  boarding), so the pin holds. `Embarked` is not widened (its saved stride stays).
- **R17c.** Shown, not simulated: the sea leg is a straight dashed line (port's water or the
  transports, to the landing's water and the land), drawn for the formations whose order lines are
  shown; the transports' own order line shows their way. "Landed" is the worker's (a day after a
  player's order lands), not the sim's. The tooltip's hint asks the worker (`overSea`), as the
  client has no land components.
- **R17d.** The box is the page's setting, not the world's (`Settings.escort`, localStorage, as
  the nuclear pause): it travels on each order (`moveFormation.escort`, absent = none, so a God
  order or an old script takes no escort), and the world keeps only the escorts under way
  (`world.escorts`, an optional section: no format change, the pin unmoved). A convoy's escort is
  picked when the convoy is made; a division that joins it adds none. A warfleet is a fleet with no
  transport room. It sails at once to the landing's water, so it is there first while the
  transports load; "its station" is the cell it came from (a port's water, or its place at sea).
- **Also (the user's, 2026-11-04).** The United States' lean after R16b (29% of the land on the
  mean, done31 20%) stays a watch for the critic and the release sweeps, not an item.

### ADR-822 · 2026-11-03 · accepted — A nation's traits are state, shown and set by God (ROADMAP R16a)

- **Context.** Of a trait's 18 modifier kinds only `income` and `manpower` acted, folded into two
  multipliers at the start; the nation's traits themselves were kept nowhere, no screen showed
  them, and nothing could set them. The user chose (2026-11-03) to make the modifiers act where the
  game has a rule for them, drop the rest, and let God set a nation's traits; old saves need not
  load.
- **Decision (R16a, no rule change).** `nations.traits` (u16, saved) holds a nation's traits as a
  bit mask of `data/traits/traits.json`'s order (`src/shared/traits.ts`). The scenario, random
  traits and the new command `setTraits` (refused `TraitsClash`, `OutOfRange` past the 14 bits, for
  a dead or absent nation) set it; `applyTraits` sets the income and manpower multipliers with it.
  Rebels, spawned nations and reused ids start with none; a revived nation keeps its own. Setting
  traits leaves aggression alone: a scenario's aggression is set with its traits in mind (Germany
  90), and adding the bias again would count them twice; the bias stays the random option's. The
  nation panel's Overview shows the traits, each with its description; the God tab has a box a
  trait, one that would clash greyed. God's edits of a nation (rename, colour, bonus, gold) make no
  row of the history, and traits are among them.
- **Save format** 1 → 2 (`STATE_FORMAT`): a save from before loads no more; the title screen says
  it is from an older version.
- **Pin** (`tests/sweep/baselineHash.test.ts`): 614c24dd → f7089e32, a new column only. Seed 99's
  state after one year, hashed without `nations.traits`, is 614c24dd: no rule moved.
- **R16b: the modifiers act** (`traitMod`, summed over the mask, cached by mask), each where the
  game has its rule, all 16 kinds of the data used (none dropped):
  - `landAttack` and `landDefense` beside the land attack and defence buffs; `armorAttack` on the
    fire of armour elements alone; `navalAttack` beside the naval attack buff; `airAttack` on air
    fire and strikes (not bomb tons), `airDefense` dividing the air fire a wing takes;
  - `warExhaustion` × a war side's exhaustion before a nuclear shock, by the side's leader (the
    side's first nation, as the suing rule reads it);
  - `stability` as −10 × it unrest a month (the unrest buff's scale) on the holder's core land
    only, `revoltSuppression` × suppression's unrest taken off;
  - `research`: each gold paid counts 1 + it, so a tech is both sooner and cheaper;
  - `industry`: an order's gold ÷ (1 + it); `buildSpeed`: its training days ÷ (1 + it), rounded up,
    at least a day (`priceWith`, `daysWith`, shared with the production list, which shows the
    nation's own price and days). The economic AI still weighs an order at the template's price:
    an industrial nation keeps a little more than it plans to;
  - `org`: org regained fed and out of contact × (1 + it);
  - `fortStrength`: the defence of a cell the nation holds against a flip × (1 + it); this is the
    game's fortification, with no new system.
  Magnitudes as the data had them. Judged by a ten-seed sweep against the last one on the same
  seeds (2026-11-04 done31, no rule change since) and the rules of war and peace.
- **R16b: stability on core land only.** With `stability` on every province a nation held, the
  sweep of seeds 1551–1560 broke: the largest realm's land 34% on the mean (done31 17%), the
  United States' 44% (20%), limits 4 of 10 (7). Sweeps that zeroed one family of modifiers each
  (scratch, `.cache/sweep/reports/2026-11-04-sweep-z*.md`), the mean largest land: defence and
  fortification off 26%, production off 28%, war exhaustion off 36%, stability and suppression off
  20% (9 of 10). Stability had calmed the conquests of the isolationist United States and stirred
  those of the militarist and revolutionary empires that hold it in check. A nation's mood is its
  own land's: conquests breed unrest as before. A no-industry run was set aside: Germany and the
  Soviet Union are industrial too.
- **R16b sweep** (`docs/sweeps/2026-11-04-sweep-traits16b.md`): limits 7 of 10, riser and faller 10
  of 10, no stasis 9 of 10 (reported), no break-up 10 of 10; the largest land 22% on the mean, the
  United States' 29%. Limits are done31's 7, under the bar of 8 as done31's were; the United
  States still leans larger than before (its defence and production traits), a watch for the next
  balance item.
- **R16b tests.** Tests that pin a base rule on a nation now given traits read it bare
  (`withoutTraits`, `tests/helpers/sim1938.ts`): production, wings, the heavy division, buffs, org,
  carrier strikes, naval guns, the economic AI's reserve; `traitEffects1938.test.ts` pins each
  trait's own factor. `nukeMeansLost1938`: the fortifier holds Prague to day 50, the window 40 → 80
  days. The economy invariant's desertion bound now leaves armour out (under fire in the same hour
  it loses whole tanks on a roll and drops desertion's share; Poland's armour on 7019, day 59) and
  holds that its tanks rise not; still red with no desertion.
- **Pin**: f7089e32 → aa1a5dbb. `diploInvariants` 99: 0 broken.

### ADR-821 · 2026-11-03 · accepted — SPEC.md rewritten from the code, its references checked (ROADMAP R6)

- **Context.** SPEC.md §3–§10 (260 KB) is a design log: PLAN references, "as built" and "before it
  was" narratives, measurements, and names gone from the code (§10 still described `npm run parity`,
  `critic:due` and the phase reviews). R6 is too big for one sitting.
- **Decision.** R6 in ten parts by size (R6a–R6j, about 30 KB each). The rules of every part:
  - written from the code outward: for each subsection, read the files it covers and keep only
    what they do; prose is not reformatted into place;
  - `[ADR-n]` cites stay; PLAN references and the history of a rule go (DECISIONS has them);
  - a number is a rule's constant, a budget, a schema's field or a data size, never a measurement;
  - what was dropped is removed, not narrated;
  - the part updates the header's list of current sections and the contents list.
- **The checker.** `tools/spec/refs.ts` judges each backticked path (the tail of a tracked path,
  `<x>` and `*` for any part, `.cache/` not judged), `npm run` script and code name (each dotted
  part a word of the code, data or config) of a section; `tests/unit/specRefs.test.ts` holds the
  current sections at 0 misses, each part adding its own. It is a floor: a name that exists may
  still be described wrong, so each part lists the constants it states with the file and line read.
- **Gate.** A commit of SPEC.md alone runs nothing (documents), and a code change that removes a
  name SPEC cites does not reach the test by its imports. The test runs by hand in each part (named
  in PROGRESS) and every night in the whole unit suite; no gate change.

### ADR-820 · 2026-11-03 · accepted — A second release on one day is tagged with a letter (ROADMAP R5b)

- **Context.** Batch 1's release falls on the day of the first (`release-2026-11-03`), and PROMPT.md's
  tag is `release-<YYYY-MM-DD>`: the name is taken.
- **Decision.** A later release on a day already tagged takes the next letter: `release-2026-11-03b`
  (then `c`, …). The CHANGELOG heading is the tag.
- **Also.** Two known reds passed in this release's review and leave `tools/gate/knownRed.json` as
  their BLOCKERS entries say (moved to `docs/BLOCKERS_DONE.md`): `shipMarks1938`'s T3 (18 px, bar 17)
  and `seaRow1938`'s Speed x1 (red once in its chunk, green alone, which the review counts a pass).

### ADR-819 · 2026-11-03 · accepted — A default is a row of the history (ROADMAP R7)

- **Context.** After COLLAPSE_MONTHS bankrupt months a nation with nothing to fragment (no
  puppets, dead claimants or restless provinces) had its debts voided by `collapseNation`'s early
  return, with no event: the history never said why its gold went to 0. R4a's checker let it pass
  by a rule of its own (Poland on 7019, day 151).
- **Decision.** A new kind, `NationDefaulted` (a = the nation, b = the debt voided, gold rounded),
  logged in the History ("Poland defaulted: its debts were voided", type "Default"), not the ticker:
  a bankruptcy is not either. A collapse that fragments the nation is told by `NationCollapsed` as
  before.
- **Checker.** The economy rules' "a default with no row" exemption is gone: a default's gold rise
  is allowed in the hour of its row, as a collapse's.
- **Evidence.** `worldInvariantsEconomy.test.ts` (7019, Poland 800 in debt) red without the row
  ("POL's gold rose 251.45 … day 151"), green with it. `defaultRow1938.test.ts` 1 of 1 (red without
  the row); `history.test.ts` (every kind has its roles and texts) green. Seed 99's pin unchanged.

### ADR-818 · 2026-11-03 · accepted — A fleet moved after the air hour takes its wings (ROADMAP R15, R30-B3)

- **Context.** Critic run 30: with heroes on, the checker's air rules broke on 3373 (random
  diplomacy) and 5591, and never with heroes off. Traced per system: Japan's carrier group closed in
  a sea battle (`closeOn`, in `navalCombat`, after `air`) that it came into and left in the same hour,
  so no battle excused its wings standing behind (5591, day 158); Britain's was set on its cell's
  water by sea control's order home from a lost base (`orderSail`, 3373, day 601). The heroes change
  the wars, not the rule: both moves exist with them off.
- **Decision.** `carryWings` (air.ts): a fleet's carrier wings (not one ferrying to it) are set where
  it is; `closeOn` and `orderSail` call it after they move the fleet. A wing's place is its base's
  (the air system sets it each hour), so nothing else reads differently.
- **Checker.** "Kept a base lost an hour ago" now means the same base: Nationalist Spain's wing 932
  (5591, day 831) fell back from airbase 23, taken by Germany, to 121, taken in the same hour, and
  fell back again the next; it kept neither. The air system does as its rule says; the line was the
  checker's.
- **Evidence.** HEAD: 5591 (heroes, 170 days) 1 broken, 3373 random (heroes, 610 days) 2. With the fix,
  20 years with heroes, air rules: 0 broken on 3373 random, 5591, 1009, 2207, 3739, 7019, 4637.
  `carrierWingsMove1938.test.ts` 2 of 2, both red without the fix; `worldInvariantsAir.test.ts` adds
  5591 with heroes. Seed 99's pin unchanged.

### ADR-817 · 2026-11-03 · accepted — A hero fold is one nation's, and its round outlives the panel (ROADMAP R14, R30-B1)

- **Context.** Critic run 30, seed 5521's start view on a phone: the panel the first tap on a
  folded hero counter opens covers the counter, and closing it started the fold's round at its lead
  again, so HMS Hood, TOG II and Char 2C were never opened. A fold also took another nation's hero
  (Hood in "Sovetsky Soyuz +1", under the Soviet flag ~2,900 km from itself), and a "+1" was cut by
  the screen's edge.
- **Decision.** A hero with no free step (its place, one height down, one up) folds only into a
  hero counter of its own nation; with none, it is drawn at the step of the three that covers the
  least of the others. `formationPick` keeps the last clicked fold and the place in its round, so
  a tap after the panel is closed opens the next hero. A hero counter whose place is in the view is
  drawn whole in it.
- **Trade.** Where Europe is crowded at the world's zoom, counters of two nations now overlap a
  little (on 5521, TOG II over the top of "Bismarck"), where before one was hidden under the other's
  flag. Every name reads and every hero is reached.
- **Evidence.** `heroes1938.spec.ts` "ROADMAP R14", desk 1600 × 900 by mouse and phone 390 × 844 by
  touch: no fold of two nations, none cut, each hero of a counter the map takes opened by taps on
  it. Red on HEAD (folds of two nations: "Sovetsky Soyuz +1", "Bismarck +2", "Maus +2"), and with
  only the layout fixed (tap 2 on "Richelieu +1" opened Richelieu again). R8's test still green.
  Shots: `docs/evidence/R14/`.

### ADR-816 · 2026-11-03 · accepted — A sea hero comes back only on its start's basin (ROADMAP R13, R30-B2)

- **Context.** Critic run 30: R10's fallback (ADR-813, the held port nearest the start) took ports
  on cut-off water. Sovetsky Soyuz came back at Baku, Atyrau or Makhachkala (the Caspian) or at
  Petrozavodsk (Lake Onega) and stayed there to the run's end: 11,259 days in 4 of 13 seeds.
- **Decision.** A sea hero's return port must have water of the lane graph (`portSeaOf`; a lake's
  port has none) in the basin of its start (`heroBasin`: the basin of the zone at a place, 0 off
  every zone). With no such port held it waits, and its row says "waits for a port on its sea".
- **Checker.** The heroes rules add: a sea hero on water is in its start's basin. On land it is on
  a passage (Suez is drawn over land cells) and is not judged.
- **Evidence.** The rule on HEAD's return (the filter off), 4 critic seeds × 20 years, heroes on:
  red on 4637 (Soviet hero in the Caspian, day 2640; French on a lake, day 6048), 7603 (Caspian,
  day 4399), 4111 (lake, day 7045); 9001 green. With the fix: 0 broken on all four.
  `heroes.test.ts` 17 of 17 (1 new, red with the filter off). Heroes off: no change, seed 99's pin
  as it was.

### ADR-815 · 2026-11-03 · accepted — A hero's loss and return are rows of the history (ROADMAP R12, R29-N1)

- **Context.** Critic run 29: a hero lost or back was told nowhere but its Overview row: no ticker
  row, no History row or kind.
- **Decision.** Two event kinds, `HeroLost` and `HeroReturned` (a = its nation, b = its roster
  row, x, y = its place), kept in the history log and told in the ticker: "Germany lost Bismarck
  near Kiel", "Bismarck is back with Germany near Bremerhaven", each with Go to and a History
  kind. A hero gone with its nation's death has no row: the death tells it.
- **Why the log.** The ticker and History both read it (PLAN 3.12c); its rows are state, saved
  and hashed, and come only with the heroes on: seed 99's pin (heroes off) is unchanged.
- **Decisions checked (ADR-803).** PLAN 3.12c (the ticker's major events): a hero's loss is one,
  as a capital's. `heroes.test.ts` 16 of 16 (1 new), `heroesRead1938.spec.ts` 6 of 6 (1 new).

### ADR-814 · 2026-11-03 · accepted — A hero reads its health; the graph zooms; the bar fits 1024 px (ROADMAP R11)

- **Context.** Critic run 29 put `mapVisuals` and `uiUxPolish` at 6 (bar 7): a hero's men stay
  whole while it is hurt (ADR-787), so its formation panel said "Men 2,200 of 2,200" at 35 % and its
  T1 marker read "6" for the Maus; the heroes option explained itself on hover only; the relations
  graph said "X is at war beside X" for a side's leader or a lone nation, could not be read on a
  phone, and its button made the bottom bar wrap at 1024 px.
- **Decision.** The snapshot carries a hero's health (`SnapshotFormations.health`, percent;
  `NO_HEALTH` for any other formation) and the formation detail its `health`: the panel shows a
  Health row with a bar above the men, a hero's T1 marker its health as its number and bar, its T2
  tag its health beside its name. The new-game form shows the option's hint as a line of text. A
  war line names its side: beside its leader, leading it with whom, or alone on it. The graph
  zooms (wheel, pinch, buttons) and pans (drag) up to 6×, naming every nation from 2×. Between 601
  and 1,180 px the bar's buttons are closer and narrower.
- **Why a column, not the men.** A hero's men are its whole crew (ADR-787: no refill, a heal);
  health is what its loss turns on. A byte a formation is the snapshot's smallest column.
- **Decisions checked (ADR-803).** ADR-787 (a hero's men stay whole): kept, shown beside its
  health. ADR-806 (the graph): its layout and kinds unchanged. `heroesRead1938.spec.ts` 5 of 5,
  `heroes1938.spec.ts` and `relations1938.spec.ts` 8 of 8.

### ADR-813 · 2026-11-03 · accepted — A sea hero comes back at any port its nation holds (ROADMAP R10, R29-B3)

- **Context.** Critic run 29: a sea hero came back only at the water of a naval base its nation
  held (PLAN 7.184a2); the 1938 data gives France 4, Germany 2, the Soviet Union 4, and losing them
  is common. Over ten 20-year runs Richelieu waited 16,123 days past its 60, Roma 11,218, Sovetsky
  Soyuz 5,551, Bismarck 4,888; the Soviet Union of 4253 held 12 ports, none a base. The option
  says "they come back 60 days after they are lost".
- **Decision.** With no naval base held, at the water of the port it holds nearest the hero's
  start (`returnPlace`). With no port at all it waits, and its Overview row says why: "waits for
  a port to return to", or, its nation dead, "waits for its nation's revival" (`heroWaits`). The
  checker's heroes rules (ADR-812) gain one: a row past its day, its nation living and a place
  for it, is back within the hour.
- **Why not the coast by the capital.** The ports' water is the place the navy's rules already
  know (`portWater`); a nation with none waits, and its row now says so.
- **Decisions checked (ADR-803).** PLAN 7.184a2 (back at its start, else the nearest naval base
  held): kept first; the port a fallback. `heroes.test.ts` 15 of 15 (1 new, red with bases only).
  `tools/diag/heroWaits.ts` on the critic's ten seeds × 20 years: 0 days past a return with a
  place; Richelieu's 16,123 days waiting now 542, all while France held no port; Sovetsky Soyuz 0.

### ADR-812 · 2026-11-03 · accepted — A hero is its roster nation's: it goes with its nation, not with its land (ROADMAP R9, R29-B2)

- **Context.** Critic run 29: an annexation or an integration (`annexInto`) moved every formation
  of the dead nation to the taker, heroes too, while the roster row stayed the dead nation's.
  Britain fielded Roma and P.100 (4637), the United States the Maus (7603, 1,033 days); the
  Overview listed them under no nation, and once lost they waited for a revival of a nation that
  no longer owned them. A conquest (`eliminateNation`) already destroyed a dead nation's heroes.
- **Decision.** `annexInto` hands over no hero; `eliminateNation`, which follows it on both paths,
  takes the hero with its nation, and its row waits for the revival (PLAN 7.184a2), as at a
  conquest. The checker (ADR-809) gains a heroes rule set: a hero's formation is its row's
  nation's and living, no row on two formations, a row with no hero waiting to return.
- **Why not move the row.** Each great power has its own one hero of each kind (PLAN 7.184a); a
  taker with five breaks the roster's one-a-row, the Overview's "its nation's heroes" (ADR-791)
  and the stats' rows. A revival brings its heroes back with it.
- **Decisions checked (ADR-803).** ADR-181 (an annexation's formations go to the annexer): kept for
  all but heroes. PLAN 7.184a2 (a dead nation's heroes wait for its revival): now on every death.
  `heroes.test.ts` 14 of 14 (2 new, red before: "Roma not handed to Britain"). The checker's
  heroes rules over 20 years: red on the old rule on 4637 (day 1591, Italy's hero Britain's) and
  7603 (day 6044, Germany's the United States'); 0 broken on the critic's ten seeds after.

### ADR-811 · 2026-11-03 · accepted — Heroes' counters at T0 stay at their place; crowded ones fold (ROADMAP R8, R29-B1)

- **Context.** Critic run 29: at the world's zoom, the view a heroes game opens on, a hero counter
  that would cover another's stepped down as many times as it took (PLAN 7.184b3). Europe's ten
  cascaded into Africa (seed 5521: P.100 Ercole drawn 5,009 km from itself), and a click on one
  opened the nation under it: the pick never looked at the hero counters.
- **Decision.** A hero counter that would cover another steps one height down, else one up; else
  it is folded into the hero counter it covers, which reads "Char 2C +2". A click on a hero counter
  (the topmost under it) opens its first hero; a click again opens the next, round to the first,
  as a T1 marker's stack does (PLAN 7.4f20). Heroes are still never folded into a nation's counter.
- **Why fold, not hide the name.** Every hero stays on the map and in reach of a click; the "+n"
  reads as a nation counter's does (PLAN 1.45b). At closer zooms (5,000 m/px and nearer) they no
  longer crowd and each is its own, as before (PLAN 7.184b3's test unchanged).
- **Decisions checked (ADR-803).** PLAN 7.184b3 (each its own counter, never folded into its
  nation's): kept but for heroes that cannot find room within a step, which fold among themselves.
  `heroes1938.spec.ts` 6 of 6 (R8's two red before: 8 counters drawn more than a step off).

### ADR-810 · 2026-11-03 · accepted — A realm has one head: no puppet of a puppet (ROADMAP R4e)

- **Context.** The bonds' checker (ADR-809) on its first runs: a puppet of a puppet on 1009 (day
  235: Turkey, Bulgaria's overlord, made a Soviet puppet), 2207, 3739 and the random world 11.
  The scenario's schema refuses one (ADR-148), and the game made one: `makePuppet` left the
  subject's puppets under it and took a puppet as an overlord; `annexNation` handed the annexed
  nation's puppets to an annexer that was a puppet itself.
- **Decision.** A bond is made to the head of the overlord's realm (its overlord, if it has one),
  and the subject's own puppets pass to that head with it, leaving the wars they fought against
  its realm (PLAN 3.8d), as an annexation's do (no row of their own, as there). An annexation hands
  the target's puppets to the head of the annexer's realm.
- **Why the head, not a refusal.** A puppet's victory then still has its peace terms; a refusal
  left the beaten nation free at a crushing peace. The head is who the bond serves: the tribute and
  integration go there already through the realm's wars.
- **Decisions checked (ADR-803).** ADR-148 (a dead nation is nobody's puppet; the schema refuses a
  chain): now held in play. ADR-181 (an annexation's puppets go with it): kept, to the head.
  PLAN 3.8d (a new puppet leaves the wars against its realm): applied to the handed puppets too.
  `puppets.test.ts` 18 of 18 (3 new, red before), `npm test` 2086 of 2086, seed 99's pin unchanged.

### ADR-809 · 2026-11-03 · accepted — One checker for the other systems' rules, a rule set a system (ROADMAP R4)

- **Context.** ADR-804: a feature's rules go to a checker run on several seeds, as the rules of war
  and peace do (ADR-803). Only war and peace had one.
- **Decision.** `tests/helpers/worldInvariants.ts` steps one run hour by hour and checks every rule
  set at once (`economy`, then the navy, air, nukes and the bonds, ROADMAP R4b–e), as
  `diploInvariants.ts` does; the same line kinds kept once a case. It runs in the unit suite (180
  days, four 1938 seeds and four random worlds, a file a rule set), by hand
  (`tools/diag/worldInvariants.ts <seed> [days]`), and every night on new seeds for two years (the
  `systems` job). A rule is a statement of the code as it should be, read from the system's own
  comment and SPEC; each is shown red on a patched rule before it is trusted.
- **The economy (R4a).** Gold rises only at a month's start, at a founding or return, or at a
  collapse or default (debts void, PLAN 1.24); at a month's start by no more than the month's gross
  income and the tribute owed by its puppets; a nation bankrupt after a month's start has each
  formation on land lose DESERTION of its elements' units (the units less their carried damage: a
  part of a unit is carried, so whole units lag). A deep debt set at the start has the AI disband
  the whole army in an hour, so the bankrupt case is a debt just past the line (Poland, 800).
- **Found.** A default with nothing to fragment voids the debt with no row (ROADMAP R7).
- **The navy (R4b).** A fleet not under way stands on water (a passage's hours are drawn over its
  land); a formation aboard rides a fleet of its own nation and stands where it stands; when its
  transports are sunk (`destroyFormation` marks it `fleet` −1) it is lost by the next hour, when the
  amphibious system runs; no fleet is a dead nation's. The roadmap's "a fleet in its own or a
  partner's port" is not a rule of the game (a fleet stands at an enemy port to blockade it,
  PLAN 7.35): replaced by these.
- **Air (R4c).** Every wing has a base: an airbase its side holds, or a fleet of its nation's;
  one lost (taken, its carrier sunk) is left or lost with it by the next hour, at the air system's
  hour. A wing not ferrying stands at its base: a carrier's at its fleet as the air system left it,
  and a fleet in a sea battle (this hour or the last, when it ended) moves after it. A sortie
  flies to a place within the wing's range of where it took off; an airbase wing's mission is
  within its range. A carrier wing's mission may lie beyond its range while the fleet has sailed
  off: the scheduler waits ("its carrier sailed off"), so the rule is the sortie's.
- **Nukes (R4d).** A launch needs nukes allowed, a warhead the hour before and a means (a strategic
  bomber of its nation's at its airbase with the target in range; or missiles known and the target
  within MISSILE_KM); its yield is at most what the nation builds; launches are counted by their
  rows, as a missile may burst in the hour it rose; every launch that ends is told as a burst or
  an interception, and none is told without one; a stockpile grows only by one built at the day's
  pass (what was paid toward it starts anew), to WARHEAD_MAX, and is no dead nation's after it.
- **The bonds (R4e).** As ADR-148 and the scenario's schema have them: an overlord is a living
  nation other than its puppet and no puppet itself; a dead nation has none; a puppet is never at
  war with its overlord; autonomy, loyalty, integration and unity within 0..100; an alliance has
  two living members or more and its leader among them, and a nation is in one at most; a
  guarantee binds two living nations at peace with each other. The roadmap's "no alliance with an
  overlord" is no rule of the game (1938's data puts Tannu Tuva in the Soviet alliance).

### ADR-808 · 2026-11-03 · accepted — A nation called beside one it is at war with stays out (ROADMAP R3, R27-N2)

- **Context.** Critic runs 27–28 (R27-N2): a bonded Force war "calls a nation in beside its enemy"
  (1777: 3 cases; 8209: 7 pairs), and the nightly's checker on new seed 1009 (run 41624512914):
  a day after Greece's Force war on Turkey, Italy's AI declared on Turkey, and Czechoslovakia, at
  war with Turkey and Iran, was called to their side as Turkey's guarantor. The Force war only made
  the state; the hole was `declareWar`'s call: a nation called to a side was judged against the
  other side (ADR-230, ADR-797, R25-B1) and never against its own.
- **Decision.** In each of the call's three steps, a called nation stays out (with its puppets) when
  it is at war with a nation already standing on the side it is called to. As with the other
  checks, of two at war the one called first fights; the leaders, and the puppet a declaration
  names, always stand.
- **Evidence.** The checker (`tools/diag/diploInvariants.ts`, rule `realm`): at the critic's commit
  73c531b6, 1777 to day 351 with every pair tried on days 60, 200, 350: **21 broken → 0** with the
  fix patched in; 8209 (random, heroes) 0 either way. On HEAD: 1009 (the nightly's) 2 → 0; 1777 and
  1009 every pair to day 351: 0. `tests/unit/calledBesideFoe.test.ts` red before, green after.
- **Decisions checked (ADR-803).** ADR-230 (one at war with the enemy stays out), ADR-797 (pledges),
  R25-B1 (one fighting beside the enemy stays out), ADR-184 (`alone` calls nobody): the change only
  keeps nations out, and they are held by `realmWars.test.ts`, `diploInvariants*.test.ts` and the
  whole suite, green. Seed 99's pin is unchanged.

### ADR-807 · 2026-11-03 · accepted — A beaten overlord's great subjects turn on it; a rising leaves the shared alliance (ROADMAP R2)

- **Context.** Critic run 28, non-blocking 1: in 3 seeds × 30 years no AI puppet rose. Loyalty
  relaxes toward 40 + 0.6 × autonomy, 25 lower while the overlord is losing (ADR-31); at autonomy
  ≥ 10, the voice a rising needs, that target is never under 21, and the line is 20. The war of
  independence happened only by God's hand.
- **Decision.**
  - While the overlord is losing a war (its side's score ≤ −30), the target falls by a further
    `SIZE_PENALTY` (25) × min(1, the puppet's gross income ÷ its overlord's). A beaten master is
    turned on by the subjects as rich as itself; a poor one is held. At peace, and at war but not
    losing, the target is ADR-31's alone: the loyalty the panel shows does not move with no war to
    explain it. Income, as tribute reads it: land made the great colonies (the Congo, French West
    Africa) larger than their metropoles at once, and the men under arms read 0 for most colonies.
    The share is capped at 1, so in effect the term is "a subject as great as its master".
  - A puppet that rises and shares an alliance with its overlord's realm (Tannu Tuva in the Soviet
    one) leaves it first (`AllianceLeft`). Before, the war was refused as between allies
    (`WarRejected`): the rising only freed it. Found by the checker's new rule.
  - No shock to loyalty on a lost peace: a replay of 30 such drops counted 500–1,200 wars ended on
    the losing side a seed (white peaces among them), and every variant made a wave.
- **Why these numbers.** `tools/diag/puppetLoyalty.ts`, 3 seeds (7019, 3163, 1777) × 30 years
  each, the risings (`PuppetRevolt`) against the puppets made (`PuppetCreated`); bar ≥ 1 rising
  on 2 of 3 seeds, at most 1 in 10:
  - 35: 11 / 87, 5 / 64, 4 / 97 (7019 over); 30: 10 / 75, 5 / 82, 7 / 114 (7019 over);
  - **25: 3 / 81, 2 / 72, 5 / 84**; 20: 1 / 85, 0 / 76, 3 / 74 (one seed with none).
  At 25 a rising needs about autonomy ≤ 46 and a long losing war: a peace's puppet (autonomy 30,
  +0.25 a month) can rise in its first five years or so, which keeps the risings few.
  Of the 10 risings at 25, 7 are 1938's colonial bonds (the Dutch East Indies, French West and
  Equatorial Africa, the Belgian Congo) and 3 puppets made in play (Italy and French West Africa
  under Nationalist Spain, Poland under China; seed 1777).
- **Decisions checked (ADR-803).** ADR-31 (loyalty rises with autonomy; revolts need a push): kept,
  the push is a losing overlord as before, now with a great subject; held by `puppets.test.ts`
  "no revolt or release in the first months of 1938". ADR-184 (a war of independence is the two
  realms'): kept, the rising still declares `alone`, and leaving the alliance is what lets it;
  held by `realmWars.test.ts` and `rebelWars.test.ts`. R26-B1 / PLAN 7.191 (the rebel leaves the
  wars beside its overlord first): unchanged, held by the checker's revolt probes.
- **Consequences.** The checker (`tests/helpers/diploInvariants.ts`) has a rule `rise`: a puppet
  rises only at a month's start, with a voice and loyalty under 20 the hour before, and is then at
  war with its old overlord; every puppet so placed at a month's start rises, is freed or ends. It
  was red on two patched rules (a rising at loyalty under 60; none at all) and green on its seeds.
  SPEC § puppets, step 5. The tick cost is one division a puppet a month.
  Seed 99's pin after one year: a7946f81 → 614c24dd.

### ADR-806 · 2026-11-03 · accepted — The relations graph: what it draws and from what (ROADMAP R1, the user's feature)

- **Context.** The user asked for a visual graph of every war, alliance, guarantee, puppet bond and
  truce (2026-11-03). The map modes colour the land by one relation at a time, around one selected
  nation; nothing shows the whole web at once.
- **Decision.**
  - A panel of its own ("Relations", a bottom-bar button beside Statistics and History, closed by
    the others as they are). It reads only the statistics message (`nations`, `wars`); it computes
    no relation of its own, so it can never disagree with the nation panel.
  - Nodes: each living nation with a tie, its flag in a disc sized by the square root of its land
    share; nations with no tie are left out, and counted in the footer. Each war is a small hub (⚔)
    with an edge to each member, red for the attackers and orange for the defenders: a war of 7 on
    3 is 10 lines, not 21, and a nation in two wars touches two hubs.
  - Edges: an alliance is a star from its leader (`alliance.members[0]`) to each member; a
    guarantee is directed, guarantor → target; a puppet bond is directed, overlord → puppet; a
    truce joins its two nations, dashed. Each kind has its colour and can be switched off.
  - The layout is a force layout with no random numbers: a new node starts at its neighbours'
    centre (else at a place hashed from its id), and each update starts from the last positions,
    so the same world draws the same graph and a change moves it a little.
  - A click on a node selects that nation (as the ranking does); a click on an edge says what it is
    in the footer ("Germany guarantees Poland"), which works on touch too.
  - The code lives in `src/ui/` (`relationGraph.ts`, `relationLayout.ts`, `RelationsPanel.tsx`):
    it is the page's alone, and a file in `src/shared/` would change the checkpoints' key and the
    sweep's inputs for nothing.
- **Consequences.** A unit test compares the graph built from the worker's own statistics message
  with the relations read from the world directly (`wars.list`, `overlord`, `allianceOf`,
  `guarantees`, `truces`), on three seeds and three days: no relation missing on either side.
  No sim change; seed 99's pin is unchanged.

### ADR-805 · 2026-11-03 · accepted (the user's decision) — after the release: the loop's machinery retired; our own goals over AoC's; a roadmap, CI and a changelog; the relations graph first

- **Context.** `release-2026-11-03` met the DONE CONDITION (critic run 28 full and clean, check:review, soak, sweep,
  bench). The loop's machinery was built to reach that line:
  - the parity score was 48.1 % with 0 rows verified, and could not move: a row is verified only with a dated
    observation of AoC itself, and `reference/NOTES.md` was never provided;
  - PROGRESS.md (1.9 MB) and DECISIONS.md (2.0 MB) are searched, never read;
  - SPEC.md (290 KB) had become a design log;
  - the gate, `critic:due` and `plan:archive` read PLAN's phase ticks, and every phase is done;
  - the game has its own direction (semantic zoom, countryballs, heroes, the nuclear AI, the drawn diplomacy). The
    critic's "what AoC does better" lines and design objections no longer lead to work.
  - 12 GB of probe output sat untracked in `.cache/` and `critic/`.
- **Decision.** All of these, one commit each:
  1. **Cleanup.** The probe output in `.cache/` (kept: `data`, `checkpoints`, `gate`, `sweep`, `soak`, `runs`) and
     `critic/`'s screenshots, builds and saved states are deleted. Tracked `critic/` keeps the last report and the
     files it and its scripts cite; earlier runs leave the tree (git history keeps them).
  2. **Parity retired.** `docs/PARITY.md` is frozen at 48.1 % as a record. `npm run parity`, its stage in the gate
     and `check:full`, and its tests are removed. The tests go with the feature they test; nothing is weakened to
     pass.
  3. **The plan retired.** PLAN.md and `docs/PLAN_DONE.md` are frozen as a record. `ROADMAP.md` holds what is to do.
     `critic:due`, `plan:archive` and the gate's phase-review trigger are removed. The whole unit and e2e suites run
     in `check:full` and `check:review`, before a release.
  4. **The logs archived by month** under `docs/history/`; PROGRESS.md and DECISIONS.md keep the current month.
  5. **PROMPT.md, CLAUDE.md and CRITIC_PROMPT.md rewritten** for work after the release:
     - "continue" is the next unchecked ROADMAP item;
     - kept: the hard rules, the gate, ADR-803's rule check and checker, ADR-804's batch → critic → release tag;
     - dropped: the DONE CONDITION and its string, the phases, step 10's opening list.
     The critic scores against our own goals (fun to watch, readable, stable, fast, rules that agree), with AoC a
     source of ideas only. The JSON keeps its shape.
  6. **CI:** a nightly GitHub Actions run (typecheck, lint, unit, the ten-year tests, a soak, the war-and-peace
     checker on new seeds, a small sweep), a weekly full sweep. No e2e or bench there: no GPU.
  7. **CHANGELOG.md**, one entry a release tag.
  8. **SPEC.md** becomes a description of the game as it is: §1–§2 and a contents list now, the rest a ROADMAP item.
  9. **Checkers for every system** (economy, navy, air, nukes, bonds), as `diploInvariants` checks war and peace:
     ROADMAP items.
  10. **The relations graph** (the user's feature, 2026-11-03): a view of every war, alliance, guarantee, puppet bond
      and truce, the first item of the next batch.
- **Consequences.** The gate is shorter (no parity stage). A release still needs `check:review`, the soak, the
  sweep (borders moving), the bench and a clean full critic run. No sim change; seed 99's pin is unchanged.

### ADR-804 · 2026-11-02 · accepted (the user's decision) — release before new features; focused critic runs; the checker over the options; less to read each iteration

- **Context.** Across critic runs 18–26 every report had 0 or 1 blocking issue, almost always in the newest feature:
  R19 the map-mode menu, R20 the formation panel, R22 the countryballs' helmet, R24 random diplomacy. Runs 21 and 23
  were clean. After run 23 only the T0 frame rate (7.181) was left, then random diplomacy, the heroes and the camera
  follow came before a release. A critic run takes about 1 h 45 m (runs 25, 26) and re-scores all 14 dimensions,
  even on a round that fixes one. ADR-803's checker ran only the default options. An iteration's read list (SPEC
  290 KB, BLOCKERS 187 KB, DECISIONS 2.0 MB, PARITY 190 KB) was over 4 MB.
- **Decision.**
  - PROMPT step 2a, after a clean full report:
    - the next iteration runs the DONE CONDITION's other checks. When they hold, it tags `release-<YYYY-MM-DD>`
      and pushes the tag;
    - a feature the user asks for while PLAN 7.5 is open goes in a batch after 7.5, unless the user says otherwise;
    - after the release a batch is built whole, with one critic run on it. Each feature adds its rules to a checker,
      as `diploInvariants` does for war and peace.
  - `CRITIC_PROMPT.md`: the critic decides from git whether its run is **focused**. It is focused when the last
    report has a blocking issue or a score under its bar, every commit since is a task that report filed or changes
    nothing under `src/`, `data/` or `public/`, and the last three runs were not all focused. A focused run re-runs
    the last report's cases, and scores afresh the dimensions that report had under its bar or blocked on, plus
    those the changed files touch. It carries the other scores, marked "carried". The JSON gets `mode`. The DONE
    CONDITION needs a full run.
  - `tests/unit/diploInvariantsOptions.test.ts`: the checker with the heroes on (8821, random diplomacy) and on
    the random world of 60 (seed 7). Both are green on HEAD (44 s and 24 s); the heroes with scenario diplomacy on
    7019 are green too (41 s).
  - The read list (CLAUDE.md, PROMPT step 1):
    - SPEC §1, §2 and the sections the task touches;
    - BLOCKERS' open entries and watch list, with the 108 resolved sections (and the two waits on done PLAN
      7.90–7.92) moved to `docs/BLOCKERS_DONE.md`, which is searched (BLOCKERS.md 187 → 57 KB);
    - DECISIONS' last day of ADRs, the rest searched;
    - PARITY's rows the task touches.
- **Consequences.**
  - A fix round costs a focused run, likely shorter. The cost is less free exploration of the dimensions it
    carries; every fourth run at most is full anyway.
  - The user's feature requests near a release wait for it, unless the user puts them first.
  - No sim change; seed 99's pin is unchanged.

### ADR-803 · 2026-11-02 · accepted (the user's decision) — the critic loop: the rules of war and peace checked together; the last report's probes before a run; no check:review

- **Context.** Critic runs 24–26 each scored diplomacy 6 with one blocking issue, and each was made by the fix before:
  - R24-B1 came from the random diplomacy option (7.182), added after run 23 was clean;
  - R25-B1 came from 7.188's leave rule;
  - R26-B1 came from 7.189's `Beside` refusal, which was run 25's own "Fix" line and went against ADR-780.

  No test checked the rules together, so each regression cost a lap of about 2–4 hours (fix, `check:review` about an
  hour, the critic). Before each of these runs, `check:review` found nothing the critic then blocked on.
- **Decision.**
  - `tests/helpers/diploInvariants.ts` checks four rules on a 1938 run:
    - no land held at peace;
    - no exit from a war, and no war over, without a row (a peace, `WarEnded`, `WarLeft`, a death);
    - no war inside a realm or alliance, and no nation at war with one it fights beside;
    - a bonded puppet's or ally's Force war, or a puppet's revolt, never refused for `Beside`.

    It checks them every day of half a year. On days 30, 90 and 150, on copies of the world, it also checks pairs
    that fight beside each other, bonded pairs and random pairs going to war by `declareWar` and by `forceWar`, and
    puppets revolting. `tests/unit/diploInvariants{Scenario,Random}.test.ts` cover 7019 and 2207 (scenario), 8821
    and 3739 (random); `tools/diag/diploInvariants.ts` runs one case.
  - PROMPT step 2a: no `npm run check:review` before a critic run (this replaces ADR-554's run). Instead, the last
    report's probes in `critic/scripts/` and the checker are re-run on HEAD. A probe that still shows its defect
    reopens its task, and the critic waits.
  - PROMPT, KEEPING ITERATIONS SHORT:
    - a sim rule change first lists the accepted ADRs and SPEC lines it could contradict, each with a test, or the
      conflict goes to the user. A critic's "Fix" line is checked the same way;
    - a war-and-peace finding the checker misses adds its rule to the checker.
- **Consequences.**
  - On HEAD 60d1ef05 the checker finds 0 broken on all four cases (33–47 s each; 81 s for both files under vitest).
  - On the commits the critic read it is red:
    - 82d428c1 (8821 random): `held: JAP on CHI, 1345 cells at peace` on day 0 (R24-B1);
    - e4386478 (7019 scenario, 8821 random): 23 and 26 exits with no row (R25-B1);
    - 33c84306 (7019 scenario): a bonded Force war and a revolt refused for `Beside` (R26-B1).
  - Nothing runs the whole unit and e2e suites before a critic run now. A break in a test outside the changed
    files' imports is found by `npm run check:full` at the DONE CONDITION, or by the critic.
  - No sim change; seed 99's pin is unchanged.

### ADR-802 · 2026-11-02 · accepted — PLAN 7.192: a war left and a revolt in the ticker; the bond and the shared war; the alliance greyed

- **Context.** Critic run 26 kept diplomacy at 6. Its non-blocking 1–3:
  - the ticker told neither a war left nor a revolt;
  - "Fights beside you" hid "Allied" and "Your overlord";
  - "Propose alliance" was live where the sim turns it down (one's own overlord, a nation in an alliance).
- **Decision.**
  - `WarLeft` and `PuppetRevolt` are ticker kinds, with cues: a war left the peace cue, a revolt the war cue. This
    amends ADR-800 for `WarLeft`. `GuaranteeLapsed` stays a history row only.
  - A bond's standing with a nation it fights beside carries `beside` and reads "<bond> · fights beside you".
  - `allyWhy` mirrors `proposeAlliance`. The menu and the Actions tab grey "Propose alliance", with its reason as
    the title.
  - The sim refuses a puppet's alliance with its own overlord.
- **Consequences.**
  - On 72 pairs at the 1938 start, `allyWhy` agrees with the sim on every one.
  - Unit tests are red on 33c84306, and an e2e test (`bondsMenu1938`) covers the menu and the ticker
    (`docs/evidence/7.192/at-run.md`).
  - Seed 99's pin is unchanged.

### ADR-801 · 2026-11-02 · accepted — PLAN 7.191 (R26-B1): a bond's break wins over `Beside`; a rebel leaves its overlord's wars

- **Context.** Critic run 26's blocking issue: ADR-799's `Refusal.Beside` was checked before the bonds and `forceWar`
  took it as hard. A puppet joins every war of its overlord, so a puppet's Force war on its overlord was refused on
  59–78 % of puppet-days and an ally's on its ally on 52–68 % of allied-pair days. God's revolt freed the rebel and its
  war was refused, so it stood free beside its old overlord. Both contradict ADR-780 and SPEC's war of independence.
- **Decision.**
  - `whyNotWarOn` names a bond first and `Beside` only for a partner with none.
  - `forceWar` with a bond to the defender or its overlord first leaves, with its puppets, every war one of them
    fights on its side (`leaveWarsBeside`, the same rows and land as `leaveBondedWars`: `WarLeft`, or `WarEnded`).
    It then breaks the bond and declares. The new war is the cost of the exit.
  - A partner with no bond (Poland on France) is refused as ADR-799 has it, before any truce is broken.
  - `puppetSystem`'s rebel leaves the wars it fought beside its overlord in, then declares its war of independence.
  - The menus' standing names the bond ("Allied", "Your overlord"), and Force war is live there. "Fights beside you"
    is left for a partner with no bond.
- **Consequences.**
  - On the critic's 4 seeds (7019, 2207, 5113, 9241), every 30 days to day 365: 0 Force wars refused for `Beside`
    (the critic measured 52–78 % on 33c84306), and no nation stood on one side with its enemy after.
    - Puppet on overlord: 1587 of 1598 declared.
    - Ally on ally: 1512 of 1548 declared.
    - On 5113, the rest were refused for `Overrun`. Source: `tools/diag/bondExit.ts`, `docs/evidence/7.191/at-run.md`.
  - A rebel freed with a truce or an alliance with its overlord is still refused, as before PLAN 7.189. The revolt
    breaks neither.
  - Poland on France: refused, the old war on (as ADR-799). Germany on Italy (COBEL): Germany leaves the alliance and
    the Polish war and fights Italy.
  - ADR-799's tests of the bonded cases now read the bond's break (Albania freed, fighting Italy, out of the Japanese
    war; Germany out of the alliance).
  - Seed 99's pin is unchanged (a7946f81).

### ADR-800 · 2026-11-02 · accepted — PLAN 7.190: the pledges in the nation panel; a lapse and a war left are rows

- **Context.** Critic run 25 kept diplomacy at 6 with R25-B1 (7.189) and its non-blocking 1 and 9: guarantees were
  shown nowhere, so a pledge, its binding (ADR-797) and its lapse were invisible; a war a nation left had no row.
- **Decision.** The statistics message carries each nation's `guarantees` (the nations it guarantees) and `guarantors`;
  the panel's overview lists them as "Guarantees" and "Guaranteed by", nation chips. `GuaranteeLapsed` (a guarantor, b
  target) is logged after a declaration that puts the two on opposite sides; `WarLeft` (a the nation, b the enemy's
  leader) when a bond takes a nation out of a war that goes on (`leaveBondedWars`; one that ends so stays
  `WarEnded`). Both are history rows, not the ticker's (as an alliance's changes; the declaration is the ticker's).
  A pledge of a nation that dies goes with it, told by the death.
- **Consequences.** On 3739 day 0 the 8 guarantees of the start in both panels (an e2e test, red on e4386478); 1 of 1
  lapse with its row on 1522–1531 to day 60 (`tools/diag/pledgeRows.ts`, `docs/evidence/7.190/at-run.md`). Seed 99's
  pin unchanged.

### ADR-799 · 2026-11-02 · accepted — PLAN 7.189 (R25-B1): a war on one's partner in a war is refused; 7.188's leave rule goes

- **Context.** Critic run 25's blocking issue: PLAN 7.188 (ADR-797) took an attacker that stood on one side with a
  defender in an older war out of that war. A player whose peace was refused declared on its partner (Poland on France)
  and was out of the war at once, the land held both ways back, no peace, no truce, no row; God's Force war of Germany
  on Italy the same (3 of 3 seeds each).
- **Decision.** `whyNotWar` refuses a war between two that fight on one side in a war (`Refusal.Beside`, before the
  bonds, so `forceWar` breaks nothing of it); a nation called into a war against one it fights beside stays out, as
  one with a bond does, and fights on in the old. The leave in `declareWar` is gone (`leaveBondedWars` as before
  7.188). The menus read the standing "Fights beside you" and grey the war, the refusal its title.
- **Consequences.** On 7019, 2531, 8467, Poland on France (day 45) and Germany on Italy (day 61): 0 of 6 leave
  (e4386478: 6 of 6, the land to 0; `tools/diag/partnerExit.ts`, `docs/evidence/7.189/at-run.md`). 7.188's freed
  Albania: its war on Italy, beside it against Japan, is refused, and it stays Italy's puppet on one side of each
  war (its test reads the refusal for the leave; no nation on one side with its enemy, as before). The forceWar
  test's overrun case moved to a world with no war of Germany's (Italy is beside it in the Polish war). Seed 99's
  pin unchanged (a7946f81).

### ADR-798 · 2026-11-02 · accepted (option a, the user's decision of 2026-11-02) — The ten-year runs' fleet guard after PLAN 7.188: seed 1 stands 24 of 197 after one year, floor 25 (ADR-633)

- **Context** (`npm run check:review` before critic run 25, PLAN 7.5): `tests/sweep/aiSweep1` red twice, "fleets
  of the start that stand after one year: expected 24 to be greater than or equal to 25". On the review of 82d428c1:
  54, 56, 64 on seeds 1–3; on 5d7b214b: 24, 70, 71.
- **Measured** (`tools/diag/fleetYear.ts`, HEAD against ac449e8d, seed 1): standing 81 / 78 / 62 / 35 / 24 on days
  30, 60, 90, 120, 365 (before 81 / 78 / 75 / 74 / 54). The wars declared are the same to day 158. 7.188 keeps
  Czechoslovakia out of the Soviet war on Romania; it ends on day 64 (was 69), Romania a Soviet puppet both times.
  Before, the United States' war on Romania (declared day 59) ended with it on day 69; now it goes on, the United
  States lands (score 0 → 30 on days 95–130), and 27 of its 36 fleets at home sail on days 90–120. `makePuppet`
  takes the new puppet out of the wars against its overlord's side only, as before 7.188.
- **Options.**
  - (a) *Recommended.* The floor is a stated share: a tenth of the start's fleets stand after one year (20 of 197).
    The guard asks that the daily test (a fleet no rule should have touched is a line, unchanged) has fleets to ask;
    24 fleets for 365 days still do, and a war that sails a great power's navy is the rules' work. ADR-633 amended.
  - (b) Keep 25, and a rule: a nation made a puppet leaves the wars its overlord is not in (its diplomacy its
    overlord's). A sim change, the pin moves, every history after it with it; its own AT.
  - (c) Keep 25, and a PLAN task to read the puppet's war first (a puppet at war for months beside no overlord);
    the critic waits on that task.
- **Consequences.** (a) taken: `tests/helpers/aiSweep.ts` asks `Math.ceil(fleets.start / 10)` (20 of 197); seed 1's
  24 passes. No sim change, the pin unchanged. Critic run 25 after the review.

### ADR-797 · 2026-11-02 · accepted — PLAN 7.188: a pledge binds as a bond; nobody fights beside its enemy; the pin moves

- **Context.** Critic run 24 scored diplomacy 6 (R24-B1, fixed in 7.187, and its non-blocking 1, 6, 9). (9) The
  Soviet Union declared on Romania on days 4–11 of 3 of 3 seeds and called Czechoslovakia, Romania's ally, in
  against itself while it guaranteed it, the pledge kept. (1) Albania, freed by its force war on Italy, fought
  Italy and stood with it against Japan. (6) The nation menu offered "Propose alliance" (greyed) to an enemy.
- **Decision.** In `declareWar`: a nation called against one it guarantees, or one that guarantees it, stays out
  as one with a bond does; a pledge between the two sides that is left (only the leaders' can be) lapses; and an
  attacker on one side with a defender in an older war leaves that war (`leaveWarsWhere`, the way of
  `leaveBondedWars`: its puppets of that side with it, the land held back). The menu shows no "Propose alliance"
  at war (to an ally, greyed as before); the Actions tab's is greyed at war.
- **Consequences.** On 1517, 3739, 8821 and 1511–1521 (not 1517 twice) to day 30, no guarantor at war with its own
  (`tools/diag/pledgeWars.ts`, `docs/evidence/7.188/at-run.md`); the Soviet Union still goes to war on Romania on
  the same days, without Czechoslovakia. The default world changes: seed 99's pin dc41c283 → a7946f81.

### ADR-796 · 2026-11-02 · accepted (option a, the user's decision of 2026-11-02) — PLAN 7.186: the crossing by sea moved nothing; the AT missed
**Context.** The rule (uncommitted): a land hero with no way over land to its army's nearest fights goes to the nearest
on another land by sea, by a port of its land where its nation's transports wait (`orderMove`'s `byPort`, as a
player's order). AT, 1491–1500 × 3 (`docs/evidence/7.186/at-run.md`): 93 of 170 lives at or above the top-decile
regular (0.547, bar 2/3); Britain and the United States 13 of 42 (bar 1/2). HEAD on the same seeds: 113 of 195
(0.579), 20 of 55 (0.36): the crossing no better, a little worse. These seeds are harder than 7.185's (HEAD 0.579 here,
0.640 on 1481–1490). Sea: `with` 45 of 70, `ofFleet` 54 of 61. Not read: how many heroes went aboard.
**Options.** (a) Drop the crossing; close 7.186 not done, and the heroes' AI with it (7.184e's sea rule and 7.185's
`joinFights` stay; no further task) (recommended); (b) a task to read first whether a hero ever goes aboard, and why
not, before another rule; (c) commit the crossing (neutral within noise), close not done.
**Decided (a).** The crossing dropped; 7.186 closed not done, and with it the heroes' AI: a sea hero sails with its
nation's largest fleet (7.184e), a land hero joins its army's nearest fight (7.185). The sweep:quick smoke of those
rules (heroes on and off) is reported in PROGRESS.

### ADR-795 · 2026-11-02 · accepted (option a, the user's decision of 2026-11-02) — PLAN 7.185: the re-scoped AT missed by 3 points; the heroes overseas
**Context.** ADR-794 (a)'s AT on 1481–1490 × 3 (`docs/evidence/7.185/at-run.md`), with `joinFights` and its fallback to
the fights' own cells (uncommitted; the unit test red without): 110 of 172 hero lives at or above their nation's
top-decile regular, 0.640 against 2/3. By nation (pass/miss): ENG 10/20, USA 2/9, FRA 23/8, GER 12/7, ITA 24/4, JAP
22/8, SOV 17/6; without Britain and the United States 98 of 131 (0.75). Their armies fight overseas: a hero is ordered
over land only, and many of its orders are refused (Britain's TOG II on 1487: 904 refused, its army fighting on no land
of its). Sea: `with` ≥ 0.5 on 57 of 70, `ofFleet` on 49 of 59 (83 %; 7.184e 89 %, other seeds). Where a nation has few
regulars (3–7) the top decile is its best one.
**Options.** (a) Commit the rule; close 7.185 not done (0.640); a numbered task for a land hero whose army fights
overseas (by the lift, as a division of its nation is), AT the same bar on unseen seeds (recommended); (b) commit the
rule and count the AT only where the hero's army fights on the hero's own land: ticked (0.75 on the lives so counted);
(c) keep 7.185 open for the lift now; (d) drop the rule, close not done.
**Decided (a).** The rule committed (`joinFights`, `HERO_TRIES`, the fallback to the fights' cells) with its unit test;
7.185 closed not done; PLAN 7.186 for the heroes overseas, which carries the sweep:quick smoke. The pin of seed 99 is
unchanged (no hero without the option).

### ADR-794 · 2026-11-02 · accepted (option a, the user's decision of 2026-11-02) — PLAN 7.185: the AT missed; the bar is above the regulars
**Context.** 7.185's read (`docs/evidence/7.185/at-run.md`, `tools/diag/heroLandWhy.ts`): on its army's fighting days a
land hero fought on 17 %, stood on 38 % (most a week or more) and marched on 45 %; 41 % of the days out of a fight it
was over 80 cells from the nearest. The rule (uncommitted): `joinFights`, the hero ordered onto the enemy formation
nearest to its army's nearest fight, 3 tried. AT on unseen 1471–1480 × 3: land `ofArmy` 0.161 (7.184e's seeds) →
0.201, ≥ 0.5 on 1 of 70: missed. Sea `with` ≥ 0.5 on 58 of 70 (7.184e 50 of 70), `ofFleet` 50 of 58 (86 %; 7.184e 57
of 64, 89 %). Two causes (`tools/diag/heroCeiling.ts`, 1471/1474/1476 × 1): (1) the bar is above what the regulars
reach: of each nation's ordinary land formations alive the whole year, the best is in 0.29–0.72 of its army's fighting
days, the top decile 0.05–0.56, the median 0.00–0.43; the hero is at or above its nation's top decile in 13 of 30 hero
lives; (2) refused orders: where every target of the hero is refused it stands (1471 Japan's O-I: 698 refused, 0 ok,
a year still, with its army fighting on its land 311 days; 1474 Soviet T-42 372 refused, 1476 Italy's P100 282).
**Options.** (a) Re-scope the bar to the regulars: each land hero's `ofArmy` at least its nation's top-decile ordinary
formation's, on ≥ 2/3 of the hero lives, unseen seeds; keep `joinFights`; within 7.185 a rule for the refusals (a hero
whose targets are refused tries the fights its way reaches) (recommended); (b) keep 0.5 and work on the refusals
(the best regular reaches 0.5 in few nations: likely a miss again); (c) keep `joinFights`, close 7.185 not done; (d)
drop it, close not done.
**Decided (a).** The AT, counted by `tools/diag/heroCeiling.ts`: a hero life is counted with 30 or more of its army's
fighting days, of a nation with 3 or more ordinary land formations alive 90 % of those days; it passes at or above the
top-decile one's share; ≥ 2/3 of the counted lives pass, on unseen seeds 1481–1490 × 3. For the refusals: refused at
every enemy target, the hero goes to the cells of the fights themselves (over its own side's land); on 1471/1474/1476 ×
1 that brought the lives at or above the top decile from 13 of 30 to 19 of 29.

### ADR-793 · 2026-11-02 · accepted (option a, the user's decision of 2026-11-02) — PLAN 7.184e: the AT missed; which of the heroes' rules to keep
**Context.** 7.184e's rules (in the working tree, not committed): a land hero, out of the operational AI's allotment,
ordered each plan onto the attack cell of its nation's most threatened own sector (up to 3 tried for a way); a sea
hero, every day at war, sailed after its nation's largest other fleet (where it fights, sails or stands), after the
day's naval plans. Unit tests red without each. The AT's run (`docs/evidence/7.184e/at-run.md`, 1461–1470 × 3, and
HEAD on 1461–1465): land `ofArmy` 0.158 (HEAD) → 0.148, ≥ 0.5 on 0 of 34 either way (1 of 69 on ten seeds): the land
rule moves nothing; sea `with` 0.603 → 0.721 (≥ 0.5 on 21 → 25 of 35), `ofFleet` 0.662 → 0.794 (23 → 28): better, not
every hero.
**Options.** (a) Keep the sea rule, drop the land rule; 7.184e closed not done; a numbered task to find why a land hero
is in so few of its army's battles (it marches on the front's enemy cell and is rarely engaged), AT `ofArmy` ≥ 0.5 on
unseen seeds (recommended); (b) keep both (the land rule is neutral) and the task; (c) drop both, close not done.
**Decided (a).** The sea rule committed (`naval.ts`: `heroFleets`, `sailWith`, its unit test); the land rule dropped;
7.184e closed not done; PLAN 7.185 for the land hero's cause. The pin of seed 99 is unchanged (no hero without the
option).

### ADR-792 · 2026-11-02 · accepted (option a, the user's decision of 2026-11-02) — PLAN 7.184e: the AT's 30 % is out of reach at sea
**Context.** 7.184e's AT: each AI hero of a nation at war in battle on ≥ 30 % of its days at war (1461–1470 × 3
years). HEAD's read before any rule (`docs/evidence/7.184e/head-read.md`, `tools/diag/heroBattle.ts`, 1461–1465): land
heroes 0.000–0.207, sea heroes 0.000–0.123. The ceiling (the days any formation of the hero's nation in its domain is
in battle): sea 0.003–0.172 on all 35 — a navy fights on few of its days at war, so a sea hero with its largest fleet,
or with every fleet, cannot reach 0.30; land 0.261–0.903, under 0.30 for 2 of 35 (an army that never meets its enemy).
**Options.** (a) The bar against the ceiling: a land hero in battle on ≥ 50 % of the days its nation's army is (where
that army fights on ≥ 10 % of its days at war); a sea hero with its nation's largest fleet (same sea zone or within
`SORTIE_KM`) on ≥ 50 % of its days at war, and in ≥ 50 % of the sea battles of that fleet (recommended: what the task
asks the AI to do, read where it can be done); (b) keep 30 % for land heroes only (where the army's ceiling is ≥ 30 %),
drop the sea clause's figure for the fleet's company; (c) close 7.184e not done, the heroes moved by the AI as any.
**Until then.** No rule: 7.184e waits with a BLOCKERS entry.

### ADR-791 · 2026-11-01 · accepted — PLAN 7.184c: a nation's heroes in its Overview
**Decision.** `NationStat.heroes` (`HeroStat`: formation or 0, name key, sea, health, days until back), built by the
worker's stats from the roster for a nation with heroes, absent otherwise. The Overview's first block, "Heroes": a
row a hero, its name and a health bar (green over 50 %, yellow over 25 %, red) with its share, or "returns in N days"
while it is gone ("waits to return" when its hour has passed and it has no place, or its nation is dead). A living
hero's row is a button: its formation's panel opens and the camera follows it (`PlayerControl.openHero`, as a click
on it on the map, PLAN 7.183), whichever nation is played; a gone hero's row is disabled.
**Why.** The user's request (7.184): the heroes are seen and found from their nation.
**Consequences.** At the world's zoom the camera has no room to move (the view is clamped to the map): the follow
centres the hero from a nearer zoom only.

### ADR-790 · 2026-11-01 · accepted (option a, the user's decision of 2026-11-02) — PLAN 7.184b3: bench G's T0 with heroes on, 309 fps against a bar of 311
**Context.** 7.184b's AT: bench G with `heroes=on` keeps T0 over 311 fps (0.9 × fbca2cc4's 345, ADR-784) and p95 under
6.9 ms. Bench G's GPU setting, heroes off and on alternately on the same build, three pairs each (`docs/evidence/7.184b/`
`b3-bench.txt`): with the hero counters painted each frame, off 318.1, 312.1, 311.9 and on 299.2, 301.6, 294.9 (−5 %);
with each drawn once and copied (`heroPictures`), off 317.3, 314.1, 318.2 and on 307.0, 308.7, 311.9 (−2.3 %, mean
309.2). p95 4.8 ms on (bar 6.9). The world without heroes reads 316 on this machine now, 0.92 × the 345 the bar came from.
**Options.** (a) Tick 7.184b3: the bar read as heroes on ≥ 0.97 × heroes off on the same build and machine (0.977 now)
— the bar measures the heroes' cost, not the machine's day (recommended); (b) keep 311: find the last 2 % (14 more
formations in the world, the counters' extra pass) as a numbered task; (c) close 7.184b3 not done.
**Until then.** 7.184b3 stays open with a BLOCKERS entry; the drawing is committed (its own AT holds).

### ADR-789 · 2026-11-01 · accepted — PLAN 7.184b: how a hero is drawn
**Decision.** (b1) `?heroes=on` is read from the URL now (`gameUrl.ts`), the way the e2e of the drawing opens a
world with heroes; the new-game form and the settings panel stay PLAN 7.184d's. A hero's name on its tag and panel
is its name alone ("Yamato"), not its kind and number: there is one of it (`MapView.formationName`, by
`TemplateInfo.hero`).
**Why.** The drawing's AT needs heroes on a page; the URL is the game's own way to pass a new-game option.
(b2) At T2 and T3 a hero's sprite (its element, its figure; its turret and wake with it; its stand-in) is drawn
`HERO_SCALE` (2) × its kind's size, in both looks: a bit of the instance's `aState` (`HERO_BIT`, 16, above the hurt
level's two bits), which the ball shader already read and the classic shader now declares; each multiplies its
size after the clamp to the least and most px. Its tag's box and the tests' `elementBallPx` and `shipHullPx` go with it.
**Why.** Through most of T2 an element is at its least size (5 px, a tank 8, a ship its class's): a hero's size in
cells doubled would draw the same as its kind's there. No new attribute or wider stride: the state buffer is bound
for both programs.
(b3) At T0 a hero is a counter of its own (`HeroCounter`, `CounterLayer.draw`'s `heroes`): not in its nation's
clusters, never folded, `HERO_SCALE` × a counter about its place, its name where a counter has its strength (a hero's
men are its crew: "6" told nothing), drawn above the others; one that would cover another hero's steps down below it
(Japan's two, at Yokosuka and Tokyo). At T1 its marker is `HERO_SCALE` × the others' (box, ball, chip, pips, number,
badges), never in a stack, drawn above the others. A land hero's symbol is armour (`symbolOf`: a `hero_` type counts
as a tank; it had the rifle cross). A hero's counter is drawn once into a picture at its device scale and copied
each frame (`heroPictures`, as ADR-784's balls): painted anew, the 14 cost bench G's T0 5 % of its frames, cached 2.3 %
(ADR-790).
**Why.** A hero folded into its nation's counter, or the lead of a stack, would not be seen at all.
**Consequences.** `heroFormations()` on the view lists them (tests, and the parts after). A hero's ball is large
enough to show its prop (a barrel, a hull) where its kind's is not. A hero's T1 marker covers its neighbours'.

### ADR-788 · 2026-11-01 · accepted — PLAN 7.184a3: the heroes' figures; a hero's tank carries its damage
**Decision.** Every sea hero: `hard` 1,100 (a battleship of 2,000 hit points sunk in about an hour of its fire),
`hpPerUnit` 25,000; every land hero: `soft` and `hard` 3,000, `hpPerUnit` 700; their other figures as ADR-787's.
A land hero's tank takes its losses as a wound that carries (`applyLoss`), not by the draw on whole tanks of PLAN
7.23a (`combat.ts`), which ended a hero of one tank on any hit.
**Why.** The AT's cases (`tests/helpers/heroFight.ts`, seed 99, AI off): the Bismarck against one battle squadron
sinks 9 of 16 and is left at 0.68, against three it is sunk on the first day; the Maus attacked by one armoured
division puts it to flight with 35 % of its men lost and is left at 0.74, by three it is lost on the second day. One
element fires at one target an hour (sea: torpedoes, which no armour stops, are most of the fire it takes), so the
hero's weight is in its hit points and its single shot. Before (ADR-787's first figures) the Bismarck was sunk by
one squadron in a day and the Maus did ~5 % of a division's men in six days.
**Consequences.** The same figures for every hero of a domain: no hero is stronger than another. A Maus attacking
a stack meets its front formation first: it beats three divisions one behind another, one at a time.

### ADR-787 · 2026-11-01 · accepted (the user's request) — PLAN 7.184a1: heroes' data stand last; a hero is a formation of one element
**Decision.** The 14 heroes are unit types and one-element templates in `data/units/heroes.json` and
`data/templates/heroes.json`, read after every other file of their kind (`UNITS`, `TEMPLATES_1938`), so that the
indices an element and a formation are saved with stay those of every save before. `hero: true` on the unit type
makes `TemplateRule.hero`: the sim refuses such a template to `queueFormation`, `spawnFormation`, `spawnFleet` and
`spawnWing` (`NoSuch`), and the page leaves it out of the Actions tab's production, God's placing and the editor's
lists (`TemplateInfo.hero`). The roster is `data/scenarios/1938/heroes.json` (validated: a hero template of its
domain, a living nation, one of each domain a nation, a sea hero at its nation's naval base). With `heroes: 'on'`
(`GameOptions`), the Sim raises them after `applyGameOptions` (`addHeroes1938`): a sea hero at the water a fleet of
its port finds (`placeFleets`), a land hero at its capital. `World.heroRoster` (nation, template, start place) and
`World.heroes` (formation → row) are state, saved while not empty, so the hash of a world without heroes is the one
before. The economic AI lays up, disbands, folds and refills no hero (`world.heroes` guards; their upkeep is 0 too).
**Why.** The user's request. A unit of one element keeps the hero one thing on the map and in combat; ids and
indices after everything keep the option-off world and every old save bit for bit.
**Consequences.** A hero's men (`strength`) are its crew while it lives: losses are its element's `wound`, so its
health is `1 − wound` (healing, the Overview's bar). A hero's tank takes supply attrition and breaks down as any tank
with no supply. A puppet integrated by its overlord hands its formations over, a hero too. The figures are first
guesses; PLAN 7.184a3 sets them against a battle squadron and an armoured division.

### ADR-786 · 2026-11-01 · accepted (the user's request) — PLAN 7.183: the camera follows any formation clicked
**Decision.** A click on a formation the player cannot order (another nation's, or any with no nation played) opens
its panel as before and now has the camera follow it where it is drawn (`MapView.pickedPoint`, `followPicked`; the
same `shownAt` as the selection's follow), land or sea. The follow ends with a pan, or when the point is gone: its
panel closed (Escape, its button, a click on ground) or the formation gone. A click that is an order (the player's
selection marched onto an enemy's formation) keeps the selection's follow.
**Why.** The user asked for it: before, only the played nation's own selection was followed.
**Consequences.** A click on a stack of T1 markers brings the stack to the middle, so the next click to open its next
formation (ADR of PLAN 7.4f20) is where the stack now is: `stackPick1938` clicks the stack where it is drawn once
the camera has settled (its check, each member opened in turn and the lead again, unchanged).

### ADR-785 · 2026-11-01 · accepted (the user's request and decision) — PLAN 7.182: the start's alliances, guarantees and wars drawn by the seed; puppets kept
**Decision.** A new-game option "Alliances and wars" (`GameOptions.diplomacy`, `?diplo=random`, `opt-diplomacy`; i18n
key `settings.diplomacy`), offered where the scenario starts with alliances or wars (`ScenarioInfo.diplomacy`: the
1938 world; not the random or toy world, which start with none). Random: `randomDiplomacy` (src/sim/gameOptions.ts)
lets the scenario's alliances, guarantees and wars go without a trace (no alliance into `past`, so the history log
shows none dissolved) and draws as many of each from the seed. The shape is the scenario's: 7 alliances of its sizes
and unity, named "Defensive Pact", of independent nations grown from a first one through land neighbours (any
unaligned nation when none borders them), led by the largest by land; 8 guarantees, each guarantor of the larger
half of independent nations by land; 2 wars, each declared by `declareWar` (puppets, allies and guarantors called,
bonds kept out) by an independent nation at peace on an independent land neighbour at peace. The default path is
untouched (the pinned hash of seed 99 stands).
**Why.** The user asked for a start option to randomize 1938's alliances and wars. Puppets (40, mostly empires'
colonies and dominions) stay the scenario's: asked whether to reshuffle, free or keep them, the user chose keep.
A guarantor drawn from any pair gave pledges such as Guatemala's to the CCP; the larger half keeps a pledge of weight.
**Consequences.** The counts follow the scenario; a random count is a later option if wanted. A war declared at the
start calls the attacker's realm and allies as any war: Britain's draws its empire in. Each drawn war is a
`WarDeclared` row of the history log on the first day (the scenario's own wars have none): the player is told of
wars that no history book gives; the drawn alliances have no row.

### ADR-784 · 2026-11-01 · accepted — PLAN 7.181: the overlay's countryballs drawn once and copied
- **Context.** PLAN 7.5's DONE-condition bench on fbc9fbc3: GPU T0 135 fps, p95 21 ms, against fbca2cc4's 348 fps,
  p95 4.3 ms (budget 60, so in budget). The same code in the classic look: 346. A probe of T0 as bench G sets it
  (each part of `draw` timed) put the CPU of the two looks within 0.3 ms; the long frames were on the GPU's raster
  of the 2D overlay. With the planes' balls left out, classic's frames. Each ball drew a clip, a flag, a radial
  gradient and outlines; the gradient was most of it (left out: p95 11.3 → 5.4 ms). One gradient a context, set by a
  transform, and a pattern fill for the clip, did not help (11.8).
- **Decision.** `Ball2dCache` and `drawBall2dCached` (`ball2d.ts`): a ball is drawn once by `drawBall2d` into its own
  canvas, keyed by its flag's image (a new image draws anew), tint, look, prop, ring, radius, device scale and its
  centre's place off the device pixel to a quarter pixel; then copied onto the device's pixels unscaled. The T0
  counters and the planes in flight use it; a vee's balls are drawn after its planes with the shadow off (the shadow
  was on for the copy). A cache starts again past 4096 balls (a plane's ball takes a new size at each zoom). Under a
  turn or skew, or with no canvas (node), drawn as before. The T1 markers are unchanged (not in the bench's T0).
- **What it changes on the screen.** A ball's centre within 1/8 px of where it was; a ball fading (opacity under 1)
  fades as one picture, not part over part. A first cache at a radius step of 1/8, drawn scaled to fractional places,
  blurred the planes' 1.3 px balls into their outlines (`countryballs1938`'s flag reads 28 of 62, bar 50); the
  quarter-pixel phases read 50 of 62, as HEAD.
- **AT** (`docs/evidence/7.181/`): bench G fix, fbca2cc4, fix, back to back: T0 322.7, 345.5, 323.4 fps (≥ 0.9 ×:
  311), p95 4.6, 4.6, 4.6 ms; T2 174.8, 182.6, 179.1 (≥ 164).

### ADR-783 · 2026-11-01 · accepted (the user's decision) — PLAN 7.180: a plane in the ball look is its silhouette with a small ball on it
- **Context.** Critic run 22 (map visuals 6): at T2 the planes were the largest balls on the screen and read as units.
  At 250 m/px an infantry ball is 4.5 px across (radius 2.25); a plane's ball was 0.5 of its 13–19 px span (radius
  6.5–9.5) with grey oval wings. ADR-777 has every level a ball (the user's choice), planes too.
- **Options put to the user:** (a) Classic's silhouette in the nation's colour at its span, a flag ball no larger than
  an infantry ball on it; (b) the same shrunk until the whole plane is under an infantry ball's area (~8 px span:
  the filed bar, which even Classic's plane, ~38 px² against ~16, fails); (c) today's winged ball, smaller.
  **Chosen: (a)** (2026-11-01).
- **Decision.** In the ball look `vee` draws the plane's silhouette (as Classic, in its nation's colour) and a ball of
  its flag on it at PLANE_BALL (0.17) of a fighter's span at the plane's zoom: a bomber's plane is larger, its ball a
  fighter's. At every zoom, so nothing pops at T2/T3. `ball2d` loses its wings prop (no other user).
- **AT, re-scoped with the choice:** each plane's ball no larger than an infantry ball; both wings in the nation's
  colour; a ball of its flag; the plane's colour out of its ball at least the ball's area (the plane, not the ball,
  is most of it). The filed "width ≥ 2 × height" does not fit a plane's outline, as long nose to tail as tip to tip.
- **Also:** `countryballs1938`'s eye check read once at a wall-clock moment, and a blink (by wall time) shut 3–4 of
  13 balls' eyes on 4 of 7 runs with this change, 0 of 7 without: it now reads the balls twice, 0.5 s apart, and a
  ball's eyes count white in either read (a blink is 0.18 s in 3–6 s). 13 of 13 on 4 of 4 runs.

### ADR-782 · 2026-11-01 · accepted (the user's decision, option a) — PLAN 7.179: the flag whole below the helmet's brim; the AT's bar is the top stripe, not a mean colour
**Decision.** An infantry ball's flag is drawn whole below the helmet's brim (`HELMET_FLAG_TOP`, `flagUv`; the
shader blends it in with the props' fade, so a small ball with no helmet keeps its whole flag; `ball2d` squashes it
the same way for the T1 markers and T0 counters). PLAN 7.179's AT is corrected from "the mean colour of German and
Polish infantry balls ≥ 100 apart" to "a band just below the brim is the flag's top colour" (Germany's black,
Poland's white), on ≥ 80 % of each nation's balls at 10 and 600 m/px, and no black on a Polish band.
**Why.** The filed bar borrowed the critic's figure of 52, which was the mean of the red pixels alone (German red
against Polish red, which no fix touches). The whole disc below the brim, as the test measures it, reads 81 apart at
10 m/px and 68 at 600 m/px on `4a977fdb`, and 57 and 51 with the fix: both balls gain their top stripe, and a
black-white-red ball and a white-red one share two of three colours. The bar went the wrong way under the right fix.
The critic's own discriminator was the dark share (`c22_cb2_pixels.py`): the band says it per nation. On
`4a977fdb` the German band shows its black on 0 of 8 balls at 10 m/px and 0 of 15 at 600 m/px (it is white); with
the fix 8 of 8 and 15 of 15; Poland 3 of 3 and 12 of 12 white both times, no black. Seed 7019 finds German infantry in contact on
day 1 now, not the critic's day 4–5 (commits since have moved its history).
**Consequences.** The bar is changed after the run read it, so it is the user's to accept (as ADR-525): (a) accept
the band bar, 7.179 stays ticked; (b) keep the mean-colour bar, 7.179 closed not done, the fix kept. The rim in the
nation's map colour (the report's other option) is not taken: it would change the ball's outline, the user's look.
