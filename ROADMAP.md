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

## Batch 25 — run 67's "not 9" items (the user's decision, 2026-11-14, ADR-1032: before Batch 24)

- [ ] R81 **Run 67's "not 9" items.**
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
  - [ ] R81f A battle's labels at 250 m/px (semantic zoom; 39915 day 5): no label over another, and each engaged
    formation's (or its stack's) shown. AT: the overlaps counted on the critic's case and two seeds, 0; the labels'
    count no lower than the stacks in view.
  - [ ] R81g The followed fighter's mark at 250 m/px (aircraft): its median distance from its sorties at most 40 px (the
    critic: 392 on 39927, 68 on 35127), 3,000 m/px as before (median ≤ 32). AT: `w_wing` on both seeds and one new.
  - [ ] R81h 120 m/px over the late world (performance): 7019's year-20 world at Max, 52.5-55.8 fps there (60 at the
    other zooms). Profiled first. AT: the minimum of the critic's samples at 120 m/px at least 57 fps, the other zooms
    kept; or the cause answered with numbers in BLOCKERS (PROMPT step 10).

## Batch 24 — the replay to 1991 (the user's request, 2026-11-14; ADR-1031, after Batch 25)

Split as R69 and R71 were (1938-75 kept bit for bit, then the new years by period). Each item's AT keeps the nine replay
tests and the track's checker green, and the 38 yearly starts of 1938-75 at their hashes unless the item says why not.

- [ ] R80 **The replay to 1991.**
  - [ ] R80a The research: `docs/research/1976-91.md`, as `1963-75.md`: each event by date (checked against a second
    source), the nations to add with their land, the regimes, the wars and their fronts, the arsenals, and the maps
    to match at each period's end. AT: every event of R80f-i in it with its date and source; the nations' list.
  - [ ] R80b A bloc that ends: an event dissolves a bloc (the Warsaw Pact, 1 July 1991) and members leave it before
    (1989-90); after it NATO the one lasting bloc, Russia and the CIS a pact outside the deterrence rule (ADR-1031's
    answer 3). AT: a
    unit test of the event; the blocs' checker on four seeds; 10 years after a 1991 end, the rule the answer names.
  - [ ] R80c A great power's breakup and two unions: the Soviet Union into fifteen on 26 December 1991 (its army, navy
    and air by the land they stand on; its arsenal as ADR-1031's answer 2), Germany on 3 October 1990, Yemen on 22 May
    1990, with the existing `transfer`, births and annexations where they serve. AT: unit tests of each; worldInvariants
    on the end hour of four seeds; no formation of a dead nation left.
  - [ ] R80d The nations of 1976-91 added dormant (the Soviet successors, Macedonia, Namibia, Zimbabwe, Eritrea's and
    the period's rebel movements), the end moved to 31 December 1991 with no new event. AT: 1938-75 unchanged; the
    yearly starts to 1991 built and their time on the Pages workflow measured (the deploy within its limit).
  - [ ] R80e Later techs (about 1976-91) as stat upgrades of the existing units (or the unit ADR-1031's answer 4 names).
    AT: the techs held by 1991 by the great powers and by few new states; the pin moved only as the techs explain.
  - [ ] R80f 1976-80: Angola's war and Cuba's troops, the Ogaden, Vietnam into Cambodia and China into Vietnam, Uganda
    and Tanzania, Iran's revolution, the Soviet Union into Afghanistan, Nicaragua, Zimbabwe. AT: as R71d: the map of
    the period's end matched as the earlier maps; each event on its date; seeds 1-5 within the bars.
  - [ ] R80g 1981-85: Iran and Iraq, the Falklands, Lebanon, Grenada, Poland's martial law, Chad and Libya. AT: as R80f.
  - [ ] R80h 1986-89: Chad's war against Libya won, the Soviet Union out of Afghanistan, Panama, the revolutions of
    1989 (regimes and the Eastern Bloc left). AT: as R80f.
  - [ ] R80i 1990-91: Namibia, Germany and Yemen united, Kuwait taken and freed, the Baltic states, Slovenia and Croatia,
    the Soviet Union's end. AT: as R80f; the arsenals at the end as ADR-1031's answer 2.
  - [ ] R80j The world after 1991: the blocs, the historical focus and aid re-measured from the 1991 handover, as R71g;
    the start card's powers and previews for each new year. AT: as R71g's; the card's powers per year equal the
    deployed `years.json`.
  - [ ] R80k (ADR-1031's answer 5) The dominions free on their date in the track's data, the 1938 start
    unchanged. AT: Canada, Australia and South Africa no one's puppets at the yearly starts after it; the replay tests.
