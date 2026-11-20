# Decisions (ADR log)

Format: ID · date · status · decision · why · consequences. Deliberate deviations
from AoC are tagged **[AoC-DEVIATION]**.

---

## ADR-1148 · 2026-11-20 · accepted · The peace line gives no reason that ends before its cap (R219)

- **The case** (critic run 90, R90-B1, blocking; diplomacyWarDepth 8 → 7): the line said the peace held "even after ten
  years of peace" days before the war it ruled out. 90441: "no rival within its reach" for both nations to day 90, their
  first transport groups at port on day 91, war on day 98. 89401: a truce with 2 days left read as a bond, the next
  rival named, war on the truce's party on day 1604. On 24 seeds, 16 of 33 wars within 30 days of a day with reasons.
- **Cause:** ADR-1145 reads each realm at the cap of restlessness but against today's bonds and reach. A truce lasts
  TRUCE_TICKS (two years), and a lift on order grows the reach within months; R217's follow-up covered the lift in the
  `noLift` branch only, and R217 made such realms (sea powers whose army stands away from their borders) more common.
- **Decision.** `peaceWhy` gives no reason ("for now") for a realm in any branch when (a) its lift is on its way: no
  transport group at a port, and one in training, one at sea, or it is a sea power that orders one at peace
  (`landlessPowers`); or (b) a rival is held off only by a truce (no bond, not deterred) and its utility at the cap is
  over DECLARE_AT. Not taken: the truce's days left in the line (the report's other way, Hearts of Iron IV's): a reason
  that runs out in days is no reason "even after ten years".
- **Read** (`critic/scripts/c90_peaceTruth.ts` on the report's 24 seeds, ten years): wars after a day with reasons 33 →
  1 (2,186 days after it), within 30 days 16 → 0; days with reasons 37,525 → 18,767 of 57,474 at peace (the same
  peace days: the read is pure, every hash the same). The page (`c90_peaceWeek.mjs`): 90441 days 88-97 and 89401 days
  1595-1603 "At peace for now", then the war. `peaceWhy.test`: the two cases, red before; ADR-1145's own cases as they
  were (54425 equal, 55404 far, 59423 noLift: a group at port and no men to march to it).

## ADR-1147 · 2026-11-20 · accepted, the user's decision · The critic scores performance by the rotation only

- **Decision (the user's, 2026-11-20):** "take the src/ based performance scores out of the critic - it only needs to
  score via the regular dimension rotation." A change under `src/` no longer makes the critic score `performance`
  afresh, and a release no longer needs it scored afresh since the last release. It is scored afresh as any other
  dimension: by the rotation (the two longest unscored, so once in seven runs at least), or when the last report scored
  it under its bar or blocked on it; otherwise carried.
- **Replaces** ADR-1138's clause (the user's decision then): `performance` afresh whenever anything under `src/`
  changed, and in the release check when `src/` changed since the last release.
- **Unchanged:** the builder's budgets (PROMPT.md goal 5, EACH ITEM step 8: a change to the sim or the drawing logs
  its tick or frame time), and the release's `npm run bench -- G --gpu-only` (budgets PASS).
- **Changed:** `CRITIC_PROMPT.md` ("EVERY RUN IS FOCUSED", the table's first row, the release line), `PROMPT.md`
  (RELEASES step 3). Critic run 90 was started before this, under the old text.

## ADR-1146 · 2026-11-20 · accepted · A neighbour of a nation's home is one its men stand on the border's land of (R217)

- **The case** (found tracing R216's 89404, three-nation random world): nation 2's whole army (4.2 M men) stands on its
  capital's continent (navigation land 56, no other holder); its borders with 1 and 3 lie on a northern land (land 4)
  and small islands. Its piece of land 4 is home by its area (`HOME_KM2`, R84h, ADR-1065), so the strategic AI began a
  massing there (`beginMassing`); with 0 % of its men on the border's lands it was never ready, was given up after
  `MASS_DAYS` and barred its target a year: 14 of its massings in ten years with no man there (19 in all), no war.
- **How often** (`.cache/r217_freq.ts`, massings begun with no man of the nation on the border's lands): seed 99's
  first year 0 of 14; 60-nation random worlds, a year: seed 7 1 of 30 (58 on 28, day 131: 75,000 men elsewhere),
  60601 1 of 18 (34 on 22, day 246); three-nation 89402 1 of 1, 89404 14 of 19. An army that walked away and one never
  placed both: the cause is the rule's, not the random world's placing of armies, which a rule must meet either way.
- **Decision.** One definition of "across the sea" (`homeByLand`, `src/sim/ai/strategic.ts`): a neighbour of `n`'s home
  is one of `homeNeighbours`' (the capital's land and pieces of HOME_KM2 or more, unchanged) at whose border with it
  (`massPoints`) some of its land men stand on that border's land (`armyLands`: no fleet, wing or formation aboard, as
  `standing` counts them). A nation whose capital is on no land of its own (`homeNeighbours` null) has those of its
  neighbours so placed (random worlds put capitals on a sea cell: seed 7's 60, 10 of them; ROADMAP R218). It is what
  `warTarget` prices (a colony's cost otherwise, R82d), `acrossSea` asks the lift of (R139), `beginMassing` masses on,
  `unprepared` reads, `stillDeclares` asks again, `landlessPowers` orders transports by (R85e) and `peaceWhy` tells.
  And `noLift`'s touch by land counts only where a man of the declaring side stands on that land (`sidesTouch`'s
  `lands`): on 89404 the sides touched on land 4, so without it a war would have been declared at once with no lift
  and no man to fight it. Not `standing()` per candidate: one pass over the formations a call (R82f's +37 %).
- **The checker** (ADR-804): `mass` in `tests/helpers/diploInvariants.ts`, no massing begun with no man of its nation on
  its border's lands; `lift` judged by the same definition. A new case, the three-nation 89404 (red before on day 5);
  seed 7's 60 red before on day 131. The six other cases green.
- **Read** (A/B, `HOME_PROBE.areaOnly` with `LIFT_PROBE.anyLand` the rule before; `warOpening --area-home`):
  - 89404, ten years: 0 wars and 14 empty massings → 6 wars (2 on 3 by a landing on day 138; then massings with
    1.4–4.2 M men on the border, 2 on 1 day 1350, 1 on 3 day 3038 and others); until its lift, `peaceWhy` says nation 2
    is refused for want of one (`noLift`), where it said "for now".
  - `warOpening`, 1938, five seeds (58211, 58213, 58215, 61009, 61011), three years: wars 222 → 232; ran a month with
    nothing held at day 30 16 of 159 (10.1 %) → 13 of 169 (7.7 %); border wars, attacker none near 12.4 % → 3.4 %
    (ADR-1094's bar 15 %), defender ahead at day 30 16.2 % → 12.9 % (R97b's bar 15 %).
  - `fewNationWars 3 85401 6 10`: run 89's six lines, but 85406: first war day 1197 → 1126, 2 → 4 wars. 51401 (R84h's
    bar 5 of 6): 6 of 6 both, 51401 itself first war day 3015 → 102. 53401 (ADR-1068): 6 of 6 both.
  - Tick (seed 99, first year, the two worlds alike to day 305; run at once on separate cores, `--affinity`): mean
    2.940 → 2.984 ms (+1.5 %), strategicAi 0.275 → 0.332 ms, its slow calls 159 → 185.
- **Stands on** ADR-1041 (R82d), ADR-1042, ADR-1065 (`homeNeighbours.test` unchanged, green), ADR-1068
  (`landlessPowers.test`), ADR-1089 (`massing1938`), ADR-1106, ADR-1119 (`seaLift1938`, the `lift` checker), ADR-1129
  (85401 above), ADR-1145 (`peaceWhy.test`, `peaceLine`: its "for now" world is 89418 now, a massing on day 26 with
  1.96 M men there; 89404 gives its reason): green before and after.
- **Pin:** seed 99's year `f311b292` → `9aaa81c1`. On day 305 the Soviet Union, at war already, declared on
  Mengjiang (and so Japan), a neighbour by the provinces whose cells its own touch nowhere (no border point; the
  second war's MASS_SECOND test skips such a neighbour); priced now as by a colony, it does not, and declares on
  Britain on day 361.
- **After it (the follow-up commit): ADR-1145's promise mended.** With the rule, worlds whose sea powers wait for a
  lift read `noLift` while their transports are on order (`landlessPowers`): 89414's nation 1 to day 90, at war on day
  98; 89415's nation 3 to day 90, at war on day 112 (before R217 both "for now"). `peaceWhy` now gives no reason, "for
  now", for a realm refused for want of a lift that has no transport group at a port and is one of `landlessPowers`
  (59423's nation 2, a group at port and no men that may march to it, still `noLift`). No reason in the 30 days
  before the first war on 89401, 89404, 89408, 89409, 89414, 89415, 89416 (`peaceWhy.test`: 89414 added, red
  without). Further reads: the ten-year sweep suite 29/29; `farConquests 0` on 6161, 41161-41167: Brazil's capital
  taken on 0 of 8 both ways, far capitals 10.0 → 8.0 a seed (ADR-1041: 9.8), taken 26.9 → 24.4; `c69_firstdecl 60` on
  41821-41839 (odd): 0 of 61 over 6,000 km; 1938's sea powers with home neighbours by area but none by their men, seed
  99, 36 monthly samples: the Netherlands 2, Sweden 1 (land powers: Yemen 20, Paraguay 9, Luxembourg 7).
- **Process (the user's decision, 2026-11-20):** R217 was filed after this release's tag, a new declaration rule
  wanting a critic run after it (ADR-1139); the user put it before the release ("Let's do R217 before the release").
  Whether the release goes out with no critic run after this rule is asked with it.

## ADR-1145 · 2026-11-20 · accepted · A world of few nations at peace says so and why, by the AI's own terms (R216)

- **The case** (critic run 89, R89-N1, non-blocking): three of six new three-nation random worlds had no war in ten
  years (89402, 89403, 89404), and the page said nothing of it. ADR-1129 keeps the rules (two or three of near-equal
  strength may keep the peace); the report's second way was taken: the page says that its nations are at peace, and why.
- **Decision.** `peaceWhy` (`src/sim/ai/peaceWhy.ts`), a pure read the worker asks for the stats (`nationStats.peace`)
  while the world has no war and `FEW_REALMS` (3) realms or fewer, at most once a game day. For each realm, the
  strategic AI's own questions (`strategicAi`), its restlessness at the cap (RESTLESS, ten years of peace): its AI
  off, pacifist (`PACIFIST_BELOW`), broke; its target by `warTarget` refused by `firstNotOutnumbered` for want of a lift
  (`noLift`) or by the pile of realms (`outnumbered`); else, of those it may weigh, every one bound to it (`allied`, or
  `bound` by a truce or an overlord), the best under DECLARE_AT (`equal`), or over it and too dear across the sea
  (`far`). One realm that would declare even so, that prepares a war (R97b), or whose year's bar holds a target it
  would choose again: no reason given, "At peace for now". A massing is not named: it is the nation's secret until seen
  (ADR-1107).
- **The page.** In the war row's place while there is no war: one line, "At peace" and the reason most realms share;
  a tap opens the rule and each realm's reason above it (as the war row opens; the ticker above it by its height on a
  phone). Not sized by the war row's effect.
- **Why at the cap and not today's restlessness:** a reason given then holds while the world is as it is; a reason
  today's figures gave would turn false as the years pass (89402: nation 2 clears the bar in year 9 at the cap, and
  the line says "for now" from then).
- **Read on** ADR-1129's traced worlds: 54425 `equal` both, 55404 `far`, `far`, `equal`, 59423 `equal` and `noLift`, as
  it traced them; 89403 `equal` all three (from day 1: at hour 0 the third outmatches the first, "for now", and on day
  1 the first two ally); 89404 "for now" (a massing, then its bar: ROADMAP R217 files why that massing never ends);
  89401 never gives a reason in the month before its first war (day 894). The world's save the same bytes before and
  after each read.
- **Not taken:** a world of four or more realms (the critic's case and ADR-1129 are of two and three); the massing's
  name (ADR-1107).

## ADR-1144 · 2026-11-20 · accepted, the user's decision: (b) · The phone's war row: a name cut to five letters while its counts stay (R213)

- **The case** (critic runs 88 and 89, R88-N4, non-blocking): at 393 px, seed 88901 at day 400, the closed row reads
  "Natio… ⚔ Portugal & 2" and "Natio… & 1 ⚔ Italy & 2" (Nationalist Spain leads two wars; 38 px of the name's 77 drawn in
  each); on 89901 "Natio… ⚔ Portugal" beside "Soviet … ⚔ Japan". Sideways (734 px) the names are whole.
- **Why it is the user's:** the row does what ADR-1136 (a), the user's choice, says: the long names give way first, each
  down to its first five letters, and a banner's "& n" goes only when its names would go under five. R174, R183 and R193
  pin that order (`warBannerRows1938`: "a long one five letters, the count whole"). A better reading of this row needs
  that order changed, and the phone's war row has been through four laps (R174, R178, R183, R193; ADR-1135, ADR-1136).
- **The options:**
  - **(a) Keep it:** the two banners differ by their other side ("Portugal", "Italy"); R213 closed as not taken.
  - **(b) The counts before the first word (recommended):** a long name gives way down to its first word ("Nationalist…",
    "Soviet…"); then the banners drop their "& n", those with a long name first; only then do names go down to five
    letters. The floor of five letters stays. This row would read "Nationalist… ⚔ Portugal" and "Nationalist… ⚔ Italy",
    the counts in the banner's title and when the row is opened, as now. R183's and R193's cases change where they
    say "the count whole".
  - **(c) One banner under 400 px** (ADR-1136 (b), not chosen then): names and counts whole, one war at a glance.
  - **(d) Short names in the data:** a second name for the few long ones ("Nat. Spain", "USSR", "UK"), used when a name
    would be cut. Reads best; a list to keep for every scenario and the random world's names have none.
- **Now:** R213 waits on this; the loop takes the items after it. The release waits for it (ADR-1139: the run's
  non-blocking items are fixed, or closed by the user's word, before the tag).
- **The user's decision (2026-11-20): (b).** `sizeRow` measures each long name's first word (with the ellipsis, never
  under five letters): while the first words can give what the row is short, the counts stand and the names go down to
  them by R193's one cap; else the banners drop their "& n" (those with a long name first, the widest first), and the
  names go on to their first five letters only when every count is gone. ADR-1136 (a)'s order is replaced on this point;
  its floor of five letters stays. A one-word name has no first word to give way to: it stays whole until the counts
  are gone. R193's case reads a name's floor as its first word while no name is cut inside one, and is red when a name
  is cut inside its first word with a count standing; R174's, R178's and R183's ask for five letters at least and stand.

## ADR-1143 · 2026-11-20 · accepted · A loop writes its own bounds: no closure it calls does (R209, a miscompile of Chromium 153)

- **The case** (critic run 88, R88-B1): plain 1938 seed 88901, one `sim.step(9600)` in the page: the headless world
  (`3723997852`) in about half the loads and another (`1699438925`) in the rest, from the same messages; the save before
  the step the same bytes in every load.
- **What was read** (the page's worker posting its hashes from inside the one step; a build not minified; Chromium
  153.0.8010.12, Playwright's):
  - The worlds part at hour 4,983, in `nations.capitalX` and `capitalY` of nation 7 alone: Riga, Latvia's one city, is
    taken, and its field capital goes to (1171.5, 225.5) headless, the controlled cell farthest from the enemy, and to
    (1147.5, 228.5) in the other world, the cell nearest the lost capital: what `farthestFieldCell` picks when every
    target has the same steps.
  - `--js-flags=--no-use-osr`, `--no-maglev` and `--single-threaded`: the headless world in 8 loads of 8 each;
    `--no-turbofan`: the other world in 3 of 8. `--maglev-filter=enemyDistance` (Maglev for that function alone): the
    other world in 3 of 24; `--maglev-filter=-enemyDistance`: the headless world in 24 of 24. `--trace-osr`: an entry
    into `enemyDistance` by on-stack replacement at bytecode offset 390 in all 5 wrong loads of 12 and in none of the
    7 right (its entries at 272 and 767 in both).
  - **Read above; taken from it, not read:** that offset 390 is the breadth-first loop (the function's loops in order
    are the scan, a `for…of` over the targets, the search and two more); that what went wrong in it is the writes of
    the closure it called, `reach`, to the loop's own `tail` and `left` (`for (head = 0; head < tail && left > 0;
    head++)`); and what steps the targets then got (equal ones, by the cell chosen: the nearest the lost capital is
    `farthestFieldCell`'s tie). JavaScript leaves no room for two answers from that function, so the fault is the
    engine's; which statement it compiled wrongly was not read.
  - **Not explained:** why one long step. Two steps of 4,800 posted together went wrong (3 of 8) and forty of 240
    posted together did not (8 of 8); 15 s idle before the step, or a save and load, 8 of 8 right each. The timing of
    the compiler's work between the worker's tasks decides it; no more was read. No player route was found, as the
    critic said; none is ruled out.
  - Not the cause: the worker's host (`workerDeterminism 88901 9600 9600`: all four arms `ddf7b29c`), a NaN in `dmath`
    (none in 9,600 hours), the lane cache built before or after the step (the same hash at hours 0, 1 and 100), the
    step's one loop in the worker (sliced into calls of 240 ticks: 9 wrong of 16).
- **The rule:** a loop's own bounds and counters are written in the loop's function, never by a closure the loop
  calls. `enemyDistance` writes `tail` and `left` at its four neighbours inline; its answers are as before
  (`capitalsDistance.test.ts` against the full pass; the pin of seed 99 unchanged).
- **Searched:** `src/sim` and `src/worker` for a local closure that advances a counter of its enclosing function: no
  other found (by pattern, 157 local closures; not a proof). The page case below is the watch: a second loop of this
  kind shows as a second world.
- **Pinned:** `tests/e2e/longStep1938.spec.ts`: four loads at once, each 9,600 hours of 88901 in one message, against
  the headless hash (red without the fix in 1 load of 4; a load shows the fault about 45 % of the time).

## ADR-1142 · 2026-11-19 · accepted · The desk's war row holds its side while its band and its banners' number hold (R204)

- **The case** (critic run 87, R87-N2): R202 put the desk's closed row on the bar's centre when its banners fit there and
  in the free band's middle when the centre would cost a banner, and chose at every draw from the banners' widths. In a
  running game a war on the row gives its place to one with longer or shorter names, and the row jumped 24 to 44 px with
  the same three banners. On HEAD, 87601 at day 300, eight cases of 60 s at Speed ×5 (1280 × 720, 1366 × 768, 1100 × 800,
  820 × 800; political and sea control): 12 sideways moves, 11 with the count unchanged (four of 44 px at 1280 × 720
  political, six of 24 px at 1366 × 768 sea control). The band's edges did not move in any case: the side's choice alone
  moved the row.
- **The rule** (`rowStand`, `src/ui/bannerOrder.ts`): the side is chosen when the free band or the number of banners
  shown changes, on the centre if the banners fit there, and held until one of them changes again (the band's edges have
  `STAND_SLACK`, 2 px).
  - Held in the band, the row stays there though its banners would now fit the centre.
  - Held on the centre, a row that outgrows it gives a banner behind "+n" and stays on the centre. **This changes R202's
    rule** ("the band's middle only when the centre would cost a banner"): there the row moved to keep the banner.
  - That many banners coming back in the same band stand in the band (`outgrown`), so a banner goes once, not at each
    long name. Another band (a map mode, a resize, a panel) forgets it.
  - One banner that outgrows the centre goes to the band: a war is shown at every desk (R197).
- **The cost, read** (the same eight cases, the final code, one pass of 60 s and one of the critic's 40 s):
  - Moves with the count unchanged: 0 in every pass (11 on HEAD). Moves in all: 3 in the 60 s pass, each with a change of
    the count (12 on HEAD); the count changed 4 times in eight minutes (1 on HEAD).
  - At 1280 × 720 political the row holds three banners in the band, 44 px off the bar's centre the whole time (on HEAD
    off it 47 % of the time, and jumping). At 1366 × 768 sea control three banners 92 % of the time (100 % on HEAD), the
    count changed twice, and no move without it (six on HEAD); without `outgrown` the first passes read 66 to 68 % and
    four changes.
  - On a desk with room (1600, 1920, 2560 px) nothing changes: the row on the centre, 0 px off, three banners in all
    eleven map modes (`c86_deskAttack 84901 400 wide`, as R202).
- **Not chosen:** the side from the row's widest case, the critic's first way (a name is cut at 11 rem, so the widest
  three banners are far wider than those a game shows, and a row that fits the centre would stand in the band for
  names it does not hold; not measured); the row moved to the band and held there (one move with the count unchanged,
  which the AT forbids).

## ADR-1139 · 2026-11-19 · the user's decision · Non-blocking items fixed before the release and judged at the next; the loop stops after a release

- **The case.** ADR-1138 let a release go with its run's non-blocking items open, done after it and before the next critic
  run. The user: "It seems like we end up in a never-ending release/critic cycle then." The loop's only source of work
  had become the critic's findings, and most were side effects of the last fixes (R194 → R197 → R200 and R202; R198 →
  R201); every score has been at its bar since run 84, so the work moved no score.
- **The user:** "What if we fix non-blocking items before release and then don't judge them until following release?";
  to the builder's version with a stop after the release added, "Yes".
- **The rule** (replaces ADR-1138's rule 5; ADR-1138's other rules hold):
  1. A focused critic run on the release candidate. Its blocking issues are fixed and the critic runs again, as before.
  2. A run with no blocking issue and every score at its bar: its non-blocking items (design objections named as
     issues among them) are fixed **before the release**, each with its AT, crossing the sizes and panels where it is on
     the war row or a panel's place (ADR-1137 (d)), the gate green before each commit. **No critic run after them**: the
     release checks (`check:review`, `bench G --gpu-only`) run once, on the fixed code, and the tag follows.
  3. The next release's critic run judges them: their files are "touched" (ADR-1138's table). A side effect found then
     is an item of that cycle; a regression of them is a blocking issue under ADR-829 as now.
  4. **After the tag the loop stops**: it tells the user the release and asks what is next. The next critic run comes
     when the next release is wanted, after the user's next batch is done; it judges that batch and the last release's
     non-blocking fixes together.
- **Now:** critic run 87 (focused, on bbf47bca, spawned before this rule): with no blocking issue and every score at its
  bar, its non-blocking items are fixed, the release checks run, the release is tagged, and the loop stops.

## ADR-1140 · 2026-11-19 · the user's decision: (b) · The narrow desk's legend over the war row: R200 off its route (ADR-829's exit)

- **The case** (critic run 87, focused, on bbf47bca): R87-B1. On a desk of 800 px or less R200 folds the legend; opened,
  it lies over the war row's banner, and the row is not counted again (247 to 329 sampled points covered at 700 × 800 in
  the sea, air and fallout modes; after a resize's recount, fallout's banner still half under it). By the code: the row
  is counted again when the window or its own band changes, not when the legend's box grows; the free band is measured
  once per render. Who meets it: every player on a half-screen desk who opens the folded legend to read it.
- **Why the loop stopped:** a blocking issue that is a regression of an item ticked since the last release (R200 against
  R197's row clear of the legend). UI/UX 7 in this run alone (8 in runs 84 to 86). It is the fourth lap of one class: the
  war row and the legend share the bottom band of a narrow desk (R85-N1, R86-N2, R87-B1, and R87-N2's jumps from R202),
  each fix moving the row's room and the next finding its edge.
- **The options:**
  - **(a) Fix in the same design:** count the row again when the legend opens or closes (its box observed), make the band
    measure catch fallout's box, and fold only the wide legends (sea, air, fallout) as the objection asks. Small; keeps
    the row and the legend in one band, the class R85–R87 came from.
  - **(b) The narrow desk's legend leaves the bottom band (recommended):** on a desk of 800 px or less the legend, folded
    and opened, stands at the top left as the phone's does (its rules, ADR-760), and gives way to a nation's panel and
    History as there. The row's band then has the news alone on its left; R197's band and R200's fold stop interacting.
    The phone's layout is proven by runs 80 to 86.
  - **(c) Take R200 back:** the legend always open on a narrow desk; R86-N2 returns (the sea, air and fallout modes at
    680 to 760 px show "+5" alone, non-blocking in run 86), R87-B1 goes.
  - **(d) The legend in the map-mode button (Europa Universalis IV's way, the report's idea):** on every desk the legend
    opens from the map-mode button, never in the bottom band. The widest change; the desk's legend moves for everyone.
- **Also in the run:** R87-N2, R202's row jumping 24 to 44 px on a 1100–1366 px desk when a war on it changes; the empty
  relations footer saying the left-out count beside "No ties of these kinds."; the objection to folding the political
  legend. Filed as Batch 55 (R203–R206). The rotation's first `fresh` record: emergentDynamics and stability by rotation;
  performance afresh (8).
- **The user:** "OK, let's do b." (Asked first whether (d)'s legend showed only while the map-mode menu is open: yes, as
  the report put it; its live sea and air rows would be hidden while the map is read.) Under ADR-1141 R87-B1 is outside
  the supported sizes and no longer blocks; (b) is done as an item all the same ("We can fix the listed issues, just
  shouldn't be blockers").

## ADR-1141 · 2026-11-19 · the user's decision · The supported sizes: the iPhone 16 and a 1440p desk's window

- **The case.** The critic chose its own sizes: about 40 in runs 83 to 87 (phones from 320 × 568 to 932 × 430, desks of
  600 to 820 px most of all, 1024 × 768 to 4K), and ADR-1137 (d) had every phone-row or panel item cross as many. Most of
  runs 80 to 87's blocking issues were at sizes few players have (a phone narrowed under 600 px and widened, a half-screen
  desk).
- **The user:** "What are all the screen sizes that the critic looks at? Can we limit this? The only important ones are
  1440p, 1080p, iPhone 16/17."; then "OK, for phone, let's just worry about iPhone 16 only, both vertical and sideways
  and with/without Safari bars. On desktop, let's just focus on 1440p - don't worry about fullscreen, just windowed
  height. We can fix the listed issues, just shouldn't be blockers."
- **The rule.**
  1. **The supported sizes** (CSS px; Playwright's `iPhone 16` and `iPhone 16 landscape` for the bars, touch, a pixel
     ratio of 3):
     - the iPhone 16 upright with Safari's bars, **393 × 659**, and without them, **393 × 852**;
     - the iPhone 16 sideways with Safari's bars, **734 × 343**, and without them, **852 × 393**;
     - a 1440p desk's browser window, maximized at 100 % scaling (the taskbar and the browser's bars off its height),
       **2560 × 1305**.
  2. **Only a defect at a supported size can block a release or hold a score under its bar.** A defect seen only at
     another size is a non-blocking issue: filed, and fixed before the release as ADR-1139 has it, never blocking.
  3. **The critic** judges the page at the supported sizes; it may look at others, and files what it finds there as
     non-blocking. The page's frame rate in the performance chain is measured at 2560 × 1305 (and the seed 99 tick as
     before).
  4. **ADR-1137 (d)'s crossing** becomes: the five supported sizes and back, the panels beside the item opened and
     closed. A spec may cover other sizes; it does not have to.
- **Now:** R87-B1 (a desk of 800 px or less) is outside the supported sizes: Batch 55's items are non-blocking and done
  as items (R203 by ADR-1140 (b)). Run 87 judged UI/UX 7 on R87-B1 alone: the next critic run scores under this rule.

