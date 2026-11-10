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

- [ ] R59 **Run 60's non-blocking findings.**
  - [ ] R59a R60-N1: "they come back for it in about a day" for 4.3 days with an empty group idle at the port (31173,
    setup 3517, two groups; `critic/scripts/c60_nvtrace.ts`): the figure counts what holds the empty group, or the
    empty group sails for the one waiting. AT: 31173's 366 told a figure that comes true within a day.
  - [ ] R59b R60-N2: the transports come back and sail again without the one told it waits for them (31127, setup
    15101, one group; 272 sails 8.5 days after "about 4 days"). AT: 272 on the next voyage of its group.
  - [ ] R59c R60-N3: ticker order rows with a relative figure dated as war rows are. AT: 31211's "about 6 days" row
    dated at h114.
  - [ ] R59d R60-N4: at landscape sizes (667 × 375 to 1024 × 500) the nation panel's foot above the bottom bar. AT:
    `c58_peacebtn` 30403 at those sizes, the last row whole.
  - [ ] R59e R60-N5: `seaBattlesLook` does not fail a listed battle with no fleets left to draw (31501 t17369). AT:
    `seaBattlesLook` on 31501 exit 0, that battle "no fleet to see".
- [ ] R60 **Run 61's non-blocking findings** (the full run, on `d971a46b`: no blocking issue, every dimension at 8).
  - [ ] R60a R61-N1: at landscape sizes (844 × 390, 932 × 430, 1024 × 500) an ordered landing's bar lies over the nation
    panel's ×, so a tap on × opens the landing (21103, England's four from Portsmouth to Bremerhaven; a regression since
    run 55, the panel widened under the bar). AT: `node critic/scripts/c61_x_closeblock.mjs 21103 844 390` gives
    `atClose` the `nation-close` button and `clickOk` true; `c55_lbox` 21103 and 32223 at 844 × 390 run their six days.
  - [ ] R60b R61-N2: with a scenario file chosen on the title screen, the big Start starts plain 1938 and drops the file
    (32441); "No file chosen" beside the chosen file; the card's Cancel unstyled. AT: `MAINSTART=1 node
    critic/scripts/c61_x_editor.mjs 32441` keeps the paint, or the main Start is not offered while a file is pending.
  - [ ] R60c R61-N3: a truncated scenario file is told "Could not load: Failed to fetch". AT: the first 2,000 bytes of an
    exported file told the file is damaged or incomplete.
  - [ ] R60d R61-N4: random worlds of 2 or 3 nations have no war in 10–15 years (32403). AT: 3 nations sharing a border
    at war within 10 years on most seeds, or the count's floor raised to where wars start (SPEC says which).
  - [ ] R60e R61-N5: History's same-day rows can read backwards (32019, 2 December 1957: the peace above the
    annexation). AT: same-day rows in the order they happened.
- Batch 14 ends with no critic run (ADR-920): the next run comes after Batch 15.
- Not filed: R61-SC, 3 of 300 (1.0 %; 32167 Japan's 366 twice, and 32115 England's 274, the first not Japan's: both
  transport groups sailed full without it, its "about 5 days" true). R60-SC, the `slowClick` tail (30041, 31099, 203997, 204017, all Japan's 366/367 from Tokyo), under the 5 %
  rule; ADR-914's proposal 2 held. The old small items (27125's ticker rows, the phone's panel over the corridor).

## Batch 15 — the historical track (the user's request, ADR-919, ADR-920)

A replay of 1938–1953 as it went, as SPEC §7.7 designs it: a scenario of its own, a dated timeline given as commands,
the AI's free choices off and its offensives steered while the track runs, ended for good by the player's first
intervention or on 27 July 1953. Then the critic (one run for Batches 14 and 15).

- [ ] R62 **The historical track.**
  - [ ] R62a The scenario and the runner: `1938h` listed on the title screen ("1938 — Historical", its preview, fixed
    seed, no seed on its form); `timeline.json`'s schema and its check in `npm run data -- --check`; rings baked to
    cells; the runner giving each due event as commands at its hour, skipping one that no longer applies with a row
    saying so; the track's state saved; dormant nations born on their date. AT: a test timeline of every event kind
    fires each on its hour (all of them, 0 late); save and load mid-track bit-identical and the run after the load
    equal to the uninterrupted one; plain 1938's seed-99 pin unmoved (or moved in its own commit by a section the
    track adds, ADR-919).
  - [ ] R62b The steering: while the track runs, the strategic AI's own declarations, stalemate peace, pacts,
    coalitions, rival drift, collapse, revival and nuclear decision off; war-phase objectives weighting the
    operational AI's sectors and naming the invasion AI's landings. AT: on a test war with one objective, the
    attacker's allotted strength in sectors facing it ≥ 2× the plain AI's on the same save (A/B from one
    `sim.save()`); in a 2-year headless run no war, peace, pact or nuke but the timeline's.
  - [ ] R62c 1938–39: the Anschluss, Munich and the Sudetenland, the First Vienna Award, the end of Czechoslovakia
    (the Protectorate, Slovakia, Carpatho-Ukraine), Memel, Albania, the end of the Spanish war, Nomonhan, the pact
    and the partition of Poland, the Baltic bases, the Winter War. AT: every 1938–39 event fires on its date; land
    owned as history had it on 1 October 1938, 1 April 1939 and 1 October 1939 ≥ 95 % of land cells (the
    historical maps as rings, in the timeline's data).
  - [ ] R62d 1940–41: Denmark and Norway, the Low Countries and France (the armistice, Vichy and the occupied zone),
    Italy's entry, the Baltic annexations and Bessarabia, the Second Vienna Award, the Tripartite Pact, Greece and
    Yugoslavia (Croatia), North Africa, Barbarossa, Iran, Pearl Harbor and the Pacific opening. AT: each event on its
    date; Paris taken within 30 days of 14 June 1940; owners match history on 1 July 1940 ≥ 90 % and control on
    1 December 1941 ≥ 75 % of land cells.
  - [ ] R62e 1942–45: the Pacific, Stalingrad, El Alamein and Torch, Italy's surrender and the Italian Social
    Republic, Bagration, D-Day, the switches of Romania, Bulgaria and Finland, Germany's surrender (8 May 1945),
    Hiroshima and Nagasaki, Manchuria, Japan's surrender (2 September 1945). AT: each event on its date; control
    matches history on 1 November 1942 and 6 June 1944 ≥ 75 %, owners and control on 1 June 1945 ≥ 85 % of land
    cells; the two scripted strikes the only nuclear ones.
  - [ ] R62f 1945–53: the occupation zones, Poland moved west, Austria, the Philippines, India and Pakistan, Burma,
    Ceylon, Israel, Indonesia, the Chinese civil war (the People's Republic, the Republic on Taiwan), the two
    Germanies, the two Koreas and the Korean War to the armistice, Japan's sovereignty (1952); the new nations'
    names, colours and flags. AT: each event on its date; owners match history on 1 January 1950 and 27 July 1953
    ≥ 90 % of land cells; the world free after the last event (a war of the AI's own within 5 years on most of 10
    seeds loaded from the 1953 state).
  - [ ] R62g Intervention and the player's view: the first God Mode act, editor edit or taking of a nation ends the
    track (each command kind listed in a test); a line under the date while the track runs (the next event and its
    date), the end's row in the History, the events' rows in the ticker with their historical names. AT: each of the
    listed kinds, given at 6 h, 1, 30 and 365 days, ends it and no event fires after; screenshots at world zoom on
    phone and desktop sizes.
  - [ ] R62h The checker and the accuracy measure: `historyTrack` in `tests/helpers/` (no timeline event refused
    but those skipped by rule, no war or peace not on the timeline while it runs, diploInvariants through the track)
    on 5 seeds and on the scenario's own; `tools/diag/historyMatch` printing each checkpoint's share of land cells
    matching history (owners, control). AT: the checker green on all 6; `historyMatch` meets R62c–f's bars on the
    scenario's seed; tick time over the track within 5 % of plain 1938's (`npm run sim -- --affinity 0xFFFF`).
