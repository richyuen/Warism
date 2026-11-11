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

## Batch 17 — run 63's findings (full, on `78b082b4`: no blocking issue, every dimension at 8)

- [ ] R65 **Run 63's non-blocking findings** (the historical track).
  - [ ] R65a R63-N1: at Max the "Next" line is missing in 24.5 % of samples (hidden from its event's hour to the next
    stats, R64f's fix). AT: in `node critic/scripts/c63_h_blank.mjs 120 1600 900 99` the line present in ≥ 95 % of
    samples while the track runs, and never past.
  - [ ] R65b R63-N2: the God tab ends the replay unsaid ("World AI" and its 40 controls, the note scrolled out or read
    as the map tools'). AT: in `node critic/scripts/c63_h_godtab.mjs 1600 900 god-world-ai` a note that an act ends the
    replay in view at the God tab's head.
  - [ ] R65c Small, from run 63: the 18 August 1945 Manchukuo triple in the History; the bar's note grey where the
    panel's is red; the track's line ~10 px on a phone; a started scenario file grey for 2-3 s. AT: each seen fixed in
    its probe (`c63_hist.mjs`, `c63_h_god.mjs`, `c63_h_phone.mjs`, `c63_x_loadfile.mjs`).
  - Not taken (design objections, no score lowered): the 1942-44 battles painted, not fought (SPEC §7.7, ADR-935);
    the world after 1953 forgetting the blocs; the same history every game (ADR-919); a confirm before the first act
    (ADR-952 chose notes). Each a design question for the user, not an item.

## Batch 18 — after release-2026-11-11 (the user's decision, ADR-958)

In this order, after Batch 17. Each split into lettered parts with their ATs when started.

- [ ] R66 **Armies on the replay's fronts.** The script decides the outcome; armies stand and fight on each stage's
  front (Stalingrad, Normandy and the rest), strong enough to win it by the fighting where that leaves the rest of the
  replay unharmed (`historyMatch1938h`, `historyTrack1938h` green). AT (to be split): critic run 63's census
  (`critic/scripts/c63_census.ts`) finds the stage's sides' formations in its box at its dates.
- [ ] R67 **Cold War blocs in the sim.** Lasting blocs under the strongest powers; war between their leaders held back
  by deterrence; rivalry by proxies. A rule of every game. AT (to be split): after the replay's end no war between
  the blocs' leaders in N years on the own seed and others; the sweep's bands kept.
- [ ] R68 **A start from any date of the replay.** A timeline slider in place of "World, 1938" and "World, 1938 —
  Historical"; continue the replay or free from there.
- [ ] R69 **The replay past 1953.** Its end date the user's when started.

