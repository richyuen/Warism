# Decisions (ADR log)

Format: ID · date · status · decision · why · consequences. Deliberate deviations
from AoC are tagged **[AoC-DEVIATION]**.

---

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

