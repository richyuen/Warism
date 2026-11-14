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
