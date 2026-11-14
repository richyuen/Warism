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

### ADR-1031 · 2026-11-14 · proposed, the user's decision — The replay to 1991: the plan and its questions
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
