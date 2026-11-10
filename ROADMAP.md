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
- Not filed: R61-SC, 3 of 300 (1.0 %; 32167 Japan's 366 twice, and 32115 England's 274, the first not Japan's: both
  transport groups sailed full without it, its "about 5 days" true). R60-SC, the `slowClick` tail (30041, 31099, 203997, 204017, all Japan's 366/367 from Tokyo), under the 5 %
  rule; ADR-914's proposal 2 held. The old small items (27125's ticker rows, the phone's panel over the corridor).
