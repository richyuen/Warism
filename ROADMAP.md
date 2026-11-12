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

- [ ] R66 **Armies on the replay's fronts.** The script decides the outcome; armies stand and fight on each stage's
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
  - [ ] R66d Fighting before a stage (the user's choice, ADR-974): for FIGHT_DAYS (about 5-7) before each stage the
    hold is lifted inside the stage's area (its ring's box and 120 km) for its taker's side and their foes there; land
    changes hands across it only to the taker's side, only of the land the stage gives; no buff at first; the stage
    applies at its date as now. AT: both sides engaged at the stage's hour at ≥ 2/3 of the large land fronts (the
    census, its land and size fixed at the window's opening); each side's men lost in the window and the share of the
    stage's land taken by the fighting reported; the bars above.
  - [ ] R66e The 1946-53 stages (the civil war in China, Korea: `transfer`s) measured as R66a's; their armies by
    R66b-d's rules where those apply, or the reason not.
- [ ] R67 **Cold War blocs in the sim.** Lasting blocs under the strongest powers; war between their leaders held back
  by deterrence; rivalry by proxies. A rule of every game. AT (to be split): after the replay's end no war between
  the blocs' leaders in N years on the own seed and others; the sweep's bands kept.
- [ ] R68 **A start from any date of the replay.** A timeline slider in place of "World, 1938" and "World, 1938 —
  Historical"; continue the replay or free from there.
- [ ] R69 **The replay past 1953**, to 1962 for now (the user's decision, ADR-959).

