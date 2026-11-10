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

- [ ] R62 **The historical track.**
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
  - [ ] R62d Birth and the end: a dormant nation born on its date with its cores and land (nothing revives or spawns it
    before); the second seed (`?after=`, rolled by the form) taken by every RNG stream when the track ends, in 1953 or
    early; what reads the seed outside the sim (URL, Continue, settings, autosave) checked. AT: two runs with one seed
    and different second seeds equal in every section but the track's own until the end, and differing within a year
    after; no unborn nation alive before its date on 5 seeds.
  - [ ] R62e The steering: while the track runs, the strategic AI's own declarations, stalemate peace, pacts,
    coalitions, rival drift, collapse, revival and nuclear decision off; war-phase objectives weighting the operational
    AI's sectors and naming the invasion AI's landings. AT: on a test war with one objective, the attacker's allotted
    strength in sectors facing it ≥ 2× the plain AI's on the same save (A/B from one `sim.save()`); in a 2-year headless
    run no war, peace, pact or nuke but the timeline's.
  - [ ] R62f 1938–39: the Anschluss, Munich and the Sudetenland, the First Vienna Award, the end of Czechoslovakia
    (the Protectorate, Slovakia, Carpatho-Ukraine), Memel, Albania, the end of the Spanish war, Nomonhan, the pact and
    the partition of Poland, the Baltic bases, the Winter War. AT: every 1938–39 event fires on its date; land owned as
    history had it on 1 October 1938, 1 April 1939 and 1 October 1939 ≥ 95 % of land cells (the historical maps as
    rings, in the timeline's data).
  - [ ] R62g 1940–41: Denmark and Norway, the Low Countries and France (the armistice, Vichy and the occupied zone),
    Italy's entry, the Baltic annexations and Bessarabia, the Second Vienna Award, the Tripartite Pact, Greece and
    Yugoslavia (Croatia), North Africa, Barbarossa, Iran, Pearl Harbor and the Pacific opening. AT: each event on its
    date; Paris taken within 30 days of 14 June 1940; owners match history on 1 July 1940 ≥ 90 % and control on
    1 December 1941 ≥ 75 % of land cells.
  - [ ] R62h 1942–45: the Pacific, Stalingrad, El Alamein and Torch, Italy's surrender and the Italian Social Republic,
    Bagration, D-Day, the switches of Romania, Bulgaria and Finland, Germany's surrender (8 May 1945), Hiroshima and
    Nagasaki, Manchuria, Japan's surrender (2 September 1945). AT: each event on its date; control matches history on
    1 November 1942 and 6 June 1944 ≥ 75 %, owners and control on 1 June 1945 ≥ 85 % of land cells; the two scripted
    strikes the only nuclear ones.
  - [ ] R62i 1945–53: the occupation zones, Poland moved west, Austria, the Philippines, India and Pakistan, Burma,
    Ceylon, Israel, Indonesia, the Chinese civil war (the People's Republic, the Republic on Taiwan), the two Germanies,
    the two Koreas and the Korean War to the armistice, Japan's sovereignty (1952); the new nations' names, colours and
    flags. AT: each event on its date; owners match history on 1 January 1950 and 27 July 1953 ≥ 90 % of land cells;
    the world free after the last event (a war of the AI's own within 5 years on most of 10 seeds loaded from 1953).
  - [ ] R62j Intervention and the player's view: the first God Mode act, editor edit or taking of a nation (a command
    of the pending queue of those kinds; listed in a test) ends the track and reseeds at that hour; a line under the
    date while the track runs (the next event and its date), the end's row in the History, the events' rows in the
    ticker with their historical names. AT: each listed kind, given at 6 h, 1, 30 and 365 days, ends it, reseeds, and
    no event fires after; screenshots at world zoom on phone and desktop sizes.
  - [ ] R62k The checker and the accuracy measure: `historyTrack` in `tests/helpers/` (no timeline event refused but
    those skipped by rule, no war or peace not on the timeline while it runs, diploInvariants through the track) on 5
    seeds and on the scenario's own; `tools/diag/historyMatch` printing each checkpoint's share of land cells matching
    history (owners, control). AT: the checker green on all 6; `historyMatch` meets R62f–i's bars on the scenario's
    seed; tick time over the track within 5 % of plain 1938's (`npm run sim -- --affinity 0xFFFF`).
