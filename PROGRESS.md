# PROGRESS (append-only)

> The log before the last release tag is in `docs/history/`: `PROGRESS-<YYYY-MM>.md` (October) and
> `PROGRESS-<release tag>.md` from November on (ADR-805, ADR-918). Search them; they are not read. The last
> entry before this file: `release-2026-11-13`.


## 2026-11-14 — The sweep's share caps reported (ADR-1030, the user's decision); the replay to 1991 planned (ADR-1031)

- The largest nation's share of land and income at the end is reported, not judged: 55 of the 61 limit failures in
  `docs/sweeps/` were these two. The release sweep judged again by `--from`: ALL GREEN (over its bar on 2 seeds by land,
  3 by income). `tests/unit/sweepCriteria.test.ts` 12 of 12.
- Batch 24, R80a-k: the replay to 1991, planned; its five questions in ADR-1031 wait on the user.

## 2026-11-14 — ADR-1031 answered; Batch 25 (run 67's "not 9" items) before the replay to 1991 (ADR-1032)

- The user took the five recommendations and asked for the critic's items first, with a performance bar for the undo.
  A world save of seed 99 measured headless: 3.1-4.0 MB, save 50-52 ms, load 75-79 ms (years 0, 1, 5); the undo's five
  bars in ADR-1032. Batch 25, R81a-h, filed above Batch 24.

## 2026-11-14 — R81a: a bloc is a defensive pact (ADR-1033)

- Measured first (`tools/diag/farConquests.ts`): a free 1975 game took far capitals at 1.3-1.5 × plain 1938's rate per
  nation, the excess NATO's members following a member's attack. Where the blocs are, a bloc is a defensive pact: none
  of it called to a member's own war, to its defence the leader at any distance and the others within reach. On eight
  unseen seeds far capitals per 100 nations 13.6 → 10.4 (plain 1938 10.4); first-month declarations × 0.98; blocs whole
  and leaders apart 10 years after the track. The AT's own bar (≤ 1 a seed) re-scoped: plain 1938 has 9-12.
- `tests/unit/blocDefensive1938h.test.ts` (red without the rule); `npm test` 2,444 of 2,446 green, the two timing tests
  green alone. Plain games and the pin untouched (no blocs).

## 2026-11-14 — R81b: a one-step undo of a God Mode act (ADR-1034)

- The bar's Undo takes back the last act: the worker copies the world before each act (one held) and loads it. Told on
  the bar only, and a replay the act ended runs again, as ADR-1032's bar 5 (bit for bit) needs. Copy at the act, packed
  300 ms after: the save's ~95 ms in the browser had made the act +108 ms.
- On the GPU, 7019 year 20: the act +15.5 ms p95, longest frame 16.8 ms, undo p95 317 ms, tick × 1.005.
  `tests/unit/godUndo1938.test.ts` 6/6, `tests/e2e/godUndo1938.spec.ts` (nine tools undone by their buttons) green.

## 2026-11-14 — R81c: a burst readable at world zoom

- Ground zero's mark: the blast radius's dark-edged amber ring about a dot, at least 18 px in radius, 20 s on the page's
  clock (the cloud is gone in 9 s and the fallout's shade was all the critic saw at 937 m/px). At 10.3 s: God's H-bomb
  on Paris 202 px across at 937 m/px and 66 at 3,000; 7019 year 20's first AI burst (atomic, August 1958) 58 and 42.
  `tests/e2e/burstMark1938.spec.ts`, `tools/diag/burstMark.ts`; `nukeFx` unit and e2e tests take the fourth part.
  Bench G on the GPU: T0 313.1 fps, T2 170.0 (release 313.3, 170.9).

## 2026-11-14 — R81d: Germany's label flag told from Poland's (ADR-1035)

- The bar (30 % of pixels differing) read 60 % on HEAD; the fault was Germany's black third lost on the tag's dark
  ground (its edge seen: 0 %). The tag's flag framed light: edge 100 %, pixels 70 %; shots looked at. Pairs under the
  bar in year 1 listed (red flags with a white device, Latvia's against the Soviet Union's). The ten tag specs green.

## 2026-11-14 — R81e: the relations graph names every nation at war or allied (ADR-1036)

- HEAD left 20-27 of 37-43 such nations unnamed. All nations are candidates now (the tied first), the placer tries
  sixteen directions at eight distances and covers no node; the shown nodes fill the drawing, 900 high on a phone. Two
  lines of a pair bend apart, so a puppet's truce is seen. 39939/41/43, desk and phone, whole and on Germany: all
  named, no overlap. R11's phone check now reads every nation in the zoomed view named. Relations specs 17/17.

## 2026-11-14 — R81f: a battle's labels met on HEAD (ADR-1037, proposed)

- The critic's case on 39915, 7781, 39917 at 250 m/px: 25 tags for 25 formations, 0 overlapping, 0 unplaced, the 10
  engaged all named, none of their 292 elements under a tag. No change; whether to thin the tags of formations not in
  contact at a battle is put to the user. `tools/diag/battleTags.ts`.

## 2026-11-14 — R81g: the followed fighter marked on its planes (ADR-1038)

- The mark stood at the patrol's middle while its planes circle at a radius of the view's. A sortie's row carries
  its wing now (stride 12) and the mark stands on the wing's drawn planes: at 250 m/px the median 70 → 0 px (39927),
  265 → 0 (35127), 0 on 39929; 3,000 m/px 0. The 14 sortie and wing specs green. `tools/diag/wingMark.ts`.

## 2026-11-14 — R81h: 120 m/px answered in BLOCKERS

- The critic's 52.5-55.8 at 120 m/px is draws a second over a spot left empty (its fight picked once at load): here
  48.8-57.5, while the browser draws 60.0-60.2 frames and a forced draw takes 0.7 ms (58.8-60 frames/s). The view
  skips a draw that would change nothing (`frameAt`). No change; BLOCKERS has the numbers. `lookFps.ts` `FIXED=1`.

## 2026-11-14 — Critic run 68 (focused, after Batch 25; on `bfda9503`)

- Scores: map 8, diplomacy 8, emergent 8, God Mode **7**, editor 8, stats 8, UI 8, performance 8, stability 8,
  semantic zoom 8, naval 8, tanks 8 (carried), aircraft 8, AI nukes 8. **1 blocking:** R68-B1, Undo and any load
  leave the undone burst's ruins and fallout drawn. Non-blocking R68-N1-N5. Batch 25 seen working (R81a's bar ×1.17,
  R81c-e, g; R81h's answer borne out: frames 59-60 at 120 m/px). Filed as Batch 26, R82a-f, before Batch 25's R81i;
  the critic runs again when no batch is open (ADR-1039). HEAD had moved by two document commits (ADR-1037, ADR-1039).

## 2026-11-14 — R82a: Undo and load redraw the burst layers (R68-B1, blocking)

- Cause as the critic said: `server.ts` sent fallout and ruins only while the world or the last sent had some, and
  `loaded()`/`startSim` reset the sent counts to -1, so an empty layer was never sent and the page kept the burst's.
  Now the counts are `Infinity` after a load or a start: both layers go once, empty too, then by their change as before.
- `tests/e2e/godUndoPicture1938.spec.ts` (the critic's `c68_undo2` and `c68_loadruins` as a spec, its 40-over pixel
  measure in the map clear of the bars): nuke, revolt, nation, city and raze on 41211, each act undone, the picture
  against the one before: **0 px** each (before the fix the nuke left 13,391 px); a save of before a burst loaded over
  the game that had it, against the same save in a fresh page (41203): **0 px** (before: 13,298). A city's name that
  takes its other free place after the load is left out of the count (its two boxes), and every city named before must
  be named again: a layout matter, not the world's.

## 2026-11-14 — R82b: Normandy fought for (R68-N4, ADR-1040)

- Cause: the Allies landed on Vichy-owned, German-held cells and were given none (R74g), so no neighbour cell to take
  from; a taken cell would have gone back to Vichy. Now in a stage's open window the arrival holds its cell, and taken
  stage land goes to the taker. `trackFronts` D-Day (51 cells): 1938 23 taken, Allies lost 26k vs 45k (was 0, 140k vs
  26k); 37701 23, 34k vs 58k; 38701 22, 19k vs 53k; 39701 17, 34k vs 46k; 41701 15, 32k vs 36k. Kept-release at the
  stage's own window tried, no difference, dropped. Gate green (two timing tests red in the run, green alone).

## 2026-11-14 — R82c: no carrier row on its own nation (R68-N1)

- `worker/carrierRaids.ts`: with no enemy formation in reach of the strike's point, the point cell's holder is named
  only if at war with the striker; else no row. Unit test (`carrierRaid1938.test.ts`, the strike's point on Britain's
  own land): red on the old rule, green now. Every row each hour of 20 years on 32019, 41019 and 7019: 87,697, 56,289
  and 98,471 rows, 0 on the striker's own nation, 0 on one at peace.

## 2026-11-14 — R82d: no war on Brazil by French Guiana (R68-N2, ADR-1041)

- A land neighbour bordering the attacker only by a colony costs as a war across the sea (capital to capital).
  Brazil's capital taken by France on 0 of 5 seeds (was 4); declarations over 6,000 km in the first 60 days 0 and 1
  on the critic's two sets (run 68: 3 and 2). Pin 95d9261f → 401d6856.
- With the pin moved, the e2e specs that step the sim ran: `relations1938` counted the graph before day one's
  statistics came (a war declared that day redrew it): it waits for them now. `relationsNamed1938` 39943 phone left 2
  of 44 nations at war or allied unnamed in the denser world: the labels' search goes to 12 rings (was 8). And
  `nukeRuins1938`, red since R81c (not this rule): its ground-zero dot, MARK_MS of the clock on the same overlay, sat
  on Berlin's middle; the spec reads the ruin once the mark's time is over. `shipMarks1938` T3 red once, green twice
  alone (GPU).

## 2026-11-14 — Three of run 68's "not 9" notes filed (the user's choice)

- R82g (no AI warhead intercepted, 0 of 47), R82h (the two land measures' names; France's and the United States'
  chart blues), R82i (the ground-zero mark over the struck stack's counter), after R82e-f.

## 2026-11-14 — R82e: the Normandy stage named for its handover (R68-N3)

- The one stage with a window of its own (`fightDays` 50) is dated at its handover, 25 July, so from 2 July the Next
  line read "Next, 25 July 1944: D-Day: the Normandy beachhead", and its History row on 25 July said D-Day too. Its
  note is now "The Normandy beachhead held: Cobra breaks out" (a note is text only: no hash, no start moves).
- `c68_x_stage normandy 1944 1944-06-05 … 50` on the dev server (the yearly starts rebuilt to 1944 first: stale since
  R82b) and `c68_nextline`: no day 6 June-25 July names D-Day (was 24 days), 0 page errors; the line fits the bar at
  1600 px. `tests/unit/trackTold1938h.test.ts`: a stage with its own window has no name (before a colon) of a named
  event of its window or the day before; red on the old note, green now.

## 2026-11-14 — R82f: put to the user (ADR-1042, proposed)

- HEAD (after R82d) has 3 wars over 4:1 at day 365 on the critic's ten (ITA vs POR 1:5, IRQ vs SAU 7:1, NSP vs FRA 1:9).
  `tools/diag/pileSides.ts` reads each declaration at its birth: on those ten and 43101-43119 (odd), 16 born over 4:1
  by nations on 11 of 20 seeds, 11 of them Italy (mostly with Germany) on a small member of the British-French
  alliance, the count swollen by colonies beside Italy's Africa (ADR-889). By realm, 3: a nation alone on a member of
  a large alliance (NSP on FRA, GER on SWI, HUN on AUT). 0 by nations means narrowing ADR-887/889 (the user's) or
  fewer of 1938's wars, so the item waits on the user's choice; the loop takes R82g.

## 2026-11-14 — R82g: no warhead intercepted, answered (not a regression)

- No nuclear or air rule changed since run 67; plain 1938 moved by R78b and R82d only. `tools/diag/nukeIntercepts.ts`
  at run 68's commit (a worktree at `bfda9503`): 37501 and 41503 launch 13 and 16 as the critic counted, 26 of the 29
  missiles (1952 on), which no rule stops (PLAN 6.2), and 3 bombers, 1.19 stops expected, 0 drawn. On HEAD, 37501/3,
  39503/7, 41501/3 over 22 years: 47 launches, 22 bombers, 8 stopped, 9.0 expected; the bombers that got through flew
  over their side's air (superiority 1). The share follows how late a seed's nuclear war comes, not a rule.

## 2026-11-14 — R82h: owned land named apart; chart lines told apart (ADR-1043)

- The chart's and the nation panel's "Land (km²)" is "Owned land (km²)", beside the Ranking's "Land held (km²)".
  `chartColours`: a line within ΔE 30 of one above it is mixed toward white, else black, until clear; dashed if none.
- 32019's year-20 world (built at HEAD), `tools/diag/chartBlues.mjs` with France selected: France #95a7dc, ΔE 37.5 from
  the United States (was 19); the United Kingdom #dc7373, 31.9 from the Soviet Union; shot looked at. Specs:
  `npx playwright test tests/e2e/charts1938.spec.ts --project=chromium` (2 green); `chartColours.test.ts` new.

## 2026-11-14 — R82f: no AI war outnumbered over 4 realms to 1 (ADR-1042, the user's choice (a))

- `callSides` (`4a1c9be8`): `declareWar`'s calling as a pure function, the pin unchanged. The AI, once its roll says it
  declares, judges the sides it would call: a target whose side has over 4 realms (a colony with its ruler) for each
  of its own is refused for its next best. Asked of every candidate it cost seed 99's tick 37 % (3.19 against 2.38
  ms); asked only at a declaration, and only where the target's allies and guarantors could make five realms, the
  tick held: 2.30 against 2.33 and 2.36 against 2.28 ms (both at once, separate cores, swapped; strategic AI 0.095).
- `pileSides.ts 365 --all` on 39139-39147, 41139-41147, 43101-43119 (odd), off against on: born over 4:1 by realm
  5 → 0, at day 365 1 → 0; by nations 15 → 13 and 6 → 5 (colonies, the bar re-scoped); declarations 586 → 579, wars
  at day 365 153 → 152. The critic's ten at day 365 by nations: ITA vs POR 1:5 and IRQ vs SAU 7:1 left, 1:2 and 2:1
  by realm. Seed 99 unchanged to year 5. `diploInvariants` gains `pile`; the joining tests and the three checker
  suites green (21); `pileRefused1938.test.ts` (the critic's Spain on France's alliance, off and on).

## 2026-11-14 — R82i: a burst's ground under the units (ADR-1044)

- `NukeFx.draw` in two parts: the ground (ground zero's mark, the shockwave, the cloud's stem and skirt) drawn on the
  overlay before the unit markers; the flash and the cloud's cap last, over the tags (ADR-389). Past the flash the cap
  stays over a blast radius above ground zero (`nukeFx.test.ts`, 0.7-9 s).
- `tests/e2e/burstCounter1938.spec.ts` (new): a burst on the counter nearest the middle, 937 and 3,000 m/px, held at 2,
  4, 8, 10 and 15 s: 0 of its own pixels (631, 364; those it draws over a ground painted magenta) changed; with
  ADR-389's order 513-988 (red). The critic's `c68_aimark.mjs critic/c68_seed7019_y20.bin 180746 99` on the dev server
  at HEAD: the strike falls at tick 185762 near Shizuishan; the US stack (x21, 33.8k) read over the mark at about 5
  and 11 s, shots looked at (kept off `critic/`). Specs by hand: `burstCounter1938`, `burstMark1938`, `nukeFx1938`,
  `nukeRuins1938`, `nukeYield1938`, `nukeDemo1938` (chromium, 6 green).
- Frame time: the same drawing split in two calls; with no burst the added call returns at once (no bench moved).

## 2026-11-14 — R81i: the tags at a battle (ADR-1037, the user's decision)

- At 250 m/px and nearer (`BATTLE_TAG_M`) with a formation in contact in view, the tag of one not in contact is one
  line, its flag and strength (`TagInput.short`; the layout takes each tag's own height). Whole: the engaged, the
  picked, the selected (a box selection counts), the hovered and a hero (its name is who it is: my choice, ADR-1037
  did not name heroes). The hover is read on a mouse move by the tag, else the smallest elements' box under the mouse,
  and kept while the mouse is in the box it was taken by (a tag grown whole and laid elsewhere would lose it, a
  flicker); read again after a draw only when the camera or the snapshot moved.
- `tools/diag/battleTags.ts` (gains the area, short and untagged counts, and a first day), the critic's case on 39915,
  7781, 39917 (alike, day 4, armour and infantry): tags' area 65,400 → 39,576 px² (39.5 % less, under the 40 % bar)
  with the chip at the two-line tag's 3 px padding; trimmed once to 2 px above and below (`TAG_SHORT_PAD_Y`, the
  flag's 12 px frame in 16): 38,172 px², 41.6 % less. 15 of 25 short, 0 engaged short, 0 overlapping, 0 untagged, 0
  unplaced. 120, 60, 30 m/px and a battle on day 9 (39915: 41 tags, 33 short; 7781: 40 and 24): 0 overlapping, 0
  untagged, 0 engaged short. 260 m/px: all whole (39915 leaves 1 unplaced there, as HEAD's code does: no short tag
  is drawn). At 30 m/px 4-6 engaged elements under a tag, all tags whole there (as before). Shots looked at.
- Tests: `battleTags1938.spec.ts` (new: whole and short by the rule, picked, selected, each of the short tags hovered
  and moved 1 px, 300 m/px all whole); `tags.test.ts` (a short tag's size, mixed heights crowded, and the grid layout's
  reference carrying short tags). Specs by hand, chromium and swiftshader, 37 green: battleView, countryballs,
  formationPanel, heroes, heroesRead, seamFight, tags, tagsCrowd, tankBattle, toBattle, battleTags.
- Frame time: the same layout, less text drawn; the hover read on a mouse move over the last frame's tags.

## 2026-11-14 — R80a: the research for 1976-91

- `docs/research/1976-91.md`. Each date of the Events table read from two fetched pages, the English Wikipedia
  article and one other (state.gov's Office of the Historian, UPI's 1986-91 archive, the Library of Congress country
  studies, the UN, PA-X, UCDP, HRW, national sites; weak ones marked). Five agents were given the events' names and
  articles, not dates, and quoted the sentence each date came from; the dates were compared with the draft here.
  Where they differ: (d), both dates, the one to use in bold (31). A day from one page with the month from the other:
  † (17). One page only: the Unverified list (11 cases), not the table; 187 rows in all.
- The AT, R80f-i's events and their rows: Angola and Cuba's troops (1976-02-08 Huambo, Cuito Cuanavale 1987-88,
  1991-05-25 the Cubans out, 1991-05-31 Bicesse); the Ogaden (1977-07-13, 1978-02-01, 1978-03-09); Vietnam into
  Cambodia (1978-12-25, 1979-01-07) and China into Vietnam (1979-02-17 → 03-16); Uganda and Tanzania (1978-10-30,
  1978-11-23, 1979-04-11); Iran's revolution (1979-01-16, 02-11); the Soviets into Afghanistan (1979-12-25); Nicaragua
  (1979-07-19); Zimbabwe (1979-12-21, 1980-04-18). Iran and Iraq (1980-09-22 to 1988-08-20); the Falklands
  (1982-04-02, 05-21, 06-14); Lebanon (1982-06-06, 08-21, 1985-06-10); Grenada (1983-10-19, 10-25 → 11-02); Poland's
  martial law (1981-12-13); Chad and Libya (1980-12-16 to 1983-08-09). Chad's war won (1987-01-02 to 09-11); the
  Soviets out (1989-02-15); Panama (1989-12-20); 1989's revolutions (Poland, Hungary, East Germany, Czechoslovakia,
  Bulgaria, Romania). Namibia (1990-03-21), Germany (1990-10-03), Yemen (1990-05-22), Kuwait (1990-08-02 to
  1991-02-28), the Baltic states (declared 1990-03-11, 1991-08-20, 08-21; recognised 1991-09-06), Slovenia and
  Croatia (1991-06-25, 06-27 → 07-07, 11-18, 12-19), the Soviet Union's end (the republics, 1991-12-08, 12-21, 12-26).
- Nations: 30 to add (16 small states 1976-86 and Namibia, Slovenia, Macedonia, Somaliland, the eleven Soviet
  successors), with adm0, adm1 names from the metadata and capitals; reused: RHO (ADR-1031 said there was no Rhodesia
  tag; there is), TCY, UVO, SOV, FRG, YEM, VIE. The map files Crimea under RUS: Ukraine's in 1991.
- For the later items: which of two dates the track uses (the Baltic land on the recognition, the other republics on
  1991-12-26, Sinai in one step on 1982-04-25, Macedonia dormant unless a second source turns up); India's 1974 test
  has no `bomb` event in the track (R80e to decide); the dominions' dates (R80k): Australia 1942-10-09 (from
  1939-09-03), New Zealand 1947-11-25, South Africa 1961-05-31, Canada 1982-04-17, Australia 1986-03-03.
- Documents only: no gate stage runs.

## 2026-11-14 — R80b: a bloc that ends (ADR-1045)

- The track's `allianceEnd` (`leader`) dissolves the alliance it leads; `Track.blocsEnded` (derived from the events
  applied) makes `blocsOf` leave out the ended leader's alliances and keep one bloc. No rule moves before the event:
  the timeline has none yet (R80h-i add the Warsaw Pact's), so the pin and 1938-75 stand.
- `tests/unit/blocEnd1938h.test.ts` (new; a two-day test timeline): the Comintern dissolved on its hour, told; one bloc
  after it; a pact the Soviet Union founds with Mongolia not deterred, no aid, its member's war calls the Soviet Union
  (the control: Mongolia in the Comintern, a bloc, goes alone). The bloc tests of ADR-981/990/1033 green (30).
- `diploInvariants` gains `bloc`. `tools/diag/blocEnd.ts` (the event on the 1975 end) on seeds 1-4, 10 years: at most
  1 bloc (NATO), the Soviet pact never one, 0 aid rows, 0 `bloc` lines; wars between NATO's members and the Soviet
  side 1, 0, 3, 3. Its `held` lines (France 20 cells of Austria, the United States 1 of Austria and 6 of Japan,
  Britain 2 of Italy, every seed) are in `.cache/afterTrack_1.sav.gz` of 2026-11-13 too: the track's end, filed R80l.
- Tick: `blocsOf` reads a cached set (rebuilt when the track's `next` moves); nothing else runs more.

## 2026-11-14 — R80c: a breakup and two unions (ADR-1046)

- `born` gains `forces` (`handForces` in `src/sim/track.ts`): the givers' land formations on the new land, fleets
  whose nearest port is on it, wings based on it; heroes and warheads stay. The unions are the existing `annex`.
- `tests/unit/breakup1938h.test.ts` (new, 4): a stand-in Ukraine born from the Soviet Union takes its army there, the
  Black Sea fleets and Kiev's wings, the warheads stay; without `forces` nothing moves; FRG takes GDR, YEM SYE, no
  formation of a dead nation.
- `worldInvariants` exports `hourChecks` (the hourly rule sets on a world the caller steps). `tools/diag/breakup.ts`
  on seeds 1-4 (the three events on the 1975 track's last day): 0 broken lines to 30 days after the end.
- No timeline event uses `forces` yet: the pin and 1938-75 stand. Tick: nothing new runs per hour.

## 2026-11-14 — R80d: the replay to 1991, its new nations dormant (ADR-1047)

- 44 nations added dormant to `data/scenarios/1938h/` (nations, flags) and `en.json` (30 states of 1976-91, 14 rebel
  movements; written by a script from `docs/research/1976-91.md`'s table); the end 1991-12-31, no new event.
- 1938-75 unchanged: the 30 December 1975 world of seeds 1938 and 1 hashes the same on HEAD (a worktree) and this tree.
- `npm run saves` to 1991: 7 min 13 s, 54 starts (1991's: 158 nations living, the powers USA SOV ENG FRA PRC FRG ITR),
  63 MB. The replay tests' timeouts an hour. On the Pages workflow (run 43631356453): the saves 11 min 41 s, the
  whole deploy 12 min 50 s, green (the job's limit 6 h); to 1975 the run before (43628434456) took 11 min 25 s.

## 2026-11-14 — R80e: the techs of 1975-83 (ADR-1048)

- Six techs appended to `data/tech/postwar.json` (and `en.json`): microprocessors, precision-guided munitions,
  fourth-generation jets, composite armour, attack helicopters, cruise missiles. The tech bits are all used (64/64).
- `tools/diag/techsBy.ts` (new): from the 1975 start to the 1991 end, the great powers know all six (with Italy,
  Japan, East Germany), the Netherlands 3, India 2, the rest none.

## 2026-11-14 — A stage's land: an owner on the taker's side has it back (ADR-1049)

- Found by R80f's replay checks: `historyTrack1938h` red on seed 1938 since R82b (China's volunteers holding North
  Korea's land at peace, the Americans Normandy's Vichy cells). `territory.ts` frees a retaken cell to an owner on the
  taker's side again; `heldByTimeline` excuses a stage's land held by the stage's side. Seed 1938 and seeds 1-5 to
  1991: no line, no warning.

## 2026-11-14 — R80f: 1976-80 in the replay (ADR-1050)

- 65 events appended to `data/scenarios/1938h/timeline.json` (by a script from the research's rows) and the map of
  1980-12-31; the identity Zimbabwe (`ZWE`: name, adjective, flag). `data-schemas.test`'s appended identity dated 1991.
- `historyMatch1938h` to 1980 with `state80`; `historyTrack1938h` and seeds 1-5 to 1991: green, no warning.
- `historyMatch` gains `MATCH_FROM` (a period checked in minutes from a yearly start); `provinces.ts`, `owners.ts`.

## 2026-11-14 — R80g: 1981-85 in the replay (ADR-1051)

- 52 events and the map of 1985-12-31 (a script from the research's rows); the identities GUN, TRN, BFA.
- From the 1981 start (`MATCH_FROM`, the starts rebuilt with R80f's events): 99.79 % whole, 99.5 % right, nothing
  passed over. `historyMatch1938h` to 1985 (`state85`); `historyTrack1938h` and seeds 1-5 to 1991 green, no warning.

## 2026-11-14 — R80h: 1986-89 in the replay (ADR-1052)

- 45 events and the map of 1989-12-31 (a script from the research's rows); the starts rebuilt with R80g's events.
- From the 1986 start: 99.79 % whole, nothing passed over. `historyMatch1938h` to 1989 (`state89`); seeds 1-5 to 1991
  green, no warning; `historyTrack1938h`'s handover now the Soviet bloc of East Germany, Mongolia and the Soviet Union.

## 2026-11-14 — R80i: 1990-91 in the replay (ADR-1053)

- 78 events and the map of 1991-12-30; the identities DEU, RUS and the CIS's name; the starts rebuilt with R80h's.
- From the 1990 start: 99.80 % whole, 99.6 % right, nothing passed over. `historyMatch1938h` to the end (`state91`);
  `historyTrack1938h` (the handover NATO and the CIS of eleven) and seeds 1-5 green, no warning, on the first run.

## 2026-11-14 — R80j: the world after 1991 measured (ADR-1054)

- `afterTrack.ts` on seeds 1938, 1, 2 for 20 years from the 1991 handover: NATO whole but seed 1's Turkey (its puppet
  Iran's rising), the CIS 11 to 7, the leaders opposed only on seed 1 (Cuba's wars), 355-379 wars, no aid.
- The deployed `years.json` equal to the local build (54 years); the previews served. Tools `afterTrackWhy.ts` and
  `callWhy.ts`.

## 2026-11-14 — R80k: the dominions free on their dates (ADR-1055)

- South Africa 1961, Canada 1982 (and NATO), Australia 1986 released; free at the yearly starts after; replay tests green.

## 2026-11-14 — R80l: no land held at peace at the track's end (ADR-1056)

- 29 cells at the 1991 end on four seeds, all occupations of 1943-45 returned short: Austria's ring, Libya's coast
  cells, Okinawa. Fixed in the timeline; `held` 0 on seeds 1938, 1, 2, 3, checked by `historyTrack1938h`.
- Batch 24 (R80) done: the replay to 1991. Next by PROMPT's RELEASES: the critic.

## 2026-11-14 — R83: "World history", and a year played free with 1938's options (ADR-1057)

- The user's request: the 1938 card renamed "World history" with "1938–1991" under it (the random world's date kept);
  a later year played free shows 1938's form, the map size disabled, random diplomacy offered; the options applied
  as the game leaves the replay, drawn from the form's seed. The critic run stopped by the user before it reported
  (its partial `critic/scripts` left uncommitted).
- Tests: `leaveTrack1938h.test`, `scenarios.test`, `data-schemas.test`; `title.spec`, `replayYear1938h.spec` and the
  1938h specs green (25).

## 2026-11-15 — The deploy's saves fixed (ADR-1058)

- R83b's `tick.ts` → `scenario1938.ts` import made a cycle the saves' esbuild bundle ran in the wrong order (`Domain`
  undefined); the heroes' placer now given by `sim.ts`. The starts rebuilt equal the ones before.

## 2026-11-15 — Critic run 69 (full, on `e5b97c8e`)

- Scores: map visuals 7, diplomacy 6; emergent, God Mode, editor, stats, UI/UX, performance, stability, semantic zoom,
  naval, tanks, aircraft, AI nukes 8. Blocking 4 (R69-B1-B4), non-blocking 5 and small ones: Batch 28 (R84a-j).
- Not the exit (ADR-829): no dimension under its bar three runs running; B4 is R80d's own claim not met, not a fix
  that broke another item.

## 2026-11-15 — R84k-l: the user's two hero bugs (ADR-1059)

- The played nation's hero opened from its Overview row can be ordered (`heroes1938.spec`, red before the fix).
- A later year played free takes its form's options to the start (`yearStartOptions`): 1960 free with heroes on has 12.

## 2026-11-15 — R84a: the track's occupations go back as it ends (ADR-1060)

- R69-B1: on any end of the track (free, date, intervention, timeline changed) land held at peace returns to its owner,
  as at a peace; an intervening command's own changes (God's paint) kept. 1946 free: 12 pairs, 21,338 cells → 0, and
  0 after three years; the critic's `c69_free` on 1946, 1954, 1962 and 1971 free games: no `held` line.
- Tests: `trackEndHeld1938h.test` (red before), `heldFree1938h.test` (sweep, 1946 and 1954 × two seeds, 60 days).

## 2026-11-15 — R84b: bloc aid in the economy rule

- R69-B2: `worldInvariants`' economy rule counts a bloc leader's aid (`BlocAid` rows, of the giver's income before the
  hour). The critic's free games from 1975 and 1991: 13 and 21 lines → 0; 1954, 1962, 1983: 0.
- `freeYears1938h.test` (the sweep test of R84a, widened and renamed): 1946, 1954, 1962 and 1975 free on two seeds,
  120 days each, every world rule set and `held`: green in 7 min. Its red without the checker fix not run.

## 2026-11-15 — R84c: a puppet's first month is the next (ADR-1061)

- R69-B3: a puppet made in a month's start hour (a peace's, God's, one handed over) takes no step of that hour's
  monthly pass; a saved column `nations.puppetAt`. 37009 × 1825 days: 0 broken (1 before).
- Pin `401d6856` → `6e3344f5`, by the column alone (the same without the rule). `puppetFirstMonth1938.test` red before.

## 2026-11-15 — R84b's sweep test reads aid given

- `freeYears1938h.test` asserts `BlocAid` rows in the 1962 and 1975 games with the scenario's diplomacy; on the checker
  of before R84b it is red (economy lines from 1954 and 1962), green on HEAD. The whole sweep suite alone: 23 of 23
  files green (12 min 56 s), the first run since R84a and R84c.

## 2026-11-15 — R84d: the replay's colours against land neighbours (ADR-1062)

- R69-B4: 81 nations recoloured, 20 of them plain 1938's; on the world at the 1991 end 0 pairs of land neighbours under
  ΔE 30 (87 before), no birth under 30 from a parent (38). Georgia orange against Russia's red on the page
  (`c69_ev91.mjs`, the starts rebuilt). Tools `neighbourColours.ts`, `recolour1938h.ts`.
- Tests: `colours1991.test`, `historyTrack1938h` (green, its `colours` at the end), `nations.test`, `flagsByScenario.test`. Pin `a6023887`.

## 2026-11-15 — R84e: the frozen wars end white as the track ends (ADR-1063)

- R69-N1: Lebanon no longer annexed by Israel in the end's hour; a 1983 free game's Lebanon lives (three seeds, 30 days).
- Tests: `trackEndHolds1938h.test` (red before), `historyTrack1938h`.

## 2026-11-15 — R84f: the late replay's names (ADR-943)

- R69-N3: Egypt 1971, Zaire 1971, Sri Lanka 1972, Benin 1975, Myanmar 1989 renamed on their dates (identities ARE,
  ZAI, LKA, BEN, MMR, each with its name, adjective and flag). On the page on 27 December 1991 (`c69_ev91.mjs`, the
  starts rebuilt) the five tooltips read the new names.
- Tests: `renamesLate1938h.test`, `data-schemas`, `flagsByScenario`, `historyTrack1938h`, `historyMatch1938h`.

## 2026-11-15 — R84g: a successor takes the forces its purse keeps (ADR-1064)

- R69-N4: no Soviet successor disbands in 1992 (four seeds), none a great power at the end (three seeds). Ukraine 23
  formations at the handover, Kazakhstan and Tajikistan none, Russia 339 on its reserve. Tool `successorPurse.ts`.
- Tests: `breakup1938h.test` (R80c's case under a purse that keeps all; the bound).

## 2026-11-15 — R84h: a large piece of a nation's own land is home (ADR-1065)

- R69-N5: three-nation random worlds quiet since R82d's colony cost; with a piece of 500,000 km² or more counted as home,
  the critic's six worlds have a war on 5 (15 wars). R82d's own reads held. Tick mean 3.613 ms against 3.612.
- Tests: `homeNeighbours.test` (red before). Pin `a6023887` → `4896702e`.

## 2026-11-15 — R84i: an Undo puts the city names back as they stood at the act (ADR-1066)

- R69-N6: the page keeps the city labels' state at each God Mode act and recalls it on its Undo; a new city list keeps
  the names it shares with the last. `c69_undo2.mjs` 41211 and 51211: 0 px in all five cases (city was 128).
- Tests: `cities.test` "a new list of cities" (two cases).

## 2026-11-15 — R84j: run 69's small items

- Heroes hint ("still living at the start"); "were" for plural names (`nation.plural`, `historyPlural.test`); Kuwait
  annexed on 3 August 1990 (`historyTrack1938h`'s `HELD_BY` check, green with the starts rebuilt); `seaBattles`' camera
  for a battle wider than 400 m/px holds (39061: 62 of 62 seen). The FMLN's annexation in a 1991 free game not taken
  (the free AI's war, by its rules).
- Batch 28 done (R84a-l). The batch's line that the release checks follow with no critic run was wrong: run 69 had four
  blocking issues and two dimensions under their bars, so RELEASES step 2 runs the critic again, focused.

## 2026-11-15 — Critic run 70 (focused, `b6bd706b`)

- Scores: map 8 (was 7), diplomacy 7 (was 6), every other dimension 8. Blocking 1 (R70-B2, bloc aid in a dissolving
  bloc's hour); non-blocking R70-N1-N4; design objection: R84e ends the held wars on any departure from the track.
  Filed as Batch 29 (R85a-f).

## 2026-11-15 — R85a: aid judged by the blocs at the hour's start

- R70-B2: the checker's bloc rule reads the blocs the hour before's call saw; `c70_free.ts 1991 51507 1825` 0 lines.

## 2026-11-15 — R85b: a war held within the timeline goes on as the track ends (ADR-1067, the user's word)

- Only wars held past the timeline's end make a white peace; the rest go on, their score from the end's, their clocks
  restarted. The 1942 replay's God act keeps the Second World War (0 peaces in hour 1, the Eastern Front on at day 30).

## 2026-11-15 — R85c: what ends with the replay is told

- The notes and the free card name the wars' fate (R85b); the end's peaces read "…as history's course ended".

## 2026-11-15 — R85d: Belgian Congo readable

- R70-N2: `#334400` → `#d87820` (L* 60), the neighbours' ΔE bars held. Pin `4896702e` → `ae4ce317`.

## 2026-11-15 — R85e: a nation with no land neighbour reaches across the sea (ADR-1068)

- R70-N3: landless sea powers build a transport group at peace and judge sea targets from their nearest; three-nation
  worlds 53401-6 a war on 6 of 6 (was 3). Pin held; 60-nation worlds a few more wars (86→100, 90→97, 111 same).
