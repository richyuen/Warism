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
- `release-2026-11-10` (2026-11-10): Later (R6, R16–R44) and Batches 3–13 (R34–R58), and R61a of the release
  checks, in CHANGELOG.md for players; the items with their evidence in
  `docs/history/ROADMAP-release-2026-11-10.md`.
- `release-2026-11-11` (2026-11-11): Batches 14–16 (R59, R60, R61a's follow-ups, R62 the historical track, R63, R64), in
  CHANGELOG.md for players; the items with their evidence in `docs/history/ROADMAP-release-2026-11-11.md`.
- `release-2026-11-13` (2026-11-13): Batches 17–23 (R65–R79: armies on the replay's fronts, Cold War blocs, a start from any
  year, the replay to 1975, a faster tick, runs 63–67's findings, the gate on the GPU), in CHANGELOG.md for players; the
  items with their evidence in `docs/history/ROADMAP-release-2026-11-13.md`.

## Batch 28 — critic run 69's issues (2026-11-15; full run on `e5b97c8e`; RELEASES step 2, ADR-1005, ADR-1022)

Run 69 (full): mapVisuals 7, diplomacy 6, every other dimension 8. Four blocking, five non-blocking and the small ones,
each fixed before the release (ADR-1005); the release checks then run once on the fixed code (ADR-1022).

- [ ] R84 **Run 69's issues.**
  - [x] R84a (R69-B1, blocking) A game played free from a year keeps the replay's occupations held at peace for years
    (1946: 12 pairs, 21,338 cells at hour 1, 19,728 after three years; 1962: Okinawa's 6 cells): on `leaveTrack` the
    occupations the track excused go back to their owners (or become a rule the checker reads). AT: `c69_heldfree.ts
    1946 51515 3` 0 pairs by year 1; `c69_free.ts 1962 51513 730 free heroes=on` no `held` line.
    Done (ADR-1060): `c69_heldfree.ts 1946 51515 3` 12 pairs / 21,338 cells → 0 at hour 1 and each year; `c69_free.ts`
    1962 51513 (heroes on), 1946 51515 (random diplomacy), 1954 51525, 1971 51517 (heroes on): no `held` line (only
    R84b's economy lines); `trackEndHeld1938h.test` (red 3 of 4 before), `heldFree1938h.test` (sweep).
  - [ ] R84b (R69-B2, blocking) Bloc aid breaks `worldInvariants`' economy rule in every free game from a Cold War year
    (5-21 lines): the economy rule counts the month's aid (`BlocAid`, `AID_SHARE` of the giver's income), and the
    checkers run on free games from a Cold War year in a test. AT: `c69_free.ts 1975 51501 730 free -` and `1991 51507
    1825 free -` 0 economy lines.
  - [ ] R84c (R69-B3, blocking) A puppet made in the month's start hour pays that month's tribute (37009, France on
    Germany, 1 December 1941): it pays from the next month, or the peace runs after the payment. AT:
    `worldInvariants.ts 37009 1825` 0 broken.
  - [ ] R84d (R69-B4, blocking) The Soviet successors drawn in their parent's colour (Russia and Georgia ΔE 1.3;
    Kazakhstan-Uzbekistan 8.5, Ukraine-Moldova 10.2, Russia-Transnistria 14.3): new colours checked against their
    land neighbours (the idea of Europa Universalis' release colours, taken). AT: every pair of land neighbours on
    the 1991 map ΔE ≥ 30, Georgia and Russia first (a tool, as `chartBlues.ts`, on the map); `c69_ev91.mjs 1990 999
    1991-12-27@caucasus:44:41.5:1500`.
  - [ ] R84e (R69-N1) The track's last hour annexes Lebanon to Israel on every seed (the 1982 war held to 2000, the end
    lifts the hold and the war's score annexes; a 1983 free game on day 5): the wars the timeline holds past the end
    make a white peace at it, or the track's last events end them. AT: `c69_endleb.ts 999` no `NationAnnexed LEB ISR`
    in the first week; the 1983 free game's Lebanon living.
  - [ ] R84f (R69-N3) Names frozen while others change: Egypt (1971), Sri Lanka (1972), Benin (1975), Zaire (1971),
    Myanmar (1989) renamed on their dates. AT: the 1991 map's tooltip at 30° E 30° N reads Egypt; the 1992 Relations
    list has Sri Lanka, Benin, Zaire and Myanmar; the replay tests.
  - [ ] R84g (R69-N4) The Soviet successors bankrupt on 1 January 1992 (Kazakhstan disbands 18, Tajikistan 31;
    Tajikistan a great power on 37601): a successor's forces within what its purse keeps (or a purse with them). AT:
    no successor disbands for want of pay in 1992 on four seeds; no successor but Russia and Ukraine a great power
    at the end.
  - [ ] R84h (R69-N5) Three-nation random worlds quiet since run 68 (5 wars in ten years over six worlds, against 19;
    R82d's or R82f's `strategic.ts` the candidates): find the change by A/B and restore. AT: `fewNationWars 3 51401 6
    10` a war on at least 5 of 6 seeds, as run 68's commit.
  - [ ] R84i (R69-N6) Undoing "Found city" leaves the city's label next to it missing (Warsaw, 41211). AT: the crop
    before and after the undo the same (`c69_undo2.mjs 41211`'s city case 0 px).
  - [ ] R84j (run 69's small items) The heroes hint in a later year's free form says "seven great powers" (only the
    living have theirs); "was annexed" with a plural rebels' name ("Contras", "FMLN"), and the FMLN annexed by
    Honduras in a 1991 free game; Kuwait still Kuwait's the day after Iraq's war of 1990 (two days in history); 1 of 69
    sea battles not seen at its camera (39061). AT: each case as the report states it.
  - [x] R84k (the user, 2026-11-15) A hero opened from the played nation's Overview is selected but cannot be ordered
    (a click on the map moves nothing); clicked on the map it can. AT: `heroes1938.spec` (7.184c): Japan played, O-I's
    row clicked, the next map click sends `moveFormation` for O-I; red on the code before. Done (ADR-1059).
  - [x] R84l (the user, 2026-11-15) A later year played free with heroes on has no heroes: the game kept `after` alone
    for a scenario with a seed of its own, so none of the form's options reached the start (R83b's e2e checked the URL
    only). AT: `gameUrl.test` (`yearStartOptions`); 1960 free with heroes on in the browser: 12 heroes (Germany's two
    not, Germany dead). Done (ADR-1059).
  - Run 69's dimensions under the bar (ADR-843), each line taken or why not:
    - Map visuals, what the bar needs: Georgia ΔE ≥ 30 from Russia and every 1991 land pair so (taken: R84d); the
      tooltip at 30° E 30° N reads Egypt (taken: R84f).
    - Diplomacy, what the bar needs: `c69_heldfree` 0 pairs (R84a); `c69_free` 0 lines (R84b); `worldInvariants
      37009` 0 (R84c); `c69_endleb` no annexation (R84e). All taken.
    - Objection, the free 1975 world's far conquests (India in Helsinki, Finland in Karachi through a defensive pact):
      not taken; ADR-1033's re-scoped bar is met (9.2-9.4 far capitals per 100 nations against 1938's 9.4-9.8).
    - Objection, R82f counted by realm (1 against 5, 2 against 10 by nations): not taken; the user's choice (a),
      ADR-1042.
    - Objections carried (Stalingrad's handover, D-Day's ground at its handover, Spain on the 1941-49 card): not
      taken; ADR-1018, ADR-1040, ADR-1019.
    - Idea, a peace conference for a free start's standing occupations (Hearts of Iron IV): not taken; R84a returns
      them as the track's own returns do, and a screen is a feature for the user to ask.
    - Idea, colours checked against neighbours at a release (Europa Universalis): taken in R84d.

## Batch 27 — the title's card for the replay (the user's request, 2026-11-14; ADR-1057)

- [x] R83 **One card for every year, and the options for a year played free.**
  - [x] R83a The 1938 card named without a year (the user: "something without 1938 in the title would be more accurate
    since you can start at multiple years"): "World history", its period "1938–1991" under the name in the list (the
    replay's `endDate`, checked equal to its timeline's end), the random world's "1 January 1938" as before; the
    card's heading the chosen year's world ("World, 1938" at 1938 too); the replay's own name "World history —
    Replay". AT: `title.spec`'s list, period, heading, preview text and saved game's card; `scenarios.test`.
    Done (ADR-1057).
  - [x] R83b A later year played free with 1938's form (the user: "keep all the options that show up on 1938's version
    of Play free, except gray out map size"; random diplomacy offered, not the default): the seed (the game's second,
    what follows the start is drawn from it) and every option, the map's size shown, disabled, with its note; the
    options applied once as the game leaves the replay (`leaveTrack`'s `options`), from the second seed. AT:
    `leaveTrack1938h.test` (the options at the scenario's leave the world as `leaveTrack` alone; random aggression
    differs from it and between two seeds; heroes on for the great powers living), `replayYear1938h.spec` (1941 free:
    the form, the size disabled, the URL's seed 1938, `after` the one typed, `aggr=random`, no size). Done (ADR-1057).

## Batch 26 — critic run 68's issues (2026-11-14; RELEASES step 2, ADR-1005, ADR-1039: done with the open batches before the critic runs again)

  - [x] R82a (R68-B1, blocking; God Mode 7) Undo, and any load, leaves the undone burst's ruins and fallout drawn: the
    worker sends the fallout and ruins layers only when the world or the last sent had some, and `loaded()` resets the
    sent counts, so an empty layer is never sent and the page keeps the old one. After a load or an Undo both layers
    are sent once, empty too. AT: the critic's `c68_undo2.mjs 41211` (nuke undone: 0 px differing from before) and
    `c68_loadruins.mjs 41203` (shot 02 equal to the fresh page's 04), as a spec comparing the picture before an act
    and after its Undo, not only the hash; every God tool in `godUndo1938.spec.ts` compared by picture too.
  - [x] R82b (R68-N4) Normandy fought for: the Allies take ground in D-Day's window (at least the Cotentin and Caen) and
    lose under 2 × the Germans. AT: `trackFronts` on 1938, 37701, 38701, 39701, 41701: D-Day's cells taken > 0 before
    the handover and the Allied loss under 2 × the German; the stage's other bars kept.
  - [x] R82c (R68-N1) "Carrier strike ashore: United States on United States": the row names the enemy the wings were
    sent against (or none). AT: no carrier row names the striker as its target on 32019 to year 20 and two seeds.
  - [x] R82d (R68-N2) European powers at war with Brazil in 1938: France takes Brazil's capital in two years on 4 of 5
    seeds. AT: `c68_farConquests.ts 0 6161,41161,41163,41165,41167`, France takes it on at most 1; the first-60-day
    declarations over 6,000 km on 41821-41839 at most run 68's elsewhere.
  - [x] R82e (R68-N3) The Next line names D-Day's stage for what follows 6 June ("the beachhead secured"), not "D-Day"
    from 2 to 25 July. AT: `c68_nextline.mjs` on the Normandy stage: no line names D-Day after 6 June.
    Done: the stage (dated at its 25 July handover, its 50-day window from 5 June) is "The Normandy beachhead held:
    Cobra breaks out". The critic's `c68_x_stage` 5 June + 50 days and `c68_nextline`: 0 of 50 days name D-Day (was
    24, 2-25 July), 0 page errors; shot at 6 July looked at. `trackTold1938h.test.ts`: a stage with its own window is
    not named as an event of its window (red on the old note).
  - [x] R82f (R68-N5) Pile-ons at day 365: Germany against the Netherlands with 9-13 on the Dutch side on 4 of 5 new
    seeds. AT: `c68_piles.ts 365 --plain` on 39139-39147 and 41139-41147: no war over 4:1.
    Done (ADR-1042, the user's choice (a)): the bar by realm (a colony with its ruler); the AI declares on no target
    whose side `declareWar` would call (`callSides`) has over 4 realms for each of its own. 20 seeds (the critic's ten
    and 43101-43119), off against on: born over 4:1 by realm 5 → 0, at day 365 1 → 0; declarations 586 → 579, wars
    at day 365 153 → 152; the tick held (2.30-2.36 against 2.28-2.33 ms). `diploInvariants`' `pile`;
    `pileRefused1938.test.ts`; `tools/diag/pileSides.ts`.
  - [x] R82g (run 68's AI nukes "not 9"; the user's choice, 2026-11-14) No AI warhead intercepted: 47 launches on
    37501/3 and 41501/3 over 22 years, 0 intercepted (run 67: 6 of 13 on 37501/3/7). Find whether a rule since run 67
    moved it (the pin moved with ADR-1025, ADR-1033, ADR-1041). AT: the interceptions on those seeds by `c68_nc`'s
    probe, with the cause named; if a regression, fixed and the share back to run 67's order.
    Answered, not a regression: no nuclear or air rule changed since run 67 (plain 1938 moved by R78b and R82d alone).
    At run 68's commit (`bfda9503`, replayed) 37501 and 41503 launch 13 and 16, as the critic counted: 26 of the 29
    missiles (from 1952 on), never stopped by design (PLAN 6.2), and 3 bombers with 1.19 stops expected, 0 drawn. On
    HEAD, six seeds 22 years: 47 launches, 22 bombers, 8 stopped against 9.0 expected; a bomber not stopped flies over
    its side's air (superiority 1, chance 0). `tools/diag/nukeIntercepts.ts`.
  - [x] R82h (run 68's stats "not 9"; the user's choice) The chart's "Land (km²)" (by owner) beside the Ranking's "Land
    held (km²)" (by holder, R78e): names that tell them apart; France's and the United States' chart lines in
    near-identical blues: told apart. AT: on 32019's year-20 save the two names differ in their first word, and the two
    lines' colours differ by a set contrast; shots looked at.
    Done (ADR-1043): "Owned land (km²)" beside "Land held (km²)"; a chart's lines at least ΔE 30 apart (a mix toward
    white or black, dashed when none clears). 32019's year-20 world (HEAD's save), France selected: France #95a7dc,
    ΔE 37.5 from the United States (was 19); every pair ≥ 31.9; shot looked at. `tools/diag/chartBlues.ts`,
    `chartColours.test.ts`, `charts1938.spec.ts`.
  - [x] R82i (run 68's AI nukes "not 9"; the user's choice) The ground-zero mark (R81c) sits over the struck stack's
    counter at about 10 s: the counter read through or beside it. AT: the critic's `c68_aimark.mjs` on 7019's year-20
    world: the counter of the stack at ground zero readable (not covered) at 2, 8 and 10 s; shots looked at.
    Done (ADR-1044): the burst's ground (mark, shockwave, the cloud's foot) under the units, its flash and cap over all.
    `burstCounter1938.spec.ts`: at 937 and 3,000 m/px, 2-15 s, 0 of the struck counter's pixels changed (was 513-988);
    `c68_aimark.mjs` on the critic's save at HEAD: the struck US stack read over the mark at about 5 and 11 s.
  - Filed, not taken (one line each, ADR-843):
    - The free 1975 world's far conquests (Britain takes Beijing on 4 of 5 seeds): ADR-1033's re-scoped bar is met
      (×1.17); a Cold War rule for the free world after 1975 is a design of its own, to be asked of the user.
    - The followed wing's p90 at 250 m/px (552-712 px): the probe cannot tell the wing's sorties from other German ones;
      R81g's own probe (by wing id) reads median 0; a lead, not a fault.
    - `slowClick` breaks (41101, 27037, 31175 g1): ADR-914's timing bounds, non-blocking; the 31175 row "next voyage in
      about 7 days" that sailed after 18.9 goes with the landing items when one is next filed.
    - Probe faults (`an_ainuke`'s settle, the replay page's second seed per game): the critic's.
    - Carried (ADR-1027 People's China, zero-ship sea battles, Malta): as filed before.

## Batch 25 — run 67's "not 9" items (the user's decision, 2026-11-14, ADR-1032: before Batch 24)

- [x] R81 **Run 67's "not 9" items.**
  - [x] R81a The free world's far conquests after 1975 (design objection; emergent dynamics). Measured on HEAD first
    (R78b's sea cost came after the critic's watch): a headless count of capitals taken in the first two years of a
    free 1975 start by a nation whose own capital is over 2,000 km from them, on 6161 and four seeds unseen. AT: at
    most 1 a seed on average (the critic's 6161: Jordan's, Damascus, Algiers in under two years), the 1975 first-month
    declarations still ≤ 1.2 × plain 1938's rate per nation; if HEAD already holds it, answered with the counts.
    Done (ADR-1033): the bar re-scoped, plain 1938 itself at 9-12 a seed: far capitals (no land of the taker's realm
    within 500 km at the start, once a pair) per 100 nations at most 1.2 × plain 1938's. HEAD × 1.30-1.5, 39 of 53
    joined ones by NATO following a member's attack. A bloc a defensive pact (`declareWar`): on 40101-40115 13.6 →
    10.4 per 100, plain 10.4 (× 1.00); first-month declarations × 0.98; blocs whole and leaders apart 10 years
    (`afterTrack.ts 1938 10`). `tools/diag/farConquests.ts`; `tests/unit/blocDefensive1938h.test.ts`.
  - [x] R81b A one-step undo of a God act (God Mode): the world as it was before the last act, from one copy the
    worker holds; told on the bar (ADR-1034: not the ticker, and the replay runs again if the act ended it, as bar 5's
    "bit for bit" needs). AT: ADR-1032's five bars (the act +≤ 100 ms p95, no frame over 50 ms while saving, undo
    ≤ 500 ms p95, the tick ±3 % and one save held, the hash and the run after an undo bit for bit) on 7019's year-20
    world; a Playwright spec of each God tool undone; diploInvariants and worldInvariants after an undo on two seeds.
    Done: on the GPU (`tools/diag/undoBars.ts`) the act +15.5 ms p95, longest frame 16.8 ms, undo p95 317 ms, the tick
    × 1.005; `tests/unit/godUndo1938.test.ts` (hash and 30 days bit for bit on 5 and 7, one save, the rules after an
    undone revolt on 5 and 7, the replay running again); `tests/e2e/godUndo1938.spec.ts` (nine tools undone).
  - [x] R81c A burst readable at world zoom (AI nukes, map): at 937 and 3,000 m/px a burst a mark of at least 16 px
    across with its ring, for at least 10 s at Speed x1, not a smudge. AT: the mark's size and lifetime read at both
    zooms on the critic's 7019 year-20 strike and God's H-bomb on Paris; shots looked at; frame budgets kept.
    Done: ground zero's mark (the blast radius's ring about a dot, at least 18 px in radius) for 20 s, under the cloud
    and after it; the effect read alone on a clear canvas. God's H-bomb on Paris at 10.3 s: 202 px at 937 m/px, 66 at
    3,000 (`tests/e2e/burstMark1938.spec.ts`); 7019's year-20 world at HEAD has its first AI burst in August 1958, an
    atomic one (the critic's run 67 world had an H-bomb in March): 58 and 42 px at 10.3 s
    (`tools/diag/burstMark.ts`). Shots looked at.
  - [x] R81d Germany's and Poland's flags at 250 m/px (map visuals; the critic's 39915 day 5): the label flags told
    apart at a glance. AT: of the two flags as drawn at 250 m/px, at least 30 % of their pixels differ by over 60; the
    other 1938 pairs at war in year 1 on two seeds read the same way, or listed.
    Done (ADR-1035): the bar read 60 % on HEAD, so a column was added that names the fault (Germany's black third lost
    on the tag's dark ground in a dark outline): the flag's edge against the ground, 0 % on HEAD. The tag's flag framed
    light (`TAG_FLAG_EDGE`): the edge 100 %, the pixels 70 %. Under 30 % in year 1, listed: 39915 SWI-TUN 13, SOV-TUR
    16, LAT-SOV 23; 7019 TUR-OMN 8, SOV-TUR 16, ALB-TUR 21, LAT-SOV 23, CZS-POL 25 (red flags with a white device, the
    pictures the data gives). `tools/diag/flagPairs.ts`; shots looked at.
  - [x] R81e The relations graph (UI/UX): more nodes named, and a truce on its own edge, not only in the footer. AT: on
    39939 and two seeds, desk 1600 × 900 and phone 390 × 844: every nation at war or in a pact named (or the 15
    largest, whichever more), no two labels overlapping; each truce's edge drawn as a truce.
    Done (ADR-1036): on HEAD 20-27 of 37-43 at war or allied went unnamed. Every nation a candidate (those at war or
    allied first), sixteen directions at eight distances with a leader, no label over another nation; the nodes
    shown stretched to fill the drawing; a phone's drawing 900 high, not 440. Lines of one pair bent apart (a puppet's
    truce lay under its bond). 39939, 39941, 39943 a year on, desk and phone, whole and on Germany: every one named,
    none overlapping, every truce its own line (`tests/e2e/relationsNamed1938.spec.ts`).
  - [x] R81f A battle's labels at 250 m/px (semantic zoom; 39915 day 5): no label over another, and each engaged
    formation's (or its stack's) shown. AT: the overlaps counted on the critic's case and two seeds, 0; the labels'
    count no lower than the stacks in view.
    Met on HEAD, no change (ADR-1037): on 39915, 7781 and 39917 (the war forced, German armour engaged on day 4; the
    three alike to the element) at the armour and the infantry: 25 tags for 25 formations in view, 0 overlapping, 0
    left unplaced, 10 engaged all named; of the engaged formations' 292 elements in view none under a tag
    (`tools/diag/battleTags.ts`). The crowding is the count; fewer tags at a battle is put to the user (ADR-1037).
  - [x] R81g The followed fighter's mark at 250 m/px (aircraft): its median distance from its sorties at most 40 px (the
    critic: 392 on 39927, 68 on 35127), 3,000 m/px as before (median ≤ 32). AT: `w_wing` on both seeds and one new.
    Done (ADR-1038): a patrol's planes are drawn circling at a radius of the view's, and the mark stood at the circle's
    middle (the wing's place). A sortie's row now carries its wing (`SORTIE_STRIDE` 12) and the mark stands on the
    followed wing's planes as drawn. `tools/diag/wingMark.ts` (the critic's `w_wing`): at 250 m/px the median 70 → 0 px
    on 39927, 265 → 0 on 35127, 0 on new 39929; at 3,000 m/px 31-32 → 0.
  - [x] R81h 120 m/px over the late world (performance): 7019's year-20 world at Max, 52.5-55.8 fps there (60 at the
    other zooms). Profiled first. AT: the minimum of the critic's samples at 120 m/px at least 57 fps, the other zooms
    kept; or the cause answered with numbers in BLOCKERS (PROMPT step 10).
    Answered in BLOCKERS (2026-11-14): the critic's number is the view's draws over an empty spot (48.8-57.5 here);
    the browser's frames 60.0-60.2, a forced draw 0.7 ms and 58.8-60 frames/s. The view skips a draw when nothing on
    screen can change (`frameAt`). `tools/diag/lookFps.ts` `FIXED=1` reads it the critic's way.
  - [x] R81i The tags at a battle (semantic zoom; ADR-1037, the user's decision): at 250 m/px and nearer, with an
    engaged formation in view, a formation not in contact has a one-line tag (flag and strength); the engaged ones,
    and a selected or hovered one, keep the whole tag; elsewhere as now. AT: on the critic's case and two seeds
    (`tools/diag/battleTags.ts`), the tags' area in view at least 40 % less, every engaged formation's tag whole, 0
    overlapping, each formation in view tagged; shots before and after looked at.
    Done (ADR-1037): the critic's case (39915, 7781 and 39917 alike, day 4, armour and infantry) 65,400 → 38,172 px²
    (41.6 % less; 39.5 % with the chip at the two-line tag's padding, trimmed once to 2 px), 15 of 25 short, 0
    engaged short, 0 overlapping, 0 untagged. 120, 60 and 30 m/px and a day-9 battle on two seeds the same; at 260
    and 300 m/px all whole. A hero keeps its whole tag. `battleTags1938.spec.ts` (picked, selected, each hovered).

## Batch 24 — the replay to 1991 (the user's request, 2026-11-14; ADR-1031, after Batch 25)

Split as R69 and R71 were (1938-75 kept bit for bit, then the new years by period). Each item's AT keeps the nine replay
tests and the track's checker green, and the 38 yearly starts of 1938-75 at their hashes unless the item says why not.

- [x] R80 **The replay to 1991.**
  - [x] R80a The research: `docs/research/1976-91.md`, as `1963-75.md`: each event by date (checked against a second
    source), the nations to add with their land, the regimes, the wars and their fronts, the arsenals, and the maps
    to match at each period's end. AT: every event of R80f-i in it with its date and source; the nations' list.
    Done: 187 dated rows, each read from its Wikipedia article and one page that is not Wikipedia (five agents given
    the names, not the dates; compared here): 31 disagreements marked (d) with the date to use, 17 rows with the day
    from one page (†), 11 cases (about 20 dates) left Unverified. Every event R80f-i names has a row (PROGRESS lists them); 30 nations
    to add with their adm1 provinces and capitals, 15 rebel movements, the fronts at peak and period's end, four
    checkpoints, the arsenals, the dominions' dates for R80k.
  - [x] R80b A bloc that ends: an event dissolves a bloc (the Warsaw Pact, 1 July 1991) and members leave it before
    (1989-90); after it NATO the one lasting bloc, Russia and the CIS a pact outside the deterrence rule (ADR-1031's
    answer 3). AT: a
    unit test of the event; the blocs' checker on four seeds; 10 years after a 1991 end, the rule the answer names.
    Done (ADR-1045): the `allianceEnd` event (the members leave, the alliance dissolves); once applied no alliance its
    leader leads is a bloc and the blocs are one, the strongest of the rest (`blocsOf`). `blocEnd1938h.test.ts` (the
    event, the one bloc, the CIS-like pact outside deterrence, aid and the defensive pact; the control two blocs).
    `diploInvariants` gains `bloc`. `tools/diag/blocEnd.ts` (the event on the 1975 end, the 1991 end not yet in the
    track) on seeds 1-4, 10 years: at most 1 bloc (NATO, the United States', 14-15 members), the Soviet pact never a
    bloc, 0 aid rows, 0 `bloc` lines; wars between NATO's members and the Soviet side 1, 0, 3, 3 (deterrence gone).
    The members' exits of 1989-90 are R80h's events (`allianceLeave`, which exists).
  - [x] R80l (found by R80b's run) The track's end leaves land held at peace: on the 1975 end hour of every seed (and in
    a save of 2026-11-13) France holds 20 cells of Austria, the United States 1 of Austria and 6 of Japan, Britain 2 of
    Italy, at peace with their owners (`diploInvariants`' `held`; during the track the timeline's `occupy` excuses
    them). AT: `held` 0 on the end hour of four seeds, the land returned or its holder's hold explained and checked.
    Done (ADR-1056; `tools/diag/heldAtEnd.ts`): at the 1991 end the same 29 cells on four seeds, all of 1943-45
    occupations the returns missed: Austria's 1955 ring (France's 20 cells, 12 of them Austria's on a German
    province, and the United States' 1), Libya's two coast cells off the province map (Italy's still, Britain's
    held), Okinawa (no 1972 reversion in the timeline). Austria's return a box over its land, Libya's last cells
    transferred the hour after its birth, Okinawa returned on 1972-05-15: `held` 0 on seeds 1938, 1, 2, 3;
    `historyTrack1938h` checks it on the end hour.
  - [x] R80c A great power's breakup and two unions: the Soviet Union into fifteen on 26 December 1991 (its army, navy
    and air by the land they stand on; its arsenal as ADR-1031's answer 2), Germany on 3 October 1990, Yemen on 22 May
    1990, with the existing `transfer`, births and annexations where they serve. AT: unit tests of each; worldInvariants
    on the end hour of four seeds; no formation of a dead nation left.
    Done (ADR-1046): `born` gains `forces` (`handForces`: land formations by their ground, fleets by their nearest port,
    wings by their airbase or carrier; heroes and warheads stay); the unions are the existing `annex`, which moves land,
    cores and forces. `breakup1938h.test.ts` (a Ukraine box born from the Soviet Union, a stand-in tag: its army,
    the Black Sea fleets, Kiev's wings; the warheads Soviet; without `forces` none; FRG-GDR and YEM-SYE). `worldInvariants`
    exports `hourChecks`. `tools/diag/breakup.ts` (the three events on the 1975 track's last day, MPL Ukraine's
    stand-in), seeds 1-4, every hour to the end and 30 days on: 0 broken lines, no formation of a dead nation.
  - [x] R80d The nations of 1976-91 added dormant (the Soviet successors, Macedonia, Namibia, Zimbabwe, Eritrea's and
    the period's rebel movements), the end moved to 31 December 1991 with no new event. AT: 1938-75 unchanged; the
    yearly starts to 1991 built and their time on the Pages workflow measured (the deploy within its limit).
    Done (ADR-1047): 44 nations dormant (30 states, 14 rebel movements; Zimbabwe is RHO renamed, Eritrea's front ELF,
    both in), their colours distinct, simplified flags, names; the end 1991-12-31; the card says 1991. 1938-75
    unchanged: seeds 1938 and 1 on 30 December 1975, HEAD and this tree at once, owner, controller, formations
    (2,414 and 2,381: nation, place, strength), the living and the treasuries hash the same. `npm run saves` to 1991:
    7 min 13 s locally (6 min 17 s to 1975), 54 starts, 63 MB (41 MB); the Pages run in PROGRESS.
  - [x] R80e Later techs (about 1976-91) as stat upgrades of the existing units (or the unit ADR-1031's answer 4 names).
    AT: the techs held by 1991 by the great powers and by few new states; the pin moved only as the techs explain.
    Done (ADR-1048): six techs of 1975-83 in `postwar.json` (microprocessors, precision-guided munitions,
    fourth-generation jets, composite armour, attack helicopters, cruise missiles: 5-10 % modifiers, no new unit), the
    last six of the 64 bits. `tools/diag/techsBy.ts` from the 1975 start to the 1991 end: the six great powers (SOV FRA
    ENG CCP USA FRG), Italy, Japan and East Germany all six; the Netherlands 3, India 2; 145 living none.
  - [x] R80f 1976-80: Angola's war and Cuba's troops, the Ogaden, Vietnam into Cambodia and China into Vietnam, Uganda
    and Tanzania, Iran's revolution, the Soviet Union into Afghanistan, Nicaragua, Zimbabwe. AT: as R71d: the map of
    the period's end matched as the earlier maps; each event on its date; seeds 1-5 within the bars.
    Done (ADR-1050): 65 events of 1976-80 and the map of 31 December 1980 (see the ADR); the identity Zimbabwe.
    `historyMatch1938h` (to 1980, its `state80`): every map within its bars, the 1980 one 99.79 % whole, 99.5 % right,
    strays 0.12 %; nothing passed over. `historyTrack1938h` and seeds 1-5 to the 1991 end: no line, no warning (after
    ADR-1049). Left out: Sinai (all of it on 1982-04-25, R80g), the Litani operation (no war with Lebanon, no land
    kept), the Canal Zone (no land of its own on the map).
  - [x] R80g 1981-85: Iran and Iraq, the Falklands, Lebanon, Grenada, Poland's martial law, Chad and Libya. AT: as R80f.
    Done (ADR-1051): 52 events of 1981-85 and the map of 31 December 1985; the identities GUNT, the TRNC, Burkina
    Faso. From the 1981 start the 1985 map 99.79 % whole, 99.5 % right, strays 0.12 %, nothing passed over;
    `historyMatch1938h` (to 1985, `state85`) and `historyTrack1938h` with seeds 1-5 to 1991 green, no warning. Left
    out: the Golan law (Israel's already), Osirak and the Libya-Chad merger (no land), Grenada's one cell occupied (it
    would end its state: a war, a hold and a white peace).
  - [x] R80h 1986-89: Chad's war against Libya won, the Soviet Union out of Afghanistan, Panama, the revolutions of
    1989 (regimes and the Eastern Bloc left). AT: as R80f.
    Done (ADR-1052): 45 events of 1986-89 (and January 1990's end of Just Cause) and the map of 31 December 1989.
    From the 1986 start the 1989 map 99.79 % whole, 99.5 % right, strays 0.12 %, nothing passed over;
    `historyMatch1938h` (to 1989, `state89`) and the replay checks to 1991 in PROGRESS. The Eastern Bloc's members
    leave it on the research's dates (Poland, Hungary, Bulgaria, Romania, Czechoslovakia); East Germany with the union.
  - [x] R80i 1990-91: Namibia, Germany and Yemen united, Kuwait taken and freed, the Baltic states, Slovenia and Croatia,
    the Soviet Union's end. AT: as R80f; the arsenals at the end as ADR-1031's answer 2.
    Done (ADR-1053): 78 events of 1990-91 and the map of 30 December 1991; the identities Germany and Russia, the
    CIS's name. From the 1990 start the 1991 map 99.80 % whole, 99.6 % right, strays 0.12 %, nothing passed over;
    `historyMatch1938h` (to the track's end, `state91`) and `historyTrack1938h` with seeds 1-5 green, no warning. The
    arsenals at the end CCP, ENG, FRA, SOV (Russia), USA: no warhead to a successor (answer 2); the handover NATO and
    the CIS of eleven.
  - [x] R80j The world after 1991: the blocs, the historical focus and aid re-measured from the 1991 handover, as R71g;
    the start card's powers and previews for each new year. AT: as R71g's; the card's powers per year equal the
    deployed `years.json`.
    Done (ADR-1054; `afterTrack.ts`, seeds 1938, 1, 2, 20 years from the 1991 handover): NATO the bloc, whole on
    1938 and 2 (14 of 14), 13 on seed 1 (Turkey, in year 9, taken by its own puppet Iran's rising: a war of
    independence calls no ally, PLAN 3.8f; `callWhy.ts`); the CIS 11 at the end, 7 after 20 years (outside the lasting
    rule, answer 3); the United States and Russia opposed 0, 662 and 0 days (seed 1: two American wars on Cuba, Russia
    beside it; outside deterrence, answer 3); 355-379 wars declared (after 1975: 354-499); no aid (no other bloc to
    aid against). The card's powers per year: the deployed `years.json` equal to the local build, 54 of 54 years by
    hash and powers (1991: USA SOV ENG FRA DEU PRC ITR); the previews of 1990 and 1991 served.
  - [x] R80k (ADR-1031's answer 5) The dominions free on their date in the track's data, the 1938 start
    unchanged. AT: Canada, Australia and South Africa no one's puppets at the yearly starts after it; the replay tests.

    Done (ADR-1055): South Africa released on 1961-05-31 (the republic), Canada on 1982-04-17 (the Canada Act, and into
    NATO), Australia on 1986-03-03 (the Australia Act). At the yearly starts: each a puppet of Britain to its date, no
    one's from the first start after it (SAF from 1962, CAN from 1983, AST from 1987). The replay tests green
    (`historyTrack1938h`'s handover NATO with Canada).