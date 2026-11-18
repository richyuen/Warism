# Decisions (ADR log)

Format: ID · date · status · decision · why · consequences. Deliberate deviations
from AoC are tagged **[AoC-DEVIATION]**.

---

## ADR-1130 · 2026-11-18 · accepted (for the user's review) · R147 kept: its bare openings are the course of the world, not its choice (ROADMAP R160)

- **The case** (critic run 77, R77-N3): on run 76's nine warOpening seeds, three years, HEAD has 25 openings of 256 with
  no cell held at day 30 against 14 of 277 with R147 off (`--lift-far`); the defender ahead 20.3 % against 15.5 % on the
  57 set. The AT: back near 14 of 276 (under 6 %), or the trade kept by an ADR.
- **Traced, one saved state** (`.cache/r160_ab.ts`: HEAD to two days before each bare opening, saved, then four days
  with R147 on and off): all 22 of HEAD's bare openings on the six seeds that have them (56211, 57211, 57213, 57215,
  58211, 58215) are declared the same, the same day, with R147 off. The rule picks none of them; it changes which wars
  are fought earlier (Japan's far ones), and the world goes another way.
- **Nine new seeds** (63211–65215, three years, `warOpening.ts`, counted by `critic/scripts/c77_woCount.mjs`): no cell
  held at day 30 28 of 263 (10.6 %) with R147, 27 of 292 (9.2 %) without; the defender ahead 14.4 % and 13.4 %; the
  attacker with no man near 11.2 % and 12.9 %. A point and a half, within the seeds' spread (5–14 % a set either way).
  R147 off does not reach under 6 % on them either: run 76's figure on its nine was those seeds' own.
- **Decision:** R147 stays (the first declarations over 6,000 km stay at 0, `c77_firstdecl.ts 60`). The bare openings
  themselves (Italy on Yemen, Germany on Sweden, Italy on Denmark: over the sea, nothing taken in a month) are as many
  with or without it, and ADR-1094's bars hold on the new seeds.
- **For the user:** the critic judged this trade at the edge of diplomacy's 8. If the bare openings across the sea are to
  go below ~9 %, it is its own item: what a war across the sea must have ready before it is declared, not R147.

## ADR-1129 · 2026-11-18 · accepted · A world of two or three of near-equal strength may keep the peace (ROADMAP R155)

- **The case** (critic run 76, emergent dynamics "not 9"): random worlds of two nations 54425, 54426, 55424, 59421, 59423
  and of three 55404 have no war in ten years (`fewNationWars.ts`), on HEAD as on the critic's build.
- **Traced** (`.cache/r155_probe.ts`: each nation's `warUtility` on each other, its neighbours, lift and bars):
  - 54425, 55424, 59421, 54426: the two are home neighbours, sides touching, nothing barred. The stronger is 1.0 to 2.0
    times the other at aggression 18 to 57: its strength term 0.0 to 0.19; with RESTLESS's 0.3, reached at ten years of
    peace, its best is 0.30 to 0.49, under DECLARE_AT (0.5). The weaker scores under 0.1.
  - 59423: the stronger scores 0.65 on the other by year 3, across the sea, and its army cannot march to its transports
    (`seaLift` 0 men for a room of 25,200): R139's lift refuses it (ADR-1119 names this consequence).
  - 55404: the one with a target above the bar has it across the sea, its cost (`seaWarCost`) over the margin; the rest
    are weaker or far.
- **Decision.** Kept as the rules have it: the strategic AI makes war on a weaker nation (the strength term), and two of
  near-equal strength with no third do not go to war in ten years. Each world above has a reason that holds in plain 1938
  too, where it gives the wars the sweeps measure.
- **Not taken:** RESTLESS's cap past DECLARE_AT less the strength term (every long peace in every world would end
  sooner: the war rates of 1938 move, a sweep's question); a navy's transports sent to a port its army can reach (R139's
  open consequence, the naval AI's). Either is an item of its own if wanted.

---

## ADR-1128 · 2026-11-18 · accepted · A massing told and called off bars its target a year (ROADMAP R154)

- **The case** (critic run 76's small issue 9, logged under 56211; on HEAD it is 57613): Britain's massing on Mozambique,
  told on day 720, ended on day 764 by a refusal of one day (`Refusal.Overrun`, Portugal's land three quarters held for
  a day) and told called off, was taken up again on day 813 and told again on day 814: a second alarm within two months.
  Only a massing given up after MASS_DAYS barred its target (`World.massBarred`); one ended before then barred nothing.
- **Decision.** A massing told (`World.massTold`) and ended before its time, its two living and not at war with each
  other, bars its target to that nation for MASS_BAR_DAYS (365), as one given up does. One never told is not barred
  (no one heard of it); one ended by the war it massed for is not. `MASS_PROBE.againOff`: as before.
- **Measured.** `c76_massTold.ts 3` on 56211, 57611-57621 and 58611-58621 (R134's fifteen but two): told again after a
  call-off 0 (57613: 1 before); told twice 0; no "CALLED OFF BUT AT WAR". `diploInvariants` 57613 and 58619 scenario
  1825: 0 broken. Pin 1aabdc7e -> f311b292.

---

## ADR-1127 · 2026-11-18 · accepted · A held banner gone quiet yields to a war fought (ROADMAP R148)

- **The case** (critic run 76, R132's bar on HEAD): `c76_bannerRank.mjs 57901 150` gave 59, 55, 63 and 48 quiet
  banner-days behind "+n" (ADR-1114's bar under 50; under 44 for UI/UX's 8); the banner code unchanged, the world of
  57901 moved with R139. A war held its place HOLD_TICKS though its battles had stopped and a fought war waited.
- **Decision.** `heldRow`: a held war that is not `fought` keeps no place from a war the order wants that is fought and
  off the row. The hold stays against a war that outranks by its men alone (R132).
- **Measured** (a preview of the build): `bannerRank 57901 150` 42, 45 and 42 (58901: 27); `bannerFlip 57901 150` the
  row changed 7 times a minute, the banner under a resting cursor 1 (HEAD 4 and 4 by the critic; R132's 3 and 1);
  `58901 200` 4 and 0. ADR-1114's bars (10, 3, under 50) hold; two runs of three under 44.
- **Also** (R146): the first banner can now be a war with no battle, whose click flies nowhere; `toBattle` stops the
  director at the click, before it asks for the battle.

---

## ADR-1126 · 2026-11-18 · accepted · No target across the sea after one refused for want of a lift (ROADMAP R147)

- **The case** (critic run 76, R76-N5): first-60-day declarations over 6,000 km, 2 of 50 on 39821-39839 and 4 of 58 on
  55821-55839 (0 and 0 in run 75): Japan on Iraq, Iran and Finland. With R139's lift off Japan's first war on 39829,
  55821 and 39837 is Siam; R139 refuses it (its army on its front), and `firstNotOutnumbered` went down Japan's list to
  a target whose sides touch Japan's somewhere by land through their allies, so asked no lift.
- **Decision.** Once a target across the sea is refused for want of a lift, every later target across the sea of that
  pick is refused too; a land neighbour at home may still be taken. `LIFT_PROBE.far` (`warOpening --lift-far`): as
  before.
- **Measured.** `c76_firstdecl.ts 60`: 0 of 49 and 0 of 55 over 6,000 km (the bar 1). `warOpening.ts` three years on
  twelve seeds (58211-58221, 61001-61011), the rule on and off: wars that began 572 and 558; with no cell held at day
  30, 40 of 388 (10.3 %) and 24 of 393 (6.1 %), on R139's AT five 8.9 % and 4.8 % (its bar 10 %); ADR-1094's no man
  near 12.3 % and 8.1 % (bar 15 %), the defender ahead 13.0 % and 10.8 % (bar 15 %). The rise is +1.3 bare wars a seed
  (paired se 0.5), in wars the rule does not touch (Italy on Yemen, Nationalist Spain, Saudi Arabia): Japan's far wars
  were fought on land against their allies (58211: Japan held 372 cells of the war on Iraq by day 30), and other wars
  follow from Japan's. Every bar holds; the rise is the critic's to judge. Pin unmoved (1aabdc7e).

---

## ADR-1125 · 2026-11-18 · accepted · The lift asked of the war's defender; a puppet's revolt out of its checker (ROADMAP R145)

- **The case** (critic run 76, R76-B1): `diploInvariants` broke `lift` on 33501 (Hungary on Italy, Lithuania on Germany)
  and 58011 (three). Traced (`.cache/r145_probe.ts`): on day 1415 Hungary's strategic AI picked Yugoslavia, a neighbour
  at home and Italy's puppet, so asked no lift; `declareWar` made the war Italy's (the overlord the defender), on sides
  that touch nowhere by land, with no transport at a port (0 men, room 0).
- **Decision.**
  - The strategic AI's over-the-sea test is of the war's defender (`overlord || target`), the nation the checker judges.
  - A massing's end (`stillDeclares`, both its declarations) asks the same: the defender no neighbour at home and
    `noLift` of the sides it would call, and it does not declare.
  - A puppet's revolt (`puppets.ts`, `declareWar(…, true)`) is no choice of target: a puppet under its bar rises
    against its overlord wherever it is (ADR-807). The checker's `lift` skips a war whose two had a `PuppetRevolt` in
    the hour. Lithuania on Germany was one. So is a revolt's war of independence (`revolts.ts`, the holder on the
    nation a revolt made or revived, `RevoltSpawned` or `NationRevived` in the hour): the Soviet Union on Lebanon, 58011
    day 3591, was one.
- **Measured:** `diploInvariants` 33501 scenario 1825 and 58011 random 3650 --heroes, 0 broken (2 and 3 before); the
  critic's other 18 runs, 0. The pin of seed 99 does not move (the rule is not met in its first year).

---

## ADR-1124 · 2026-11-18 · accepted · The borders' time-lapse on the page (ROADMAP R143b)

- **Decision.** A "Time-lapse" button in History (the item: "a slider in History or Charts") opens a plate above the
  bottom bar and closes History, whose panel would stand over the map it plays; the game pauses. The worker sends the
  map at the record's first cut and each step's changed cells with their owner before and after (`packTimeLapse`, one
  transferred buffer), so the page plays either way without the codec; every nation's colour comes with it, those gone
  since among them. The map of a step is shown as owner and controller alike (no hatching: the record is of owners),
  uploaded whole (`setGrid`); the units, their orders, flags, marches, fronts and the nations' names, all of now, are
  not drawn, and the war banners are hidden. Ten months a second: fifty years in a minute.
- **Measured** (`timeLapse1938.spec.ts`, seeds 1938 and 7, 1600 x 900, the GPU): the map at 1 January 1939 and 1940 is
  the page's own map of that hour, cell for cell; playing, 60.0 fps, the 95th frame 16.7 ms.
- **Consequences.** Snapshots that come while it is open keep the page's grids but leave the textures; closing uploads
  the grids, the palette and the fronts again. Opening costs the worker's build and a buffer of the map and the cells
  that changed: on seed 99 built in 12, 12 and 23 ms at 10, 25 and 50 years, 5.5, 8.0 and 11.0 MB (853,037 cells at 50).

---

## ADR-1123 · 2026-11-18 · accepted (the user's decision: "let's allow 7%") · R143: the time-lapse record and its bar, 7 %

- **The bar.** R143's AT: the record of the cells that changed owner each month under 5 % of a 50-year save.
- **Measured** (`.cache/r143_probe50.ts`, `.cache/r143_dump.ts`, `.cache/r143_enc.mjs`: 50 years of seeds 99 and 7, the
  owner's changes month by month, encodings tried on the runs dumped). The record is kept backward from the map of now
  (each run of changed cells with its old owner: the save holds the map, so no start map is kept); the packed save
  at 50 years is 1,517 and 1,503 kB (6.1 MB raw). The packed record against the packed save:
  | encoding | seed 99 | seed 7 |
  |---|---|---|
  | runs, varints interleaved | 9.1 % | 9.8 % |
  | the same in columns | 7.1 % | 7.8 % |
  | runs merged by old owner, start, end and owner from the run above (the best; not decodable as it stands) | 4.7 % | 5.1 % |
  | the same, decodable (the index of the run above sent) | 5.0 % | 5.6 % |
  Against the raw save the columnar record is 3.8 % and 4.0 %. Frames every 2 or 3 months instead of every month do not
  help: the changes last (merged runs on seed 99: 59,965 monthly, 59,305 every 2 months, 58,763 every 3), 5.0 % and 5.5 %.
- **Options.**
  (a) The bar at 6 % of the packed save: the decodable encoding, monthly, as the item says.
  (b) The bar against the raw save (the state's bytes, as `Sim.save` gives them): under 5 % with the plain columnar
  encoding (3.8-4.0 %); the file grows 7-8 %.
  (c) Keep 5 % of the packed save: a lossy record (a coarser grid, or months between years approximate), and the AT's
  "each 1 January equals the run stopped there" kept only at the year's frames.
- **Also found** (for whichever): the section is optional (as `history.towns`: absent at the start, loads when absent),
  so no `STATE_FORMAT` raise and no `UPGRADABLE_SECTIONS` entry (that list is for table columns of scenario files); a
  save made mid-month must carry the month's open diff; the hash takes the section, so the pin of seed 99 moves.
- **The user's decision** (2026-11-18): "let's allow 7%": the bar is 7 % of the packed 50-year save, monthly frames as
  the item says. The decodable encoding (5.0 and 5.6 %) is under it; the plain columnar one (7.1 and 7.8 %) is not.
- **Built** (R143a): `src/sim/borderLog.ts`, the decodable encoding, cut in `step` after the month's first hour's
  systems. `tools/diag/borderLog.ts`, 50 years: seed 99 600 frames, 60,441 runs, 50 of 50 maps of 1 January alike, the
  packed save 1,506 kB without the record and 1,586 kB with it (5.34 %); seed 7 65,224 runs, 50 of 50, 1,495 / 1,583 kB
  (5.92 %). A cut 3.0 ms median, 7.4 ms at most, once a month. The pin of seed 99 moves f6d6ab13 -> 1aabdc7e (the two
  sections in the hash; no rule moved).
- **When taken**, split: R143a the record (codec, save and load, the yearly
  equality, the size), R143b the slider and its playback at 60 fps.

---

## ADR-1122 · 2026-11-18 · accepted · The director's camera (ROADMAP R142)

- **Decision.** A Director switch in the bottom bar (`src/app/director.ts`). The worker sends the History rows of a new
  war, a Major Battle, a capital taken and a nuclear strike since its last stats message (`DIRECTOR_KINDS`,
  `directorRows`, the last 40, places as the ticker's: a war at the capital of the nation it was declared on); the
  director flies to each as the ticker's row does (`showPlace`), no cut within 4.5 s of the last nor 2.5 s of the camera
  standing, a strike first, the rest in order, one waiting over 45 s passed over. A row whose place stands 40 px
  inside a view at most 3000 km across while the camera stands is seen there, not flown to. `CameraController.onTaken`
  (a wheel, a press on the map, a double click, a camera key) turns it off.
- **Why.** Goal 1: a world that moves, shown without the player's hand. Major Battles reach the page in no row of the
  ticker, so the worker sends the director's own; a war has no front at its declaration, so the ticker's place.
  Measured on 600 days of seeds 1938 and 7 (headless): 36 and 27 wars, 66 and 61 Major Battles, 35 and 29 capitals,
  no strike: one every 4.6 s at 1 day/s, about the gap; the shots near the one shown are seen with it.
- **Measured** (`director1938.spec.ts`, `DIRECTOR_MINUTES=10`, 1600 x 900): seed 1938 135 of 135 rows seen, 80 cuts,
  seed 7 116 of 116, 70 cuts; the shortest gap 4.52 s; 600 days in 600 s; a wheel turned it off within a frame and no
  cut followed. A first count that took the whole world's view as seeing everything (0 cuts, 100 %) is why a view must
  be 3000 km across at most. `npm run bench -- G`: T0 406 fps, T2 158.5 fps (budgets 60 and 30). No sim rule, no pin.
- **Consequences.** The stats message carries up to 40 more rows a second, only where such events happen. The gate
  runs the spec for 1.5 minutes; the 10-minute run is by hand.
- **Amended at R143a's gate** (the first whole browser run after R142): the word "Director" took the bars' cover at
  1600 x 900 to 3.10 % against `chromeCover1938`'s 2.95 % (ADR-1086: the two bars no more than the one bar was). The
  switch is a drawn camera (named "Director" for a reader and in its title) and the bar's buttons have 0.5rem at their
  sides (0.6 before): 1.12 + 1.80 = 2.92 %.

---

## ADR-1121 · 2026-11-18 · accepted · A row of History flies to its place (ROADMAP R141)

- **Decision.** A History row whose kind is in `HISTORY_PLACED` (`src/shared/history.ts`) and that has both numbers is a
  link (`historyPlace`): a battle, a capital taken, a revolt, land that went over, a strike and its kin, an air or sea
  battle, a raid, a hero lost, a massing, God's acts on a place, an event of the track. `HISTORY_UNPLACED` has the
  rest, whose log has no place (wars, peaces, alliances, puppets' bonds, a death) or other numbers in x and y (the bonds
  a forced war broke, why a nation joined, why the track passed over an event); each kind of the log is in one of the
  two (`historyPlace.test.ts`). An annexation logs no place: the worker gives it the target's capital, as the ticker's
  row has it. A click flies the camera, PLACE_VIEW_KM across as the ticker's, to the point nearest the view's middle
  where `elementFromPoint` finds the map's canvas, it and PLACE_CLEAR_PX (60) about it (`MapView.showPlaceClear`); with
  none (390 x 844, the panel at its tallest), the panel closes and the place is at the middle (`showPlace`).
- **Why.** Run 75's small things: "a row of History cannot be clicked to its place". The panel stands in the middle
  of the view, over where the ticker's flight puts its place; the page's other overlays (bars, ticker, side panels, an
  alert) stand at many places, so the free point is asked of the page, not drawn from their boxes.
- **Consequences.** No sim change, no pin move. A dead nation keeps its capital's columns, so an annexation's place is
  where its capital was; a nation revived since is placed at its new capital. A place in a game saved before is as the
  log had it then.

---

## ADR-1120 · 2026-11-18 · accepted, option (b) (the user's decision: "Let's do b") · R140: a top five held 20 years, the bar or ADR-750

- **The conflict.** R140's AT (Batch 43, the user's decision of 2026-11-17) asks that no seed of a 10 × 50 sweep keep
  the same five largest nations for 20 years or more. ADR-750 (the user's decision) has it that a stable top is a valid
  world: the sweep reports stasis and does not judge it.
- **Measured on HEAD** (40938ff7, 72001–72010, `docs/sweeps/2026-11-18-sweep-r140.md`): 2 of 10 (22 and 20 years), the
  other eight 7–17. The cause read (BLOCKERS, R140): the United States is in the held set on all 30 seeds of the last
  three sweeps, Australia on most, and the two are at war on few days of decades (Australia 0 in years 9–27 of 72006,
  the United States 0 in 22 of 32), so the set holds while the Soviet Union, Britain and Brazil keep their places.
- **Options.**
  (a) Keep the bar, and make the two at peace for decades part of the world's wars: a war on them that the AI would
  take (across the sea, with a lift: ADR-1119), or wars of their own (their aggression, the United States'
  isolation). R144, its AT R140's bar on new seeds.
  (b) Keep ADR-750: R140 closed with HEAD's figures (2 of 10), the entry to the watch list; R144 dropped.
  (c) Judge another measure of the top's movement (realms rather than nations, or the top three, or the largest's
  share), with its bar.
- **The user's decision** (2026-11-18): (b). ADR-750 stands: a stable top is a valid world, reported by the sweep and
  not judged. R140 closed with HEAD's figures (2 of 10, 72006 22 years, 72007 20); its BLOCKERS entry to the watch list;
  R144 dropped.

---

## ADR-1119 · 2026-11-18 · accepted · A war across the sea is declared only with a lift (ROADMAP R139)

- **Decision.** The strategic AI does not declare on a target that is no land neighbour of its home (a target across
  the sea, `seaTargets`, or by a colony only) when the sides `declareWar` would call touch nowhere by land and its free
  men that may march to a port where a transport group of its stands are fewer than its largest such group holds
  (`src/sim/ai/seaLift.ts`: `noLift`, `seaLift`, `sidesTouch`). Free as the landings ship them (standing, not within
  DEPLOY_RANGE_CELLS of its own front on their land; PLAN 7.26c3a); the way to the port by `mayReach`. Such a target is
  refused as `outnumbered` refuses one (ADR-1042, `firstNotOutnumbered`): its next best is taken, or none. The checker:
  `lift` in `tests/helpers/diploInvariants.ts`.
- **Why.** Critic run 75's non-blocking 5: 20 of 103 wars with no cell held by either side at day 30. On ten seeds of
  HEAD (348 wars that ran a month) 55, 52 between leaders with no land border. Of the 131 wars between such leaders,
  the 57 whose sides touched by land held nothing in 1; the 74 that touched nowhere, in 51. In 33 of those 51 the
  attacker had, as it declared, under a group's room of free men that might march to its transports: Japan on Siam on
  every seed (its army on its front in China; its day-0 landing sent a division 64 cells to Shanghai's port), Italy on
  South Africa, Saudi Arabia, Yemen and Sweden (its one group at Mogadishu, on the land of its army in Italy, which
  cannot march there), Germany on Saudi Arabia and Spain (its army on its fronts). R139a (a free-army share in a war,
  `.cache/r139/r139a.patch`) was tried first and not kept: it took Japan on Siam away and moved nothing else.
- **Measured** (`tools/diag/warOpening.ts`, three years; `--no-lift` the rule off): on the AT's five (58211, 58213,
  58215 and 61009, 61011, not seen before) 24 of 180 (13.3 %) -> 8 of 167 (4.8 %); on the ten looked at 55 of 348
  (15.8 %) -> 19 of 322 (5.9 %). ADR-1094's bar, the attacker with no man near its border (15 %): 11.7 % -> 7.0 % on the
  five, 11.1 % -> 9.0 % on the ten; R97b's defender ahead in land at day 30 (15 %): 14.4 % -> 14.0 %, 10.1 % -> 8.5 %. The
  wars that began: 496 -> 468 on the ten (-6 %). Two- and three-nation random worlds of critic run 73-75's small cases:
  the same wars with the rule as without.
- **Stands on** ADR-670 (the nation across the sea "it could land on"), R78b, R74h (`warOverSea1938`), ADR-1068
  (`landlessPowers`), ADR-1042 (`pileRefused1938`), ADR-1089 (`massing1938`): green before and after.
- **Consequences.** A nation whose army is on its fronts, or whose transports stand where its army cannot march, makes
  no war across the sea until it has both. The pin of seed 99 moves 3374082b -> f6d6ab13 (a war of its year declared
  otherwise); `heroes.test.ts`' row count of German hero losses is read as Germany dies (a second loss in the wait).
  Found after the commit by the whole ten-year suite (the gate's sweep stage runs only the pin): `aiSweep1` red, seed 1
  founding no nation in ten years (its first in year 12). Nations founded in ten years, rule off -> on, seeds 1-13: 6->0,
  4->1, 12->11, 10->10, 5->1, 10->18, 22->11, 6->5, 13->33, 4->5, 2->5, 1->10, 5->2 (100 -> 112; 7 of 13 fell, the paired
  mean +0.9, -11 to +20): no measurable effect. The test's `founded > 0` guards its name-and-flag checks (PLAN 2.15's AT,
  every nation founded has a flag), so `aiSweep` steps on by the month until the first is founded, five years at most.

---

## ADR-1118 · 2026-11-17 · accepted · The nightly's ten-year tests in three jobs (ROADMAP R138)

- **Decision.** `.github/workflows/nightly.yml`'s `ten-year` job is a matrix of four: the sweep tests the others
  do not name (by `--exclude`), historyMatch1938h with freeYears1938h and freeWorld1938h, the track's seeds 1-3, and the
  rest of the track (its own seed and seeds 4-5, by excluding seeds 1-3). Each keeps the 60-minute limit.
- **Why.** One job ran 53-54 min on the nights it ended and was cancelled at 60 on 2026-11-13, 11-15 and 11-17. On the
  11-16 run (43855142847) its files summed to 9,547 s on 3 workers (3,191 s); the six track files are 5,650 s of it, about
  15-16 min each. Split three ways first (76551f98), run 44206444954 had a runner 1.6-1.9x slower: track jobs 22 and 27
  min, the rest 37 min, historyMatch1938h 1,547 s and freeYears1938h 1,314 s of it. Those two and freeWorld1938h (790 s)
  became a fourth job (~26 min on that runner), the rest ~3,000 s (~18 min). A longer limit alone would leave the next
  slow test to cancel it again.
- **Consequences.** `npm run test:sweep` and the gate's stages are unchanged. A new sweep file lands in the first job,
  a new track file in the last, with no edit to the workflow. Four runners' `npm ci` a night instead of one.

---

> The ADRs before the last release tag are in `docs/history/`: `DECISIONS-<YYYY-MM>.md` (October) and
> `DECISIONS-<release tag>.md` from November on (ADR-805, ADR-918), in the order they had here. Search them by number (`grep -rn "ADR-623 " DECISIONS.md docs/history/`).
