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

## Batch 20 — run 65's findings (focused, on `5ee3e035`: 1 blocking issue, every dimension at its bar)

Before the release (PROMPT's RELEASES step 2, ADR-1003; the non-blocking findings too, the user's decision, ADR-1004).
The critic runs again (focused) after the batch.

- [x] R73 **B1: a start from a year that cannot be loaded is told, and leaves the saved game alone** (R68b, SPEC §7.7).
  A refused start (a year not built, a 404, bytes not the world built) goes to `?failed=save`, which the title shows
  only in the saved game's card: with no save nothing is said, with one that save is blamed and its Continue removed.
  Its own failure (`?failed=start&year=`) and a notice of its own on the 1938 card naming the year. AT: in
  `node critic/scripts/c65_x_badyear.mjs` each of the three cases shows a notice naming the year; in
  `node critic/scripts/c65_x_badyearsave.mjs` that notice, and the saved game's card with its Continue; a Playwright
  spec of both.
  Done: `?failed=start&year=Y` (`startFailedUrl`), the title on the 1938 card with "The world of 1 January Y could
  not be loaded…", cleared by the slider; the saved game's card untouched. `c65_x_badyear.mjs` (wrong bytes, 404, 1977)
  and `c65_x_badyearsave.mjs` (Continue kept) on a build with the starts; `replayYear1938h.spec.ts` (1400 × 800 and
  390 × 844, shots looked at), `title.spec.ts` 11 of 11.
- [ ] R74 **Run 65's non-blocking findings** (the user's decision of 2026-11-12, ADR-1004: all of them).
  - [x] R74a R65-N7: Resume pressed during "Building the world…" on `?paused=1` is undone at the first stats. AT: in
    `node critic/scripts/c65_x_buildpause.mjs 1600 900 1` the player's choice made during the build kept (or the
    button disabled until the world is built), `afterClick` equal to `after3s`.
    Done: the boot no longer forces the pause again after the build (`hud.apply()`; ?paused=1 pauses at boot, R70c).
    The probe: Resume in the build, `afterClick` and `after3s` both running (3 January 1938 three seconds on).
    `worldBuilding1938.spec.ts` gains Resume at 0 and 1000 ms and Pause in a running start (the 0 ms case red on the
    old code), 5 of 5.
  - [x] R74b R65-N6: the start card shows the year chosen: its map (a preview per year, built at deploy beside the
    starts), its nation count (from `years.json`), its heading, and the year on the slider's thumb. AT:
    `node critic/scripts/c65_x_replaycard.mjs 1960 replay` (and 1965 on a phone, 1975 free) with that year's map and
    count.
    Done: `npm run saves` draws `<year>.png` (`previewOfWorld`) and counts the living nations into `years.json`; the
    card's map, "World, <year>", Nations and a label over the thumb follow the slider. The probe on a build with the
    starts: 1960 103 nations, 1965 (390 × 844) 131, 1975 free 157, each its own map (shots looked at); the 38 years'
    hashes the same. `replayYear1938h.spec.ts` 4 of 4 (an older index: 1938's map and count).
  - [ ] R74c R65-N5: names and capitals of 1944-75: Sudan renamed at its release; Newfoundland to Canada (1949) and
    Tannu Tuva to the Soviet Union (1944); British East Africa's last cells; Bonn a city (West Germany's capital, not
    Gießen); Spain's capital Madrid (1939) and its name after the war; no "Manchukuo" revived in a free world after
    the track. AT: the 1975 start with none of those, `critic/scripts/c65_landof` and the 1965 replay's shots.
  - [ ] R74d R65-N1: post-war regimes for the Axis: Japan (1947), Italy (1946), West Germany at its birth, Spain (1975),
    their aggression and traits a post-war democracy's. AT: `c65_freeburst.ts` from 1954, 1963 and 1975 on two seeds
    with no JAP>KOR in the first 30 days; `afterTrack` 37601 and 37603 with no JAP-USA war in 10 years.
  - [ ] R74e R65-N2: the blocs at the handover take in no neutral of the replay's and none of the other bloc's sphere;
    no war declared in the track's end hour. AT: `c65_endhours.ts` on four seeds with no join of a bloc by a nation
    outside it at the end, no declaration in the end hour; R67's bars kept.
  - [ ] R74f R65-N3: a free game from a late year opens without a burst of wars (the 38 years of held declarations
    at once). AT: the first 30 days' declarations per living nation from 1963 and 1975 on two seeds at most 1.2 times
    plain 1938's (now 1.4-2.6); the declarations of the years after the track's own end within the sweep's band.
  - [ ] R74g R65-N4: D-Day and Stalingrad fought, not painted: German formations in France and an Allied army that
    lands in June 1944; Soviet and Axis armies at Stalingrad in November-December 1942 (R66's rules, ADR-969). AT:
    `trackFronts` on two seeds with both sides engaged at both stages' hours; the shots of
    `c65_x_stage.mjs normandy` with formations on both sides; the nine replay tests.
  - [ ] R74h Small, from run 65: the desktop "Next" line cut ("Cameroon ind…"); wars with no way to reach (the
    Republic of China taking Albania's capital, Poland against Australia); the Sino-Soviet clash of 1969 a months-long
    air war. AT: each seen fixed in its probe, or the reason it is left in the item.

- [ ] R75 **Run 65's ideas from other games** (the user's decision of 2026-11-12, ADR-1006).
  - [ ] R75a A historical focus after the track (as Hearts of Iron IV's): for some years after the replay ends (by its
    date or a free start), each nation's AI keeps the alignment history gave it (its bloc or its non-alignment, its
    allies and its foes), easing into its own choices, instead of choosing afresh in the first hour. With R74e and
    R74f. AT: in the 10 years after the track on seeds 1938, 1, 2, no nation joins the bloc it was not in at the end
    in the first 3 years, and the year's declarations ease from the end's level into the sweep's band; plain games
    unchanged (the pin).
  - [ ] R75b The start card names the year's great powers (as Paradox's bookmarks; the year's map is R74b): the
    strongest nations of each start, from `years.json`. AT: the card at 1938, 1960 and 1975 lists its great powers
    (at 1960 the United States and the Soviet Union first); `replayYear1938h.spec.ts`.
## Batch 17 — run 63's findings (full, on `78b082b4`: no blocking issue, every dimension at 8)

- [x] R65 **Run 63's non-blocking findings** (the historical track).
  - [x] R65a R63-N1: at Max the "Next" line is missing in 24.5 % of samples (hidden from its event's hour to the next
    stats, R64f's fix). AT: in `node critic/scripts/c63_h_blank.mjs 120 1600 900 99` the line present in ≥ 95 % of
    samples while the track runs, and never past.
    Done (ADR-960): the stats carry 8 events ahead; 99.7 % present, never past; `trackView1938h.spec.ts`,
    `tests/unit/trackShown.test.ts`.
  - [x] R65b R63-N2: the God tab ends the replay unsaid ("World AI" and its 40 controls, the note scrolled out or read
    as the map tools'). AT: in `node critic/scripts/c63_h_godtab.mjs 1600 900 god-world-ai` a note that an act ends the
    replay in view at the God tab's head.
    Done (ADR-961): the note at the tab's head, "Any God Mode act…" there and on the bar; `trackView1938h.spec.ts`.
  - [x] R65c Small, from run 63: the 18 August 1945 Manchukuo triple in the History; the bar's note grey where the
    panel's is red; the track's line ~10 px on a phone; a started scenario file grey for 2-3 s. AT: each seen fixed in
    its probe (`c63_hist.mjs`, `c63_h_god.mjs`, `c63_h_phone.mjs`, `c63_x_loadfile.mjs`).
    Done (ADR-962): the note told alone; the bar's note red; 11 px on a phone; "Building the world…" at a start.
  - Not taken (design objections, no score lowered): the 1942-44 battles painted, not fought (SPEC §7.7, ADR-935);
    the world after 1953 forgetting the blocs; the same history every game (ADR-919); a confirm before the first act
    (ADR-952 chose notes). Each a design question for the user, not an item.

## Batch 19 — run 64's findings (focused, on `a90c7f57`: no blocking issue, every dimension at 8)

Before Batch 18: two are regressions of Batch 17's own fixes.

- [x] R70 **Run 64's non-blocking findings.**
  - [x] R70a R64-N3: `transferTold` hides land rows of other events in the hour (8 May 1945: "Czechoslovakia took land
    from Hungary", "Yugoslavia took land from Hungary"): it matches the giver, not the receiver. AT:
    `npx tsx critic/scripts/c64_transfer.ts` shows no row hidden but a told transfer's own (its `to` and `from`), and a
    death's only in the hour after; `tests/unit/historyTransferTold1938h.test.ts` gains the case.
    Done (ADR-963, cb35c27a): giver, receiver and hour matched; both 8 May rows shown again.
  - [x] R70b R64-N1: on a phone the track's line shows ~8 letters of its note (11 px in 150 px: "Next, 12 March 1938:
    The An…"). AT: in `node critic/scripts/c64_h_phone.mjs 390 844` and `844 390` the Anschluss's line whole, its
    text ≥ 11 px.
    Done (ADR-964): "12 Mar 1938: …" on two rows on a phone, whole at both sizes; `trackView1938h.spec.ts`.
  - [x] R70c Small, from run 64: a paused start's bar says "Pause" while the world builds; Slovakia's "annexed" and
    "destroyed" in one hour (8 May 1945); the "Next" line blank ~0.4 s when over 9 named events fall in a second. AT:
    each seen fixed in its probe (`c64_*`), or the reason it is left in the item.
    Done (ADR-965): "Resume" from the first frame (12f5c03a); `TRACK_AHEAD` 16, 0 blank at Max; Slovakia's pair left
    (History is every game's whole log, the ticker tells it once).
  - Not taken: R64-N2, one `slowClick` on new seed 36105 (no sim file changed since run 63; the known tail R61-SC).
    Design objections as run 63's (Batch 18 takes the fronts and the blocs); a confirm before the first act (ADR-952).

## Batch 18 — after release-2026-11-11 (the user's decision, ADR-958)

In this order, after Batch 17. Each split into lettered parts with their ATs when started. The critic runs after its last item, for
Batches 19 and 18 together (ADR-966).

- [x] R66 **Armies on the replay's fronts.** The script decides the outcome; armies stand and fight on each stage's
  front (Stalingrad, Normandy and the rest), strong enough to win it by the fighting where that leaves the rest of the
  replay unharmed. Split (ADR-967). Every part with a sim change: `historyMatch1938h`, `historyTrack1938h` and its
  five seed files, `chinaFront1938h`, `freeWorld1938h` green, run by hand (the gate runs seed 99's pin alone); tick
  time over the track within 5 % of plain 1938's (paired runs); seed 99's pin unchanged (track-only rules).
  - [x] R66a The measure: `tools/diag/trackFronts.ts`, `tests/helpers/trackFronts.ts` (`stageArmies`): at each `occupy`
    stage, the land it gives and each side's land formations within 120 km (defenders: who holds it, and those at war
    with the taker). Baseline, own seed, 62 stages 1942 to mid-1945: both sides near at 10 (7 of the 33 of ≥ 200
    cells), neither at 36, none engaged; the Eastern Front's Soviet stages 2-3M Soviet men near, 0-256k Axis. Cause
    found: a held enemy is no foe to the operational AI (`foesOf`, R62f2), so no front faces it and none mans it.
  - [x] R66b Armies on the held fronts: while the track steers, the armies of both sides stand at the land of the stages
    to come, never attacking across a hold. AT (the user's, ADR-969): `tools/diag/trackFronts.ts` on the own seed, of
    the large stages (≥ 200 cells) that are land fronts (the taker at war with a holder, the land joined over land to
    the taker's side's), both sides near at ≥ 2/3 (14 of 21; 10 after R66c, seeds 1 and 2 11 and 12; ADR-970; 11 of 19 after ADR-971), those left named
    with why; none engaged across a hold; the bars above. Done (ADR-972):
    16 of 20 (seeds 1 and 2 14 and 16), none engaged; left: the Philippines (the Japanese landed at Lingayen beaten
    before the stage), Burma (the Japanese 15th Army stays in Thailand), Ichigo's Changsha and Guilin (Japan's China
    army stays at Henan).
  - [x] R66c What a stage does to the armies in its ring: what `withdraw` removes and what an `occupy` leaves behind
    the new line, measured; formations of the losing side that are not a pocket of history's (`captured`) fall back to
    the line, not lost or stranded. AT: the measure before and after; the bars above. Done (ADR-968): under a hold,
    set down on their own nearest land, two to a cell; the large Eastern stages' smaller side 1.22M → 3.24M men
    near (seeds 1 and 2 1.08M → 5.78M, 1.20M → 2.62M; ADR-970); the bars green with `historyMatch1938h`'s strays under 1 % and `chinaFront1938h`'s
    army at 40 % (the user's decision); the replay's tick 2.42 ms, plain 1938's 2.51 (HEAD's replay 1.96).
  - [x] R66d Fighting before a stage (the user's choice, ADR-974; ADR-975, ADR-976): for FIGHT_DAYS (7) before each
    stage the hold is lifted inside the stage's area (its ring's box and 120 km) for its taker's side and their foes
    there; land changes hands across it only to the taker's side, only of the land the stage gives; no buff; the stage
    applies at its date as now. The timeline's arrivals kept for their stage (`kept`) until its window opens, with a
    beachhead on an enemy's land. AT (set by the user on 2026-11-11 from the 14 first written: at least 9 after the
    arrivals were kept): both sides engaged at the stage's hour at ≥ 9 of the large land fronts on seed 1938 (the
    census, its land and size fixed at the window's opening), seeds 1 and 2 reported; each side's men lost in the
    window and the share of the stage's land taken by the fighting reported; the bars above. Met: 10 of 19 (seeds 1, 2:
    12 of 19, 10 of 19).
  - [x] R66e The 1946-53 stages (the civil war in China, Korea: `transfer`s) measured as R66a's; their armies by
    R66b-d's rules where those apply, or the reason not. Done (ADR-978): windows for `transfer`s; the Communist field
    armies and the People's Volunteers as kept arrivals; 10 large land fronts 1945-53, both sides engaged at the
    stage's hour at 2 (seeds 1, 2: 4, 4), most fighting through their windows; the reasons not in the ADR.
- [ ] R67 **Cold War blocs in the sim.** Lasting blocs under the strongest powers; war between their leaders held back
  by deterrence; rivalry by proxies. A rule of every game. AT (to be split): after the replay's end no war between
  the blocs' leaders in N years on the own seed and others; the sweep's bands kept.
  Split (ADR-979; measured by `tools/diag/afterTrack.ts`, which saves the world at the track's end):
  - [x] R67a The measure: the 20 years after the track on seeds 1938, 1, 2 (ADR-979's baseline).
  - [x] R67b The blocs the replay hands over (ADR-980): NATO (1949; Greece and Turkey 1952) under the United States and the
    Soviet bloc (the people's democracies, 1947-49) under the Soviet Union, as alliances of the timeline. AT: at the
    track's end both stand with their members; the nine replay tests.
  - [x] R67c Lasting blocs (ADR-981; the user's decisions of 2026-11-12: the two strongest alliances led by a nuclear
    power only, in the historical track's games only): those two keep their great powers (rivals apart, PLAN 7.53b,
    does not part them). Met: on seeds 1938, 1, 2 both blocs whole 20 years after the track (the Eastern Bloc 10 of
    10, NATO 13 of 13); plain games' code path unchanged (the sweep with the rules off 10 of 10); the pin unchanged.
  - [x] R67d Deterrence (ADR-981; as R67c): no nation of one of the two blocs declares on a side the other stands on.
    Met: no day in 20 years after the track on seeds 1938, 1, 2 with the blocs' leaders on opposite sides of a war.
  - R67e and R67f deferred to after R69 (the user's decision, ADR-982).
- [x] R68 **A start from any date of the replay.** A timeline slider in place of "World, 1938" and "World, 1938 —
  Historical"; continue the replay or free from there.
  Split (ADR-983, the user's decisions: a start each 1 January, built at deploy, never committed):
  - [x] R68a The yearly saves: `npm run saves` writes 1938h's world (its seed) on 1 January of each year of the track
    to `public/data/scenarios/1938h/start/<year>.sav` (gzipped `Sim.save()`) and a `years.json`; gitignored; the Pages
    workflow runs it into `dist`. AT: one save per year to the track's end; each loaded into a fresh world plays on 30
    days to the hash of the unbroken run (a unit test on one year); the workflow's step.
  - [x] R68b A game from a year: `?scenario=1938h&year=Y&mode=replay|free` starts the world, fetches and loads year
    Y's save, and for `free` ends the track by a command (`leaveTrack`, logged; `TrackEnded`, a reason of its own);
    the second seed (`after`) the game's own. A missing or unfit save goes to `?failed=save`. AT: unit tests of the
    command and the load; an e2e start from a year in each mode.
  - [x] R68c The card: "World, 1938 — Historical" offers the years of `years.json` (1938 alone without it) and the
    choice to continue the replay or play free. AT: e2e of the card (year and mode reach the game); the title
    screen's specs.
- [x] R69 **The replay past 1953**, to 1962 for now (the user's decision, ADR-959).
  Split (1938-53 first, then the new years by period; dates and borders from sources, cited in the timeline's notes):
  - [x] R69a The end moved to 31 December 1962 and the nations born 1953-62 added dormant, with no new event. AT: the
    1938-53 replay unchanged (the nine replay tests, the 12 maps' scores and the yearly hashes to 1953 as before or
    explained); the tests of 1953's end state kept as checks on 27 July 1953; the card's words and the year slider to
    1962; the build of the yearly starts within the Pages workflow's time.
  - [x] R69b 1953-56 (ADR-985): Indochina's end (the Vietnams, Laos, Cambodia), Austria free, West Germany in NATO,
    Egypt, Sudan, Morocco, Tunisia, Suez; land named by the map's codes. Not Hungary (its land unchanged) or the
    Warsaw Pact (the Eastern Bloc stands for it). AT met: a map of 1 December 1956 matched as the earlier maps; each
    event fired on its date on seed 1938 (none passed over) and seeds 1-5 within the bars.
  - [x] R69c 1957-60 (ADR-986): Ghana, Malaya, Guinea, the United Arab Republic, the Saar, Tarfaya, the Sino-Soviet
    split, the African states of 1960, Somalia, Cyprus, the Congo. Not Iraq 1958 or Cuba 1959 (no event changes a
    government). AT met: a map of 31 December 1960, as R69b.
  - [x] R69d 1961-62 (ADR-987): Sierra Leone, Tanganyika, Kuwait, Goa, Syria out of the UAR, Algeria, Rwanda, Burundi,
    Uganda, Jamaica, Trinidad, Samoa, the Southern Cameroons, Albania's break, the Sino-Indian war. Not West New
    Guinea (the UN's at the end of 1962) or the Cuban crisis (no war). AT met: a map of 30 December 1962, as R69b; the
    nukes only where scripted to the track's end.
  - [x] R69e The world after 1962 (ADR-988): R67c-d's blocs re-measured from the 1962 handover: their leaders never
    at war in 20 years, both blocs whole, on seeds 1938, 1, 2.
  - [x] R69f West Germany's arsenal (ADR-988, done ADR-989: `bomb` events, none other while the track steers): at the track's end West Germany holds nuclear weapons; history's had
    none. Find how it came by them (research, a gift, a capture) and keep the arsenals of 1962 history's (the United
    States, the Soviet Union, Britain, France). AT: on seed 1938 and seeds 1-5, no arsenal at the track's end but those.
- [x] R67 (after R69, the user's decision, ADR-982):
  - [x] R67e Proxies (ADR-990, the user's choice: aid to the other side): monthly, a bloc's leader aids a nation of
    neither bloc at war with a member of the other bloc, with gold and, while it is losing, volunteers. AT: in 20 years
    after the track on seeds 1938, 1, 2, each bloc's leader aids at least 3 nations; the leaders never at war, both
    blocs whole; plain games unchanged (the pin).
  - [x] R67f A Cold War for every game: closed (the user's decision of 2026-11-12, ADR-990): the bloc rules stay in the
    historical track's games only.
- [x] R71 **The replay to 1975** (the user's decision of 2026-11-12, ADR-991; before the critic of Batches 18-19).
  Split (as R69: 1938-62 kept, then the new years by period; research in `docs/research/1963-75.md`):
  - [x] R71a Regime change (ADR-992): a `regime` event sets a nation's aggression (and its static command
    efficiency), told by its note; no government label (none is stored, shown or read); its alignment the same day's
    `allianceJoin`, `allianceLeave` or `guarantee`. Its first uses 1952-62's: Egypt 1952, Iran 1953, Guatemala 1954,
    Iraq 1958, Pakistan 1958, Cuba 1959 (and the Soviet guarantee of 1961), South Korea 1960-61, Turkey 1960, Burma
    1962. AT: a unit test of the event; on seed 1938
    each fired on its date; the 1938-62 maps' scores and the nine replay tests as before or explained.
  - [x] R71b Rebels as nations: an insurgency is a dormant nation born on the land it holds, at war with its
    government (the Viet Cong, the Pathet Lao, the Khmer Rouge, Biafra...), its end an annexation or its own
    victory. The nations of 1963-75 added dormant (rebels and new states), the end moved to 31 December 1975 with no
    new event. AT: as R69a: 1938-62 unchanged; the yearly starts to 1975 within the workflow's time.
  - [x] R71c Later techs (about 1955-75) as stat upgrades of the existing units, so the great powers keep an edge
    over the new states; no new unit. AT: the techs researched by 1975 by the great powers and not by most new
    states; the pin moved only as the techs explain, logged.
  - [x] R71d 1963-67 (Malaysia, Kenya, Tanzania, the Vietnam War's escalation, the Six-Day War...). AT: a map of the
    period's end matched as the earlier maps; each event on its date, seeds 1-5 within the bars.
  - [x] R71e 1968-71 (Czechoslovakia, Biafra's end, Bangladesh, the Gulf states...). AT: as R71d.
  - [x] R71f 1972-75 (Okinawa, the Paris Accords, Yom Kippur, the Portuguese colonies, Saigon, Cambodia, Laos, the
    Western Sahara, East Timor). AT: as R71d; the arsenals at the end history's (China's bomb 1964).
  - [x] R71g The world after 1975: the blocs and their aid re-measured from the 1975 handover.
- [x] R72 **A faster tick, for the replay's deploy** (the user's decision of 2026-11-12, ADR-1000; before the critic of
  Batches 18-19). The deploy's `npm run saves` steps 1938h from 1938 to 1975 in one thread, about 18 minutes on the
  runner (28 s a year), on each push that changes a sim input (ADR-999). In the profile of 1938h's war years combat
  is 42 % of the tick (`--profile`, 3 years: combat 0.97 ms, territory, air and movement 0.21-0.25 ms each,
  operationalAi 0.16, supply 0.15). Speed-ups only: no rule changes, every result bit for bit as before. AT: `npm run
  saves` to 1975 in at most 2/3 of its time on the commit before R72a (both run at once on separate P-cores, then
  swapped); every hash of `years.json` and the pin of seed 99 unchanged; the runner's step time reported in the ADR.
  Split from the profile of the whole build (V8's `--cpu-prof`, 573 s under tsx at `fa16420b`): `Track.held` and
  tsx's `__name` (each closure the sim makes named, under tsx's `keepNames`; the game's build and vitest keep none)
  about a quarter; `findBattles` 37 % inclusive, most of it the hold checks of each pair; then air, movement, supply,
  territory.
  - [x] R72a `npm run saves` from an esbuild bundle without `keepNames`, as the game runs. AT: each hash of
    `years.json` the same as tsx's; the time to 1941 down (paired).
    Done (ADR-1001): `tools/data/saves.ts`; the 38 years' hashes the same as tsx's; to 1941 31.5 s against 45.8 s
    (pairs on separate P-cores, swapped: 33.2/44.9, 29.8/46.7), −31 %; the whole build 378 s (573 s profiled under tsx).
  - [x] R72b `Track.held`: the holds standing at the tick found once a tick, not each of 50 for every pair; no closure
    made a call. AT: as R72's, on the bundle; a unit test of `held` against the old loop over the track's dates.
    Done: `tests/unit/trackHeld.test.ts` (each hour a hold begins or ends and each month, 75 nations' pairs with
    puppets; red with the cache's `next` key taken out); the 38 years' hashes the same; the whole build 383.1 →
    376.6 s (bundles, swapped pairs), −1.7 %, 1952-54 (Korea's holds) −12 to −16 %. R72's bar is read after R72c.
  - [x] R72c What the profile of the bundle shows next (`findBattles`, the fire's loop), re-profiled after R72b.
    Done: the bundle's profile (R72b): `findBattles` 19 % inclusive, its `pair` 12 % (the war and hold of each pair of
    formations); then air strikes 10 %, supply 11 %, movement 10 %, territory 7.5 %. `findBattles` asks the war and
    hold once a nation pair a call (`relations`), and leaves a pair clearly out of reach before the `sqrt` (a margin of
    1e-9; nearer, `dist` decides as before). The 38 years' hashes the same; the build 372.5 → 359.7 s (swapped pairs).
  - R72 met (ADR-1002): `npm run saves` to 1975 570.8 s at `fa16420b` (tsx) against 360.7 s at `9583cfc0` (the
    bundle), 0.63 of it (bar 2/3), both at once on separate P-cores and swapped (578.7/351.8, 562.8/369.6); each of
    the 38 years' hashes the same; the pin of seed 99 unchanged. The runner's step 9.8 min before, 12.3, 9.4, 11.9
    after R72a, b, c: its noise (18 min the night before) larger than the change.

