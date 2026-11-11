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

## Batch 14 — run 60's findings (after the release, the user's call)

Critic run 60 (focused, on `91d11424`): no blocking issue; naval 8 (its bar, by ADR-914's 5 % rule: 1 of 300 new
setups broke `slowClick`); every dimension at its bar. A full run and the release come first (ADR-916); these after.

- [x] R59 **Run 60's non-blocking findings.**
  - [x] R59a R60-N1: "they come back for it in about a day" for 4.3 days with an empty group idle at the port (31173,
    setup 3517, two groups; `critic/scripts/c60_nvtrace.ts`): the figure counts what holds the empty group, or the
    empty group sails for the one waiting. AT: 31173's 366 told a figure that comes true within a day.
    Done (this commit): `nextVoyageHours` no sooner than all aboard are ashore (the landing gathers only then); 366 told
    5, 4, 3, 2, 1 days from t831, boards t935, every hour within a day (`nextVoyageDays1938.test.ts`); c60_nv's 168 runs
    46 of 47 within a day (45 before; the miss R59b's 31127), checker results unchanged.
  - [x] R59b R60-N2: the transports come back and sail again without the one told it waits for them (31127, setup
    15101, one group; 272 sails 8.5 days after "about 4 days"). AT: 272 on the next voyage of its group.
    Done (this commit, ADR-921): those a voyage left at the port board first (`boardOrder`, `Landing.left`); 272 boards at
    t510, its group's next voyage, 3.6 days after "about 4 days"; checker `leftAgain` 2 before, 0 after; c60_nv's 168
    runs 48 of 48 within a day (46 of 47 before), breaks the same two `slowClick` runs.
  - [x] R59c R60-N3: ticker order rows with a relative figure dated as war rows are. AT: 31211's "about 6 days" row
    dated at h114.
    Done (this commit): an order row with a figure from its hour carries its tick and the ticker dates it as an event's
    row ("3 January 1938 328: next voyage in about 6 days"); rows without one are not dated. `orderRowsBrief1938.spec.ts`
    (6 green): whole beside a panel at 1600 × 900, 844 × 390 and 390 × 844, screenshots looked at.
  - [x] R59d R60-N4: at landscape sizes (667 × 375 to 1024 × 500) the nation panel's foot above the bottom bar. AT:
    `c58_peacebtn` 30403 at those sizes, the last row whole.
    Done (this commit): the landscape panel's height counts its padding and border (`box-sizing: border-box`; they took
    the 0.4 rem gap and 10 px more). `panelFootLandscape1938.spec.ts` (new, seed 30403, Germany, every tab): the foot
    above the bar at 667 × 375, 740 × 360, 844 × 390, 932 × 430, 1024 × 500 (red before at all five, by 9.6–11.1 px).
  - [x] R59e R60-N5: `seaBattlesLook` does not fail a listed battle with no fleets left to draw (31501 t17369). AT:
    `seaBattlesLook` on 31501 exit 0, that battle "no fleet to see".
    Done (this commit): a battle listed with no fleet told "no fleet to see" and counted, not failed; the list looked at
    in order of first hours (31501's t6243, listed after t6257, had been looked at 14 h late, the second miss). On the
    critic's `c60_sb_31501.json`: exit 0, 44 of 44 seen, 1 with no fleet, page errors 0.
- [x] R60 **Run 61's non-blocking findings** (the full run, on `d971a46b`: no blocking issue, every dimension at 8).
  - [x] R60a R61-N1: at landscape sizes (844 × 390, 932 × 430, 1024 × 500) an ordered landing's bar lies over the nation
    panel's ×, so a tap on × opens the landing (21103, England's four from Portsmouth to Bremerhaven; a regression since
    run 55, the panel widened under the bar). AT: `node critic/scripts/c61_x_closeblock.mjs 21103 844 390` gives
    `atClose` the `nation-close` button and `clickOk` true; `c55_lbox` 21103 and 32223 at 844 × 390 run their six days.
    Done (`501d2499`): on a short view the landings bar stands right of an open nation panel. `c61_x_closeblock` 21103
    at 844 × 390, 932 × 430, 1024 × 500 and 667 × 375: `atClose` `nation-close`, `clickOk` true, page errors 0;
    `c55_lbox` 21103 and 32223 at 844 × 390: six days, the Cancel in view, in the bar and topmost each day as run 55's.
    `landingsBarPanel1938.spec.ts` (new): red at all four before, green after.
  - [x] R60b R61-N2: with a scenario file chosen on the title screen, the big Start starts plain 1938 and drops the file
    (32441); "No file chosen" beside the chosen file; the card's Cancel unstyled. AT: `MAINSTART=1 node
    critic/scripts/c61_x_editor.mjs 32441` keeps the paint, or the main Start is not offered while a file is pending.
    Done (this commit): while a file is pending the form's Start is disabled and says why (under it and in its title);
    the chooser a game button ("Choose a file", the browser's input hidden in it); Cancel `god-btn`. `title.spec.ts`'s
    scenario-file case checks all three and the Start back after Cancel; 19 title and file specs green; shot looked at.
  - [x] R60c R61-N3: a truncated scenario file is told "Could not load: Failed to fetch". AT: the first 2,000 bytes of an
    exported file told the file is damaged or incomplete.
    Done (this commit): `decodeScenarioFile` tells a stream that fails to unpack "the file is damaged or incomplete"
    (title screen and editor alike). `scenarioFile.test.ts` (2,000 bytes and a changed byte; red before) and
    `title.spec.ts` (the cut file in Chromium, no "fetch"); 13 title and file specs green.
  - [x] R60d R61-N4: random worlds of 2 or 3 nations have no war in 10–15 years (32403). AT: 3 nations sharing a border
    at war within 10 years on most seeds, or the count's floor raised to where wars start (SPEC says which).
    Done (this commit): the first branch holds on HEAD, measured with `tools/diag/fewNationWars.ts` (new): 3 nations at
    war within 10 years on 24 of 30 seeds (32401–32430); 2 on 6 of 10, 4 on 9 of 10, 5 to 8 on 10 of 10. No rule or
    floor changed; SPEC §3.4's random world says why a few stay at peace (32403: two near-equals under `DECLARE_AT`,
    restlessness capped at 0.3; the third alone on its land).
  - [x] R60e R61-N5: History's same-day rows can read backwards (32019, 2 December 1957: the peace above the
    annexation). AT: same-day rows in the order they happened.
    Done (this commit, ADR-922): ADR-865's cause-first hour kept; a row following one of its hour that names a nation of
    it is drawn under it, "↳" for its date (`followsAbove`). `historyHourOrder` (the critic's hour: the war and its
    joiner, the peace and its annexation and end) and `history1938` (the guarantors under Germany's declaration).
- Batch 14 ends with no critic run (ADR-920): the next run comes after Batch 15.
- Not filed: R61-SC, 3 of 300 (1.0 %; 32167 Japan's 366 twice, and 32115 England's 274, the first not Japan's: both
  transport groups sailed full without it, its "about 5 days" true). R60-SC, the `slowClick` tail (30041, 31099, 203997, 204017, all Japan's 366/367 from Tokyo), under the 5 %
  rule; ADR-914's proposal 2 held. The old small items (27125's ticker rows, the phone's panel over the corridor).

## Batch 15 — the historical track (the user's request, ADR-919, ADR-920)

A replay of 1938–1953 as it went, as SPEC §7.7 designs it: a scenario of its own (`1938h`), a dated timeline its runner
applies at each event's hour, the AI's free choices off and its offensives steered while the track runs, ended for good
by the player's first intervention or on 27 July 1953, then reseeded. Then the critic (one run for Batches 14 and 15).
Split finer before any part was ticked (2026-11-10, the advisor's review: the first R62a held six pieces of work).

- [x] R62 **The historical track.**
  - [x] R62a The scenario: `1938h` a `ScenarioId` built from 1938's own files (no copy), its own nations appended after
    1938's 103 (dormant until their date), listed on the title screen ("1938 — Historical", its preview, its seed fixed
    and not offered on its form). AT: `?scenario=1938h` starts; the title lists it; plain 1938's seed-99 pin unmoved and
    its nation count 103; a save of `1938h` loads bit-identical.
    Done (this commit): `src/sim/scenario1938h.ts`, its data, the id through the registry, sim, worker names, app (its seed
    and no option whatever the URL), the form (`fixedSeed`), the CLI and the preview. Amended: **hidden** until R62f (a
    "Historical" world that is plain 1938 on the title would be a feature faked, PROMPT rule 6; the listing is the
    registry's own, checked hidden now). `scenario1938h.test.ts` (12 dormant after 1938's 103, the same land, a month on
    none born, save and load bit-identical and the run after equal); `scenario1938h.spec.ts` (the URL's seed and options
    change no hash; the form's note, no seed field; shot looked at); the pin in the gate.
  - [x] R62b The runner and its state: `timeline.json`'s schema checked by `npm run data -- --check`; a system right
    after the hour's commands applies each due event of the command-backed kinds (war and its sides, peace white or
    with terms, annex, puppet, release, alliance join or leave, guarantee) through `applyCommand`, not the command log;
    one that no longer applies is skipped with a History row; the track's state (next event, running, the second seed)
    an optional section, absent in other worlds; a timeline hash in it, a save of another timeline told. AT: a test
    timeline of every such kind fires each on its hour (all, 0 late); save and load mid-track bit-identical and the run
    after equal to the uninterrupted one; seed 99's pin unmoved.
    Done (this commit, ADR-924): `src/sim/track.ts` (`Track`, `runTrack`), `TimelineFile` and its cross checks, the
    section `world.track`, `TrackSkipped` and `TrackEnded`. Amended: war, join, white peace and guarantee are not
    commands (none does just that); the schema is checked with every data file by `data-schemas.test.ts` (the data
    pipeline bakes, it validates nothing); a save of another timeline ends the track, told, and loads. Evidence:
    `trackRunner1938h.test.ts` (12 events of the 9 kinds, each due on its hour after every tick, none late; the second
    peace passed over with its row; each kind's state; a save at t73 loads bit-identical, the run after equal, events
    too; a save of another timeline: `TrackEnded` at the next hour, its war never declared, ended kept by a save);
    the data-schemas case (order, start, unknown tag); seed 99's pin in the gate.
  - [x] R62c Territory: transfers and occupations by lon/lat rings (with the nations they may take from), rasterised
    at the event's hour, owners and control set as a cession does (`LandCeded`), not through the editor's undo. AT: a
    test transfer and occupation each set exactly the cells their rings hold (counted against a rasteriser of its own).
    Done (this commit, ADR-925): `transfer` and `occupy` in `TimelineFile` and `src/sim/track.ts`. Evidence:
    `trackTerritory1938h.test.ts` (a Sudetenland ring: each of its Czechoslovak land cells by the test's own
    point-in-polygon Germany's, owned and held, at t28, none other of the two's changed, one `LandCeded`; western Poland
    held by Germany at t55, owners kept, nothing else of Poland's); a probe: the occupation held 3 days at peace.
  - [x] R62d Birth and the end: a dormant nation born on its date with its cores and land (nothing revives or spawns it
    before); the second seed (`?after=`, rolled by the form) taken by every RNG stream when the track ends, in 1953 or
    early; what reads the seed outside the sim (URL, Continue, settings, autosave) checked. AT: two runs with one seed
    and different second seeds equal in every section but the track's own until the end, and differing within a year
    after; no unborn nation alive before its date on 5 seeds.
    Done (this commit, ADR-926): `born`, `TimelineFile.end` (1953-07-27), `endTrack` (the world's seed and streams
    from the second), `GameOptions.after` through the URL, the form and the game. Evidence: `trackBirth1938h.test.ts`
    (Slovakia born at t30, not before, with land, cores, Bratislava's city its seat, `LandCeded` then `NationBorn`;
    born again passed over; seconds seeds 111 and 222: no section but the track's, the seed's and the rng's differs to
    t72, the end at t72, apart on the first day after (casualties, strength); with none the seed stays); a probe on
    seeds 1, 7, 99, 1938, 31127, a year each: no unborn nation alive on any day; `scenario1938h.spec.ts` (Start's
    URL has `after`).
  - [ ] R62e The steering: while the track runs, the strategic AI's own declarations, stalemate peace, pacts,
    coalitions, rival drift, collapse, revival and nuclear decision off; war-phase objectives weighting the operational
    AI's sectors and naming the invasion AI's landings. AT: on a test war with one objective, the attacker's allotted
    strength in sectors facing it ≥ 2× the plain AI's on the same save (A/B from one `sim.save()`); in a 2-year headless
    run no war, peace, pact or nuke but the timeline's.
  - [x] R62f 1938–39: the Anschluss, Munich and the Sudetenland, the First Vienna Award, the end of Czechoslovakia
    (the Protectorate, Slovakia, Carpatho-Ukraine), Memel, Albania, the end of the Spanish war, Nomonhan, the pact and
    the partition of Poland, the Baltic bases, the Winter War. AT: every 1938–39 event fires on its date; land owned as
    history had it on 1 October 1938, 1 April 1939 and 1 October 1939 ≥ 95 % of land cells (the historical maps as
    rings, in the timeline's data).
    Done for the period's own events and land, re-scoped by the user (ADR-928): the data, the maps,
    `tools/diag/historyMatch.ts`, the `buff`, `forces` and `without` levers; 100.00 / 98.81 / 98.79 % of land, the moved
    land 97-98 % right (`tests/sweep/historyMatch1938h.test.ts`). The Nomonhan war and peace (passed over) and the 1.19 %
    of land strayed, China having overrun Manchukuo in February 1939, are R62f2's.
  - [x] R62f2 The China front (R62f's cause): why formations under strength are not refilled while the manpower pool
    grows (the economic AI's refill step), and a dated hold on a front read where the AI attacks (inert elsewhere, the
    pin unmoved). AT: from one save at 1 November 1938, 12 months with the hold and without: with it Japan's share of
    China within 5 points of its start, China's army not under half, the Communists and Manchukuo living; then R62f's
    run: no event passed over, stray land under 0.2 %.
    Done (ADR-929): the `hold` kind; held a year, Japan's share 1.1 % unmoved, China's army 203k to 459k, the
    Communists and Manchukuo living (without: 18.3 %, 88k, the Communists dead; `tests/sweep/chinaFront1938h.test.ts`);
    R62f's run 100.00 / 99.99 / 99.98 %, stray 0.00 %, no event passed over (`tests/sweep/historyMatch1938h.test.ts`).
  - [x] R62g 1940–41: Denmark and Norway, the Low Countries and France (the armistice, Vichy and the occupied zone),
    Italy's entry, the Baltic annexations and Bessarabia, the Second Vienna Award, the Tripartite Pact, Greece and
    Yugoslavia (Croatia), North Africa, Barbarossa, Iran, Pearl Harbor and the Pacific opening. AT: each event on its
    date; Paris taken within 30 days of 14 June 1940; owners match history on 1 July 1940 ≥ 90 % and control on
    1 December 1941 ≥ 75 % of land cells.
    Split in measured slices (2026-11-10), each its own commit; R62g is ticked with the last. The whole-land shares
    alone say little (an empty timeline scores 98.8 % on owners), so each slice's bar is also on the land moved and
    the land strayed, owners and control (a control layer in `maps`):
  - [x] R62g0 What 1938-39 left: Japan's occupation of China before the hold (`occupy` rings on 1 November 1938:
    North China, the Yangtze to Wuhan, Canton) kept by it; the hold started and ended mid-run (attacks stop and resume)
    and saved and loaded mid-hold (the same hash); a hold by place (an optional ring: the West quiet to 10 May 1940
    while Norway is fought); the Winter War's peace (13 March 1940) and Karelia; a control layer in `maps` and
    `historyMatch`. AT: Japan controls ≥ 15 % of China on 1 December 1939; a hold's attacks stop and resume on their
    hours; a save mid-hold replays to the same hash; R62f's run still clean.
    Done (ADR-930): China by stages under a hold from the start, Japan 15.2 % of China a year on (37.4 % without, the
    Communists dead); a hold's puppets; the Phoney War held (not a hold by place: one cost, Norway's Anglo-German
    land fighting); the Winter War's peace and Karelia; `occupied` in `maps`, control 95.3 % right, stray 0.05 % on 1
    October 1939; a hold stops and resumes on its hours and replays from a save mid-hold
    (`tests/unit/trackLevers1938h.test.ts`, `tests/sweep/chinaFront1938h.test.ts`, `historyMatch1938h.test.ts`).
  - [x] R62g1 To 9 April 1940 and the West to 1 July 1940: Denmark and Norway, the Low Countries, France (Paris, the
    armistice, Vichy born, the occupied zone), Italy's entry; the Baltic states occupied and Bessarabia (moved from
    R62g2: they stand on the 1 July map). AT: each event on its date; Paris taken within 30 days of 14 June 1940; the
    1 July 1940 map: owners ≥ 90 % of land, the moved land ≥ 90 % right, stray < 0.5 %.
    Done (ADR-931): `leave` and `redeploy`; owners 99.90 %, 98.0 % right, stray 0.04 %; control 97.3 % right, stray
    0.12 %; Paris by the fighting on 14 June, 648 French cells held on 22 June; no event passed over
    (`tests/sweep/historyMatch1938h.test.ts`, `tests/unit/trackLevers1938h.test.ts`).
  - [x] R62g2 The Baltics annexed, the Second Vienna Award, the Tripartite Pact, Greece and Yugoslavia (Croatia),
    North Africa, Iraq, Syria, Iran. AT: each event on its date; a 1 June 1941 map, the same bars.
    Done (ADR-932): owners 99.83 %, 97.4 % right, stray 0.06 %; control 99.65 %, 96.7 % right, stray 0.19 %; no event
    passed over to October 1941; `withdraw`, an owner's `occupy`, a revival by `born`
    (`tests/sweep/historyMatch1938h.test.ts`, `tests/unit/trackLevers1938h.test.ts`).
  - [x] R62g3 Barbarossa to 1 December 1941. AT: control on 1 December 1941 ≥ 75 % of land, the land moved in
    control ≥ 75 % right, stray control < 2 %.
    Done (ADR-933): by stages (the lines of 10 July, 20 August, 30 September, 1 December, the pockets taken), the
    fighting alone holding at most 2,789 Soviet cells; control 99.45 %, 94.9 % right, stray 0.22 %; 7,599 Soviet cells
    held by the Axis; no event passed over (`tests/sweep/historyMatch1938h.test.ts`).
  - [x] R62g4 Pearl Harbor and the Pacific opening (to 31 December 1941). AT: each event on its date; the
    belligerents of 11 December 1941 as history had them.
    Done (ADR-934): fifteen pairs at war or at peace as history had them at the end of 11 December 1941; no event
    passed over to 1 January 1942 (`tests/sweep/historyMatch1938h.test.ts`). R62g done with its slices.
  - [x] R62h 1942–45: the Pacific, Stalingrad, El Alamein and Torch, Italy's surrender and the Italian Social Republic,
    Bagration, D-Day, the switches of Romania, Bulgaria and Finland, Germany's surrender (8 May 1945), Hiroshima and
    Nagasaki, Manchuria, Japan's surrender (2 September 1945). AT: each event on its date; control matches history on
    1 November 1942 and 6 June 1944 ≥ 75 %, owners and control on 1 June 1945 ≥ 85 % of land cells; the two scripted
    strikes the only nuclear ones.
    Split in measured slices (2026-11-10) as R62g, each its own commit; the bars also on the land moved and strayed
    (ADR-930), the fronts the fighting cannot move by stages (ADR-933):
  - [x] R62h0 1942: the Moscow counter-offensive, Kharkov and the Crimea, Case Blue to Stalingrad and the Caucasus;
    Japan's conquests (Malaya and Singapore, the Philippines, the Indies, Burma, New Guinea, the Aleutians); Rommel to
    El Alamein. AT: each event on its date; control on 1 November 1942 ≥ 75 % of land, the land moved ≥ 75 % right,
    stray < 2 %; the Soviet army rebuilt (≥ 2M men on 1 November 1942).
    Done (ADR-935): the fronts held between their stages; control 99.41 %, 95.3 % right, stray 0.21 %; the Soviet army
    3.47M; no event passed over (`tests/sweep/historyMatch1938h.test.ts`).
  - [x] R62h1 November 1942 to 5 June 1944: Torch and Tunisia, Stalingrad, Kursk and Ukraine, Sicily, Italy's surrender
    and the Italian Social Republic, the Pacific's islands. AT: each event on its date; control on 6 June 1944, the same
    bars.
    Done (ADR-936): owners 99.81 %, 97.4 % right, stray 0.08 %; control 99.40 %, 95.5 % right, stray 0.29 % on 5
    June 1944; no event passed over (`tests/sweep/historyMatch1938h.test.ts`).
  - [x] R62h2 D-Day to Germany's surrender: Normandy and France (France revived), Bagration, the switches of Romania,
    Bulgaria and Finland, the Bulge, Berlin, 8 May 1945. AT: each event on its date; owners and control on 1 June 1945
    ≥ 85 %, the land moved ≥ 85 % right, stray < 2 %.
    Done (ADR-937): owners 99.84 %, 96.9 % right, stray 0.09 %; control 99.51 %, 95.7 % right, stray 0.28 % on 1 June
    1945; no event passed over (`tests/sweep/historyMatch1938h.test.ts`).
  - [x] R62h3 The Pacific's end: the Philippines, Okinawa, Hiroshima and Nagasaki, Manchuria, Japan's surrender (2
    September 1945). AT: each event on its date; the two scripted strikes the only nuclear ones.
    Done (ADR-938): two warheads burst to 26 October 1945, Hiroshima's and Nagasaki's on their hours; no event passed
    over; owners 97.2 % right, control 97.2 % right (`tests/sweep/historyMatch1938h.test.ts`, `nuke` in
    `tests/unit/trackLevers1938h.test.ts`). R62h done with its slices (ticked late, after R62i4: its last slice's
    commit left it open).
  - [x] R62i 1945–53: the occupation zones, Poland moved west, Austria, the Philippines, India and Pakistan, Burma,
    Ceylon, Israel, Indonesia, the Chinese civil war (the People's Republic, the Republic on Taiwan), the two Germanies,
    the two Koreas and the Korean War to the armistice, Japan's sovereignty (1952); the new nations' names, colours and
    flags. AT: each event on its date; owners match history on 1 January 1950 and 27 July 1953 ≥ 90 % of land cells;
    the world free after the last event (a war of the AI's own within 5 years on most of 10 seeds loaded from 1953).
    In slices (ADR-939), each with its part of the AT:
  - [x] R62i0 The war's loose ends: the Axis pact left by each member as it changes sides; the surrendered fleets and
    wings taken, not handed on. AT: no Axis pact on 26 October 1945; the Soviet ships and wings not grown by Germany's.
    Done (ADR-939): `withdraw` `fleets`; the pact gone, Japan's fleet gone, the Soviet one unchanged by the annex.
  - [x] R62i1 1946–49: the Philippines, India and Pakistan, Burma, Ceylon, Israel and its war, Indonesia, the two
    Germanies, the two Koreas. AT: each event on its date.
    Done (ADR-940): no event passed over to 2 January 1950; the new states living, no war left on 1 January 1950.
  - [x] R62i2 The Chinese civil war: the People's Republic, the Republic on Taiwan. AT: each event on its date; owners
    on 1 January 1950 ≥ 90 % of land cells.
    Done (ADR-941): owners on 1 January 1950 99.77 %, 98.7 % of the moved land right; no event passed over; the seats
    at Beijing and Taipei (`capital`), the Soviet pledge ended (`guarantee` `end`).
  - [x] R62i3 The Korean War to the armistice; Japan's sovereignty (1952). AT: each event on its date; owners on 27
    July 1953 ≥ 90 % of land cells.
    Done (ADR-942): owners on 27 July 1953 99.78 %, 98.9 % of the moved land right; no event passed over; no war on
    28 July, the track ended.
  - [x] R62i4 The new nations' names, colours and flags; renames as state (a save mid-run the same hash). AT: each
    nation living on the track from 1938 to 1953 has a name, a colour of its own and a flag of its own.
    Done (ADR-943): `rename` (`World.identities`); `data/scenarios/1938h/flags.json`; `flagsByScenario.test.ts`,
    `trackLevers1938h.test.ts`, the data cross-checks.
  - [x] R62i5 The world free after the last event. AT: a war of the AI's own (declared after the end) within 5 years
    on most of 10 seeds loaded from 1953.
    Read early (ADR-939, the timeline to 1945 and the track run to its end): 79-99 wars in 5 years on each of 10
    seeds, a dozen in the first 3 months; the bar met, the burst at the end to be judged here.
    Done (ADR-944): the AI's first war within 0-15 days of the end on 10 of 10 seeds; the burst the AI's opening (15-19
    wars in the first quarter, an ordinary 1938 game 12-13) (`tests/sweep/freeWorld1938h.test.ts`). R62i done with
    its slices.
  - [x] R62j Intervention and the player's view: the first God Mode act, editor edit or taking of a nation (a command
    of the pending queue of those kinds; listed in a test) ends the track and reseeds at that hour; a line under the
    date while the track runs (the next event and its date), the end's row in the History, the events' rows in the
    ticker with their historical names. AT: each listed kind, given at 6 h, 1, 30 and 365 days, ends it, reseeds, and
    no event fires after; screenshots at world zoom on phone and desktop sizes.
    In slices (ADR-945):
  - [x] R62j0 The first intervention ends the track and reseeds; the end's row in the History. AT: each listed kind,
    given at 6 h, 1, 30 and 365 days, ends it, reseeds, and no event fires after.
    Done (ADR-945): every command applied is an intervention; 13 kinds listed at the four times
    (`tests/unit/trackIntervention1938h.test.ts`).
  - [x] R62j1 The player's view: a line under the date while the track runs (the next event and its date), the
    events' rows in the ticker with their historical names. AT: screenshots at world zoom on phone and desktop sizes.
    Done (ADR-946): `TrackEvent` rows by the timeline's notes; the bar's line; `tests/e2e/trackView1938h.spec.ts`,
    `docs/evidence/R62j/`. R62j done with its slices.
  - [x] R62k The checker and the accuracy measure: `historyTrack` in `tests/helpers/` (no timeline event refused but
    those skipped by rule, no war or peace not on the timeline while it runs, diploInvariants through the track) on 5
    seeds and on the scenario's own; `tools/diag/historyMatch` printing each checkpoint's share of land cells matching
    history (owners, control). AT: the checker green on all 6; `historyMatch` meets R62f–i's bars on the scenario's
    seed; tick time over the track within 5 % of plain 1938's (`npm run sim -- --affinity 0xFFFF`).
    Built (ADR-947): the checker and its test; green on the own seed and seeds 1, 2, 3, 5; `historyMatch1938h` green;
    1.87 ms a tick against plain 1938's 2.39. Seed 4 green with R62l: done (ADR-949).
  - [x] R62m The historical track on the title screen (the user's decision of 2026-11-10): listed after 1938.
    Done (ADR-948): `hidden` out; `scenario1938h.test.ts`, `scenario1938h.spec.ts`, `title.spec.ts`;
    `docs/evidence/R62m/`.
  - [x] R62l Seed 4: no landing of the AI's own while the track steers. Italy lands in Palestine in August 1941
    (`planLanding`, no objective weighed), holds it to 1948, Israel is not born. The rule "only within an objective"
    makes seed 4 green but sends the Commonwealth's armies to France by sea, and Paris falls after 22 June on 3 of 6
    seeds (ADR-947). AT: `historyTrack1938h` green on all 6 with `historyMatch1938h`'s bars kept; Paris before 22 June on
    the 6 seeds. The user's decision (BLOCKERS): the rule with France retuned, or the bar re-scoped.
    Done (ADR-949; the user's option b): the rule; Paris by the armistice, ≥ 500 cells kept; `historyTrack1938h` green
    on all 6, `historyMatch1938h`, `chinaFront1938h`, `freeWorld1938h` green; 2.00 against 2.41 ms a tick (2.038/2.324, 1.962/2.504), plain 1938's hash unchanged.
- [x] R63 The operational AI takes an undefended objective it does not border (ADR-949: on 1938h's own seed the
  German front stood 7 cells short of an empty Paris from 6 to 22 June 1940). First the cause: the Germans drawn south
  to the Commonwealth's landings at Nice (the track's steering, a timeline fix) or empty land not taken (a rule of every
  game, its cost to the user first). AT: on 1938h's own seed Paris taken by the fighting before 22 June again (the 5
  other seeds a warning, ADR-950); for a rule of every game, seed 99's sweep within its bands.
  Done (ADR-951): the track's steering, not a rule of every game: a sector within one of its objectives taken as
  threatened. Paris by the fighting on 10-14 June on all 6 seeds (own seed 14 June); R62g1's bar restored; the 1938h
  sweep tests green, no warning; 2.10 against plain 1938's 2.42 ms a tick (2.143/2.061 and 2.332/2.498, swapped pairs), plain 1938's hash unchanged.

## Batch 16 — run 62's findings (focused, on `9e094f50`: no blocking issue, every dimension at 8)

- [ ] R64 **Run 62's non-blocking findings** (the historical track).
  - [ ] R64a R62-N1: one click ends the replay, unwarned and untold in the ticker (taking a nation, a God Mode act).
    AT: while the track runs the scenario's form, the Take control button and the God Mode bar say that it ends the
    replay; the end has its ticker row (`node critic/scripts/c62_h_interv.mjs 1600 900`, `c62_h_god.mjs`).
  - [ ] R64b R62-N2: builder's words in the news ("the timeline's stages") and events told twice (a war's row and its
    note, a stage and its pocket, "India independent" and "India"). AT: no note with "timeline" or "stage" in the
    player's rows; on `c62_hist.mjs`'s samples one row an event.
  - [ ] R64c R62-N3: "The mobilisation" ×22 with no nation. AT: the Soviet arrivals named as the Soviet Union's, or left
    out of the History and the "Next" line.
  - [ ] R64d R62-N4: "Germany was annexed by Soviet Union" on 8 May 1945 after the zones. AT: the remnant's row reads as
    the timeline's note, or the remnant goes to the zones' holders.
  - [ ] R64e R62-N5: Nagasaki's burst on a sea cell, "where no nation holds the land" beside 72,000 dead. AT: both strikes
    on Japan's land (`critic/scripts/c62_nagasaki.ts`); no strike row pairs "no nation holds the land" with civilians.
  - [ ] R64f R62-N6: at Max the "Next" line names an event already past (14 of 60 samples). AT: no "Next" dated before
    the date beside it in `c62_h_watch.mjs`'s 60 samples at Max.
