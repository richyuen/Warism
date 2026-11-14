# Decisions (ADR log)

Format: ID · date · status · decision · why · consequences. Deliberate deviations
from AoC are tagged **[AoC-DEVIATION]**.

---

> The ADRs before the last release tag are in `docs/history/`: `DECISIONS-<YYYY-MM>.md` (October) and
> `DECISIONS-<release tag>.md` from November on (ADR-805, ADR-918), in the order they had here. Search them by number (`grep -rn "ADR-623 " DECISIONS.md docs/history/`).


### ADR-1030 · 2026-11-14 · accepted (the user's decision) — The sweep's share caps reported, not judged
- **The user:** "For the limits criterion, can we remove so it doesn't always read failing?"
- **Found:** of the 61 limit failures in `docs/sweeps/`, 55 are the largest nation's share at the end (income over 40 %
  45 times, land over 35 % 10 times); land moving 4, nations alive 2. The release sweep of 2026-11-13 read FAILING on
  them alone (6 of 10), every other criterion green.
- **Decision:** `MAX_LAND` and `MAX_INCOME` are reported, not judged, as stasis is (ADR-750): the report marks them
  "under" or "over" and counts the seeds over; a seed's limits are land moving, nations alive and years at war. The
  constants stay so the reports compare. `tools/sweep/criteria.ts`, `run.ts`, SPEC §10, `sweepCriteria.test.ts` (a
  hegemon and a rich leader reported, the seed passing).
- **Read:** the release sweep judged again (`--from docs/sweeps/2026-11-14-sweep-release79.json`): ALL GREEN, the
  largest share over its bar on 2 seeds by land and 3 by income.

### ADR-1031 · 2026-11-14 · accepted (the user's decisions) — The replay to 1991: the plan and its questions
- **The user:** "Let's also make a plan to extend history to 1991." The plan is ROADMAP's Batch 24 (R80a-k), split
  as R69 and R71 were: the research first, the rules the period needs, the nations and the end moved, then the events
  by period, then the world after the end.
- **What the period needs that the game lacks** (found 2026-11-14):
  - Nations: none of the twelve Soviet successors but the Baltic three (Ukraine, Belarus, Moldova, Georgia, Armenia,
    Azerbaijan, Kazakhstan, Uzbekistan, Turkmenistan, Kyrgyzstan, Tajikistan; Russia is the Soviet Union's heir), no
    Macedonia, Namibia, Zimbabwe (no ZIM or RHO tag), Eritrea; the Baltic three, Slovenia, Croatia, both Germanys and
    Kuwait are in.
  - A bloc that ends: R67's blocs last for ever; the Eastern Bloc dissolves from 1989 (the Warsaw Pact on 1 July 1991)
    and the Cold War's rules (deterrence between the leaders, aid to the other side) have one leader left.
  - A great power's breakup: the Soviet Union's army, navy and arsenal divided on 26 December 1991; two unions
    (Germany on 3 October 1990, Yemen on 22 May 1990).
  - The deploy: `npm run saves` to 1975 takes about 7 min (CLAUDE.md; 377 s locally after R72); 16 more years of
    the late world, probably about 10 min, measured in R80d.
- **Questions for the user** (the batch waits on them; recommendations given):
  1. Its order: before or after the critic's "not 9" items (the reply of 2026-11-14 lists them)? Recommended: the
     critic's small items first (one sitting each), then the replay.
  2. The Soviet arsenal at the end: Russia's alone (recommended: history's outcome by 1996, and no new nuclear power
     made for four years), or where it stood (Ukraine, Belarus, Kazakhstan hold theirs at the handover)?
  3. The world after 1991: NATO kept as the one lasting bloc, Russia and the CIS a pact with no deterrence rule
     against it (recommended), or the Cold War's rules kept with Russia as the second leader?
  4. New units (attack helicopters, missile submarines; ADR-991 left them for a longer horizon): none, the period's
     techs as stat upgrades (recommended), or one of them as a unit?
  5. Canada, Australia and South Africa Britain's puppets (ADR-17; the critic's objection since run 66), 53 years on at
     the end: free at a date of the replay (recommended: the Statute of Westminster's dominions free in the track's
     data, as R74c's names), or kept?
- **Answered** (the user, 2026-11-14: "let's accept your recommendations and also do the critic's items first"): 1. the
  critic's items first (Batch 25, ADR-1032), then Batch 24; 2. the Soviet arsenal to Russia alone; 3. NATO the one
  lasting bloc after 1991, Russia and the CIS a pact outside the deterrence rule; 4. no new unit, the period's techs as
  stat upgrades; 5. Canada, Australia and South Africa free on their dates in the track's data (R80k taken).

### ADR-1032 · 2026-11-14 · accepted (the user's decision) — Batch 25: run 67's "not 9" items, before the replay to 1991
- **The user:** the critic's items first, "though let's make sure there's a performance bar for one-step undo".
- **The items** (ROADMAP R81a-h): the free world's far conquests after 1975 (measured first: R78b's sea cost came after
  the critic saw them); a one-step undo of a God act; a burst readable at world zoom; Germany's and Poland's flags at
  250 m/px; the relations graph's labels and truces; a battle's labels at 250 m/px; the followed fighter's mark at
  250 m/px; 120 m/px over the late world.
- **The undo's bar, from a measure:** a world save of seed 99 (headless, tsx) is 3.1-4.0 MB and takes 50-52 ms (median
  of 7, years 0, 1 and 5), a load 75-79 ms. The undo holds one save, made in the worker before each God act (not each
  tick). Its AT: on 7019's year-20 world on the page, (1) the time from a God act's click to its effect drawn, p95
  over 20 acts, at most 100 ms more than with the undo off; (2) no frame of the map over 50 ms while the save is made
  (the render thread is not blocked); (3) from Undo's click to the restored world drawn at most 500 ms, p95 over 20;
  (4) the tick's mean with no act unchanged within ±3 % (paired runs), and the worker's memory at most one save more
  (one held, never one per act); (5) after an undo the world's hash is the one before the act and the run goes on bit
  for bit as one never acted on (30 days, two seeds).

### ADR-1041 · 2026-11-14 · accepted — R82d: a war on a neighbour by a colony costs its distance
- **Context.** R68-N2: France took Brazil's capital within two years of plain 1938 on 4 of 5 seeds (6161, 41161, 41163,
  41167), 8,220-9,172 km from Paris. Brazil is France's land neighbour by French Guiana (and Britain's by British
  Guiana, whose war brought France in on 6161), so R78b's cost of a war across the sea never applied.
- **Decision.** `homeNeighbours`: the nations bordering the land of `n` joined over its own provinces to its capital. A
  land target not among them costs `colonyWarCost`, SEA_KM_COST (0.1) for each 1,000 km from `n`'s capital to that of
  `t`'s realm, as a war across the sea does. A capital on no land of its own: no cost.
- **Read.** `farConquests 0` on 6161, 41161, 41163, 41165, 41167: Brazil's capital taken on 0 (was 4); capitals taken
  32.8 a seed (was 33.0), far ones 9.8 (was 9.2: Brazil now takes Venezuela's and Colombia's, the rest in Europe).
  First-60-day declarations over 6,000 km: 0 of 97 on 41821-41839 (run 68: 3), 1 of 96 on 39821-39839 (run 68: 2).
- **Pin.** Seed 99's year-one hash 95d9261f → 401d6856.

### ADR-1040 · 2026-11-14 · accepted — R82b: a stage's land taken in its window goes to its taker
- **Context.** R68-N4: in D-Day's 50-day window the Allies took 0 of the beachhead's 51 cells and lost 137-142k
  against 17-39k. The cause: Normandy is Vichy's land held by the Germans; a track arrival on land of an owner at peace
  with it holds no cell (R74g), and land is only taken from a neighbouring cell held, so the Allies could take none; a
  cell taken from the Germans would have gone to Vichy, its owner, at peace with the taker. Kept arrivals freed only 7
  days before their stage was also tried: no difference (23 cells on 1938 either way), so it is not in.
- **Decision.** In a stage's open window (`Track.takeOpen`): a track arrival holds its landing cell of that stage's land
  whatever its owner, and a cell of it taken goes to the taker, not freed to its owner, as the stage will give it.
- **Read.** `trackFronts` on 1938, 37701, 38701, 39701, 41701: 23, 23, 22, 17 and 15 of 51 cells taken in the window;
  the Allies lose 26-34k against the Germans' 36-58k. Track-only: plain games and the pin unchanged.

### ADR-1039 · 2026-11-14 · accepted (the user's decision) — The critic runs when every batch is done
- **The user:** "Can we make a rule to not run the critic until all open batches are done?"
- **Decision:** the critic is spawned only when no batch in ROADMAP.md has an open item (PROMPT.md "RELEASES", the
  critic agent's description). A batch finished while another is open goes on to the other's items; the items a
  critic run files are done with every other open item before it runs again. The rest of RELEASES is as it was.
- **Why:** a run judged between batches judges code the next batch changes (Batch 24 rewrites the replay to 1991
  after Batch 25), and a run costs hours.
- **Now:** a run was spawned after Batch 25 under the old rule while Batch 24 and R81i are open.

### ADR-1038 · 2026-11-14 · accepted — R81g: a followed wing is marked on its planes
- **Found:** the followed wing's mark stood at the wing's place in the stats; a patrolling wing's planes are drawn
  circling it at a radius of the view's (`ORBIT_VIEW`, PLAN 7.24c), so the closer the zoom the farther from the mark:
  at 3,000 m/px a median 31-32 px (the critic's and HEAD's), at 250 m/px 70 on 39927 and 265 on 35127 (HEAD,
  `tools/diag/wingMark.ts`, the critic's `w_wing` as a tool; the critic's own 392 and 68).
- **Decision:** a sortie's snapshot row carries its wing's id (`SORTIE_STRIDE` 11 → 12; the specs that index rows by
  hand and `sortiesDrawn.test.ts` with it); `PlacedSortie.wing`; the mark stands on the followed wing's planes as drawn
  this frame (`MapView.markedWingId`), and at its place when none are in the view. The camera's follow keeps the
  place, so the circle stays in the view.
- **Read after:** median 0 px at 250 and 3,000 m/px on 39927, 35127 and new 39929 (p90 the samples whose planes are
  out of the view). The critic's probes that index sortie rows by 11 need 12.

### ADR-1037 · 2026-11-14 · accepted (the user's decision) — R81f met on HEAD; the tags not in contact one line at a battle
- **Read** (`tools/diag/battleTags.ts`, the critic's `c_battle` case: Germany at war with Poland, the camera at
  250 m/px on the first engaged German armour, day 4, and on its infantry; seeds 39915, 7781, 39917, alike to the
  element): 25 tags for the 25 formations in view, none overlapping, none left unplaced, the 10 engaged all named,
  none of the engaged formations' 292 elements in view under a tag. R81f's bar holds with no change; it is closed.
- **What the critic saw** ("the 250 m/px labels crowd a battle", `critic/shots/c67c_39915_arm_0250m.png`): every
  formation in view has its tag by it, so a front of 25 formations at 1600 × 900 shows 25 boxes and their lines.
- **The question:** whether, at 250 m/px and nearer with a battle in view, the tags of formations not in contact
  should fade to their flag and strength (one line, no name) or go, leaving the fighting ones whole. It shows less
  (a reserve's name is read by a tap), so it is the user's to choose; nothing is changed until then.
- **The user:** asked for a recommendation, then "Yes" to it: at 250 m/px and nearer, with an engaged formation in
  view, a tag of a formation not in contact is one line, its flag and strength (no name); the engaged ones keep the
  whole tag; a selected or hovered formation's tag whole. Not hidden (a reserve's place and strength are what is
  read next), not faded at full size (the space is the crowding). Zoomed out, or no battle in view, as now. ROADMAP
  R81i, after the critic's run.

### ADR-1036 · 2026-11-14 · accepted — R81e: the relations graph names everyone tied; a truce its own line
- **Read first** (`tests/e2e/relationsNamed1938.spec.ts` on HEAD, 39939/41/43 a year on): of the 37-43 nations at
  war or allied, 20-27 unnamed in the whole graph at a desk and on a phone. Below zoom 2 a node was named only if
  large or with four lines. The truces all had their dashed line; one with a nation also tied otherwise (Lithuania,
  Germany's puppet, in the critic's shot) lay exactly under the other line, so only the footer told it.
- **Decision:** every nation a label candidate, ranked: the chosen, the focus, those at war or allied, the rest by
  size. `placeLabels` tries sixteen directions at eight distances (a leader to one off the rim) and puts no label over
  another nation's node. The nodes shown are drawn stretched to fill the drawing (each axis at most 2.5 times; the
  layout's forces have one size at any height), and on a phone (≤ 600 px) the drawing is 900 high, not 440 (the panel
  then about 490 px of graph). Two or more lines of one pair are bent apart (`BEND_PX`).
- **A test changed with the feature:** R11's phone case (`heroesRead1938.spec.ts`) required zooming in to name more
  than the whole graph; the whole graph now names all 72, so it checks what its message says, every nation in the
  zoomed view named.
- **Read after:** every case named, none overlapping, every truce between living nations its own line (12-18).

### ADR-1035 · 2026-11-14 · accepted — R81d: the bar passed on HEAD; the label flag framed light
- **Read first** (`tools/diag/flagPairs.ts`, 39915 day 5, 250 m/px, the flags read from the overlay as drawn): Germany's
  and Poland's flags differ in 60 % of their pixels by over 60, over R81d's bar (30 %) with no change. The bar, my own,
  did not name the critic's fault: Germany's black third sits on the tag's dark ground inside a dark outline, so the
  flag's top edge is lost and what is seen is white over red with a thin dark band.
- **The column added:** the ring one pixel out of the flag against the tag's ground: the share of its pixels over 60
  from it. HEAD 0 % for both flags.
- **Decision:** the tag's flag framed light (`TAG_FLAG_EDGE`, rgba(196, 202, 210, 0.95)) for the dark one: the edge
  100 % for both, the pixels 70 %; the shots before and after looked at, the German tricolour read as one.
- **Listed, not changed:** the pairs at war in year 1 under 30 % (on 39915 and 7019) are red flags with a white
  device (SOV-TUR, TUR-OMN, ALB-TUR), red-white-red (LAT-SOV) and Switzerland's cross against Tunisia's crescent; the
  pictures are the nations' own, and their name and colour bar stand beside them on the tag.

### ADR-1034 · 2026-11-14 · accepted — R81b: the God Mode undo; what it tells, and the replay
- **The conflict:** R81b's line said the undo is "told in the bar and the ticker" and "ends nothing the act did not (the
  replay stays ended)"; ADR-1032's bar 5, the user's, says after an undo the hash is the one before the act and the run
  goes on bit for bit as if never acted on. A ticker row written into the world, or the replay kept ended, changes the
  hash. Bar 5 wins: the undo is said on the God Mode bar only ("Undone: the world as it was on …", until the next act),
  and an act that ended the replay is undone with the replay running again. Said first to the user in the next message.
- **Decision:** a God Mode act is one click of a tool or the God tab, or one dragged stroke of the brush, by its sender
  (`hud.command(cmd, 'act' | 'more')`; the editor, a player's orders and setPlayer send none). The worker copies the
  state's sections before an act's first command and holds one; it is kept only if one of the act's commands was
  carried out; any other command, a load and a new game drop it; `undo` loads it through the load's own reset.
- **The bars' first read failed bar 1:** a save in the browser's worker takes ~95 ms (50 in Node), and the act waited
  for it (+108 ms p95). The copy is of the sections (~10 ms, ~40 MB for a moment), packed into a save's bytes 300 ms
  after the act (`PACK_AFTER_MS`), once its stats are on the page.
- **Read** (`tools/diag/undoBars.ts`, RTX 4070 Ti, 7019 year 20, 20 a bar): the act's command to its stats drawn p95
  57.2 ms against 41.7 with no copy (+15.5, bar 100); the page's longest frame in the acts' windows 16.8 ms (bar 50);
  Undo to the loaded world drawn median 314 ms, p95 317, max 415 (bar 500); the tick with an undo held / none over six
  alternated pairs of 2,000 ticks from one save × 1.005 (bar ±3 %). Bar 5 and the one save:
  `tests/unit/godUndo1938.test.ts`; the world's and diplomacy's rules hold after an undone revolt on seeds 5 and 7.

### ADR-1033 · 2026-11-14 · accepted — R81a: a bloc is a defensive pact; R81a's bar re-scoped
- **Context.** Critic run 67's design objection: a free game from 1975 takes capitals far afield within months (Britain
  Jordan's, Poland Algiers). R81a's AT, written before any measure, asked for at most 1 a seed of capitals taken over
  2,000 km from the taker's capital in two years.
- **Measured** (`tools/diag/farConquests.ts`, new): plain 1938 itself has 9-12 such a seed, so the bar was never
  reachable and is re-scoped (my own unmeasured bar, not a user's). The measure too: a capital once for each taker and
  loser (a moving capital fell again and again), and far when the taker's realm held no land within 500 km of it at the
  start (great countries marching on a neighbour's capital are not the objection). On 6161 and 40011-40017 a free 1975
  game took 21.6 far capitals a seed, 14.0 per 100 nations alive against plain 1938's 9.4 (× 1.5). Of those in a war
  the taker did not lead, 39 of 53 came through NATO, on the attackers' side: NATO's members followed Turkey on Egypt
  and Iraq and Greece on Algeria and took capitals 4,000-14,000 km from home. In a nation's own wars the rate per nation
  was plain 1938's (7.1 against 6.3 per 100).
- **Decision** (`declareWar`, `src/sim/systems/war.ts`): where the blocs are (ADR-981: the track's games once it has
  ended, an arsenal in the world), a bloc is a defensive pact. None of it is called to a member's war of its own making
  (an attacker of a bloc calls no ally); to a member's defence its leader comes at any distance and the other members
  only within reach (`WAR_REACH_KM`), as an attacker's ally does (R53l); guarantors as before. Plain games, the replay
  while it steers and the yearly starts are untouched (no blocs): the pin of seed 99 unchanged.
- **The AT re-scoped:** far capitals per 100 nations alive in the first two years of a free 1975 game at most 1.2 ×
  plain 1938's on the same seeds, read on seeds no tuning saw; the first month's declarations per nation at most 1.2 ×
  plain 1938's (ADR-1015's bar).
- **Read.** Eight unseen seeds (40101-40115, odd): far capitals per 100 nations 13.6 → 10.4, plain 1938 10.4 (× 1.30 →
  × 1.00; paired difference −0.03, se 1.08); of 109 far capitals 105 now in the taker's own war. The first 30 days:
  28 declarations on 5151, 6161, 40101, 40103 against plain 1938's 19, per nation × 0.98 (on 6161 alone × 1.32: its
  1975 count 10 with or without the rule, the critic's; plain 1938's 5, 6 before R78b's pin). `afterTrack.ts 1938 10`:
  both blocs whole every year (8 of 8, 14 of 14), their leaders never on opposite sides; 257 wars declared in ten years
  (the critic's run before: 268).
- **Stands on, checked green before and after:** ADR-887/889 (the reach; `realmWars`, `puppetDefended`, `alliances`
  tests), ADR-981 (`blocs1938`), ADR-990 (`blocAid1938h`), ADR-1009/1015 (`trackFocus1938h`), and the unit suite
  (`npm test`: 2,446, two timing tests red under load, green alone). `tests/unit/blocDefensive1938h.test.ts` (new) red
  without the rule.
