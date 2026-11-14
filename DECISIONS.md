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
