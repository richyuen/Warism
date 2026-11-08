# Decisions (ADR log)

Format: ID · date · status · decision · why · consequences. Deliberate deviations
from AoC are tagged **[AoC-DEVIATION]**.

---

> The ADRs of earlier months are in `docs/history/DECISIONS-<YYYY-MM>.md` (ADR-805), in the order they had here. Search them by number (`grep -rn "ADR-623 " DECISIONS.md docs/history/`).

### ADR-869 · 2026-11-07 · accepted — A row turning back gives its days to its port (R50d)
- **Context.** Critic run 52, R52-N5: a cancelled row said "turning back to Tokyo" with no days, where one at sea gives
  them (R48d).
- **Decision.** A returning landing's row carries the longest sail left of its groups under way (`backHours`):
  "turning back to Tokyo: there in about N days"; with none under way, as before.
- **Consequences.** `landingRowDays1938`'s 20661 case (cancelled at hour 26, both at sea: each hour its days, over
  within them and a day; red before at t29).

### ADR-868 · 2026-11-07 · accepted — A landing held in a fight at sea says so (R50c)
- **Context.** Critic run 52, R52-N3: on 21105 the row read "at sea: lands in about a day" for four days while its
  transport group was engaged, held west of Malta; nothing said it was under attack, and ADR-860's days failed.
- **Decision.** A landing at sea with a group of it engaged (`LandingRowData.held`) reads "at sea: under attack, held
  up", with no days; once it moves again its days are told from where it is (`voyageHours`). A click's row says so
  when any part of it is held.
- **Consequences.** `landingHeld1938` (21105: so while a group is engaged and only then; red before at t38).

### ADR-867 · 2026-11-07 · accepted — One click's row holds to its end (R50b)
- **Context.** Critic run 52, R52-N2 and its objection to ADR-862: a click's row came apart as its landings ended
  (20861 t129: "Tokyo, Ōsaka · over: 2 landed" beside "Hiroshima · at sea"; Ōsaka's part dropped after its day; the
  click never read "3 landed"), and a cancel split it into a row a port. `clickOf` read siblings in the world: a part
  over is gone from it, and one turning back is no sibling.
- **Decision.** The worker keeps each landing's click as first seen (the least, where two clicks are found one); a
  part over stays in the bar while any part of its click is under way, and until a day after its click's last end.
  The row's words are ADR-862's `groupStatus`, now over all of the click to its end ("over: 3 landed").
- **Consequences.** `landingClick1938`: 20861 one click every hour to "over: 3 landed"; 20661's cancel at hour 26,
  both at sea, one row turning back (both red before). The critic's `c52_lland.mjs 20861 …` in the page: one row
  t1 to its end.

### ADR-866 · 2026-11-07 · accepted — A landing's outcome is where its divisions ended (R50a)
- **Context.** Critic run 52, R52-B1 (blocking): R47a's tally (ADR-853) counted every `TransportsSunk` as lost and
  every `FormationLanded` as landed. On 22103 two divisions whose transports were sunk before they boarded read "over:
  lost at sea" while alive inland; on 21105 two that broke off and came ashore on Sicily read "over: 2 landed"; on
  3517 "1 lost at sea" for 366 on land. `landingRows` compared the row with the same tally and saw nothing.
- **Decision.** The worker notes each division's end (`endLanding`): ashore at its landing's land (`landedAway`, as the
  order news judges it) is landed, ashore away from it broke off, `LostAtSea` lost, `TransportsSunk` with none to come
  never sailed (unless lost). The outcome's kind is the first of landed, broke off (`away`), thrown back, lost, never
  sailed (`sunk`), then cancelled or over; its counts are said after it ("over: 2 landed, 1 lost at sea, 1 never
  sailed"). The words follow the order news: "over: its transports broke off; 2 came ashore away from Valletta",
  "over: its transports were sunk; 2 never sailed". The checker's `outcome` reads the world, not the worker: a case
  division afloat one hour and ashore the next at the row's land or away from it, or gone while afloat.
- **Consequences.** `landingOutcome1938` (22103, 21105, 3517: red before on each); the checker alone red before on 22103
  and 21105; `tools/diag/landingRows.ts all`: 108 cases 0 broken.

### ADR-865 · 2026-11-07 · accepted — History shows the newest hour first, each hour cause first (R49b)
- **Context.** Critic run 51, R51-N5: the ticker tells a puppet's release before the "left its war" rows it caused
  (R43d's `causeFirst`), but History listed every row reversed, so within an hour the release stood under them.
- **Decision.** History's rows (`historyRows`, also the CSV and JSON) take `causeFirst`; the panel shows the newest hour
  first and each hour's rows in that order (`newestHourFirst`), not every row reversed. An hour reads in History as
  in the ticker.
- **Consequences.** `historyHourOrder` (the order; 20429 with random diplomacy, the critic's case: the release first in
  its hour, where reversed it stood last).

### ADR-864 · 2026-11-07 · accepted — God's Breakthrough is told in the ticker (R49a)
- **Context.** Critic run 51, R51-N4: at war (21151, Germany against Poland, Berlin to Warsaw) Breakthrough was taken in
  silence. Its `MajorBattleEnded` of a battle with no name is not a ticker kind; nothing marked the corridor.
- **Decision.** A row, as Spawn, Found and Raze have (PLAN 7.33b): a new event `GodBreakthrough` (a = the nation, b =
  the city nearest its start, at its start), logged, in the ticker and History's type filter, "God opened a
  breakthrough for {a} near {b}" (or without the city), the capital's cue. Not taken: drawing the corridor for its 10
  days, a map layer for one God tool; the row's "Show where" flies to its start.
- **Consequences.** `godBreakthroughRow1938` (the row in History and the ticker at its start, filtered by type; at
  peace none; red before); the critic's script: its ticker row from the click's hour.

### ADR-863 · 2026-11-07 · accepted — On a phone the nation's panel gives way to a new landing (R48g)
- **Context.** Critic run 51's objection to ADR-854: on a phone a nation's panel hides the landings bar (both want
  the top of a narrow screen), and take control leaves the nation's panel open, so after the player's first landing
  order the bar was not seen.
- **Decision.** The panel gives way: on a phone (the 600 px rule's width), a landing of the player's new in the
  hour's rows closes the nation's panel (`hud.onLandings`). The bar under a panel stays hidden (two panels in 390 px
  hide the map); the desktop is as it was.
- **Consequences.** `landingsBar1938` case 7 (390 × 844: Japan's panel open after take control, an order to
  Shanghai, the bar seen and the panel closed; red before).

### ADR-862 · 2026-11-07 · accepted — One click's landings, one row (R48f)
- **Context.** Critic run 51's objection to ADR-838 with R47: one click split over three ports showed three rows, and a
  cancel ended one; Hearts of Iron shows one plan with its ports and one cancel.
- **Decision.** A landing's row carries its click: the least id of it and its siblings (R37c's `siblings`, the same
  place within a day of each other's first order), taken through (`clickOf`). The bar draws one row a click: "Shanghai
  from Tokyo, Ōsaka, Hiroshima"; where it stands as one (`groupStatus`: the last to sail, "1 of 3 at sea; the last
  sails in about 2 days", the last to land, landed summed, cancelled summed); transports summed; opened, "From
  Tokyo" and where that one stands, then its divisions, a port each; one cancel, every live landing of it. A lone
  landing's row is as before. A part turning back is no longer a sibling (`siblings` leaves out returning) and so
  stands as its own row.
- **Consequences.** `landingClick1938` (20861 one click; 15101 two orders an hour apart for two places, two clicks; the
  click's cancel ends all; `groupStatus`'s words; red before on the click); `landingsBar1938` case 6 (the row, its
  parts, one cancel, over and cancelled).

### ADR-861 · 2026-11-07 · accepted — Siblings land "within a day of" each other, as the words say (R48e)
- **Context.** Critic run 51, R51-N7: 365's panel on 20661 said "they land together", and its landings came ashore at
  t117 and t129; 20841's at t119, t129, t131. The rule (R37c, ADR-836's `SIBLING_SLACK_HOURS`) lands them within half
  a day of the estimate, a day with its error. The critic left it to us: the words as the rule, or the landings within
  the hour.
- **Decision.** The words. Landings within the hour would hold the first ashore off the coast for hours, or delay
  every sibling for an estimate an hour or two off: a rule change for a wording fault. The row, the panel and the
  click's hover say "to land within a day of the landing from {other}" (R48d had already dropped "together").
- **Consequences.** `landingWithinADay1938` (20661, 20841: the words, and each pair so told lands within 24 h; red
  before on the words); `landingOwnPort1938`'s hover assertion reads the new words.

### ADR-860 · 2026-11-07 · accepted — A row says when it sails to land with another, and at sea when it lands (R48d)
- **Context.** Critic run 51, R51-N6: on 20861 Ōsaka's row said "waits for the landing from Hiroshima: about a day"
  and sailed a day before Hiroshima's. The wait was real (R37c, `siblingWait`): it holds until it can land within
  half a day of the other, and its voyage is the longer, so it sails first. The words were false, not the rule. At sea
  a row said only "at sea".
- **Decision.** The words say what is done, as the click's hover already did: "sails in about a day, to land with the
  landing from Hiroshima"; the division's panel "At Ōsaka: sails in about a day, to land with the landing from
  Hiroshima for the same place". At sea: "at sea: lands in about N days", from the longest voyage left of its groups
  (`voyageHours`, `LandingRowData.landsIn`). `landingStatus` moved to `src/ui/landingStatus.ts` for the tests.
- **Consequences.** `landingRowDays1938` (20861: never "waits for", a sibling row so worded, each row sails and lands
  within its days and a day; red before at t3, row 2).

### ADR-859 · 2026-11-07 · accepted — The open row's cancel in its head; a short view's bar runs to the bottom bar (R48c)
- **Context.** Critic run 51, R51-N3: at 844 × 390 the bar's 40 vh (156 px) held two divisions; the third and the
  cancel under them were in the bar's scroll.
- **Decision.** The cancel ("Cancel landing", shorter) stands in the open row's head, beside its title, at every size;
  under 500 px tall the list's cap is the room down to the bottom bar, not 40 vh. A row of more divisions than that
  room still scrolls, its cancel always in sight.
- **Consequences.** `landingsBar1938` case 5 (the critic's 21107 three, 844 × 390: the cancel and each division in the
  bar and on the screen; red before on the cancel).

### ADR-858 · 2026-11-07 · accepted — A division on the AI's voyage says so (R48b)
- **Context.** Critic run 51, R51-N2 and its objection to §7.1's layers on a taken nation: on 20661 a cancelled
  division was the AI's again (ADR-759) and the AI shipped it on a landing of its own; its panel said "At sea, bound
  for its landing", and "Your landings" had no row for it.
- **Decision.** The worker's voyage for a division of the played nation's aboard or bound for a port in no landing of
  the player's carries `ai`, and its words say whose: "At sea with the AI's landing (not one of yours)" (and the
  march to a port, the wait there, so). The AI keeps taking such divisions (SPEC §7.1, the user's design): only the
  words change, as R35 did for a fleet back with the AI.
- **Consequences.** `landingAiVoyage1938` (20661, cancelled at hour 26: 364 shipped by the AI at t217; red before);
  the critic's `c51_cancel_page.mjs 20661 …`: from h216 the panel says so, and the bar has no row.

### ADR-857 · 2026-11-07 · accepted — A landing's cancel stops those ashore where they stand (R48a; supersedes ADR-855's march)
- **Context.** Critic run 51, R51-N1 and its objection to ADR-855: 21107's gathering landing, cancelled on day 3,
  marched its three divisions a week on to Hamburg, a port they never reached, while the row said "cancelled: back
  at Hamburg". R43e (ADR-841) stops the march when a landing ends any other way; Europa Universalis's "halt".
- **Decision.** The row's cancel is a command of its own (`cancelLanding`), which the worker turns into the click a
  player could give: each division aboard ordered to its port's cell (the landing turns back), each ashore to where it
  stands (it leaves the landing and stops). One sim change for it: a landing at sea with one of it ashore (bound for
  its next voyage) and all of it ordered is judged by those aboard, and only a cancel is taken (before, those aboard
  were refused `AtSea` and it sailed on); a redirect or join still takes it whole. The row says what was done, with
  counts ("4 back at Tokyo, 1 stopped where they stood"), and, where the player's army is the AI's (ADR-759), "the
  AI commands them again": on 21107 two walked off the next day under the AI, and the row says so. The tooltip:
  "those at sea sail to {port}; those ashore stop where they stand".
- **The checker.** `marchOn` skips a division on the retreat: on 20829 at t2325 (a history the change moved), 364
  was beaten at Jiaxing, its landing's port in China, and retreated toward it; the fight's march, not the
  landing's (R43e's). The 25 seeds of run 51: 0 broken.
- **Consequences.** `landingRow1938` (gathering, at sea, at sea with one ashore; red before, the last red on the
  sim change alone); `landingsBar1938` (the button: over in the hour, the division where it stood).

### ADR-856 · 2026-11-07 · accepted — The landings bar's AT on the critic's cases (R47d)
- **Decision.** `tests/helpers/landingRows.ts` runs the critic's landing cases through the worker (`SimServer`, which
  makes both the rows and the panels): run 47's grid (each setup × op × hour × who, off 0) and run 50's eight far
  routes, the click and each case's orders as `cmds` batches. Each hour it reads: a division of a player's landing
  in no row under way (`missing`), in two (`twice`), its row's words not its panel's (`words`), a gathering row with
  one at sea or a row at sea with one waiting at the port (`state`), and a row over whose outcome or count of the
  landed is not its divisions' (`outcome`). A division the AI put aboard (the played nation's armies are the AI's
  by default, ADR-759: 20661's order to Qingdao made no landing, and the AI shipped 364 two days on) is at sea in
  its panel and in no landing of the player's: not the bar's, and not counted.
- **Consequences.** 108 cases, 19,905 hours: 0 broken. With one division dropped from each row (a planted fault)
  7 of the 8 far cases break (`missing`), so the reading can fail. `landingRowsCritic1938`: six of them each gate.

### ADR-855 · 2026-11-07 · accepted — A landing's cancel from its row (R47c)
- **Decision.** The row's cancel (gathering or at sea) is the click a player could give: each of its divisions
  ordered, in one batch (`hud.commands`), to its port's cell (`LandingRow.portAt`). The sim judges it as any click
  (`landingOrders`): at sea, all aboard, it turns back (`returning`) and they go ashore at the port; gathering,
  each leaves the landing. No new rule. The worker notes a batch that sends all of a landing to its port, and that
  landing, over with none landed or lost, is told `cancelled` ("cancelled: back at Tokyo"). An ended landing's
  divisions carry no voyage: its words stopped being true when it ended (the cancelled row said "it sails when its
  transports … are ready").
- **Consequences.** `landingRow1938` (worker): gathering and at-sea cancels, both `cancelled`, none lost, ashore
  by Tokyo; red before. `landingsBar1938`: the button, the row over and cancelled, the division free.

### ADR-854 · 2026-11-07 · accepted — The landings bar (R47b)
- **Decision.** `LandingsBar`: top middle under the top bar, a row a landing: "{city} from {port}", where it stands
  (sails in about N days; waits for the landing from another port; at sea; turning back; how it ended), and while
  it gathers its transports had and needed. A click on the row opens it: the wait at the port and each division
  with what its panel says, by one function (`voyageText`, `waitText`, moved out of `FormationPanel`); the anchor
  flies to its land. It gives way to the History, Relations, Settings and Editor panels and a nuclear alert, which
  stand there; on a phone it takes the view's width where the ranking stood (the ranking gives way to it, and it to
  a nation's panel). A row of its own, not the ticker's: the ticker's rows are one event each, and its room beside a
  panel and on a phone is spent (ADR-754, ADR-837). Hero tags keep clear of it (`COVER_SELECTOR`).
- **Consequences.** `landingsBar1938`: Japan's division Tokyo → Shanghai, each 12 hours the row's division line is
  its panel's status, gathering → at sea → "over: 1 landed", gone a day on; on a landscape phone and a phone the bar
  is inside the view, under the top bar, clear of the ranking.

### ADR-853 · 2026-11-07 · accepted — A landing's row: its data from the worker (R47a)
- **Context.** R47 wants each of the player's landings as one row (the critic's idea since run 32): what its
  divisions' panels say, together, with its ships, its days to sail and its outcome.
- **Decision.** `landingRows(world, nation)` (sim, read only) gives each landing's state, port, water, land, target,
  living divisions, transport ships needed (their men, `TRANSPORT_MEN` a ship) and had (its groups' room), and
  `sailsIn`. The worker turns them into `LandingRow`s at each hour's end: names (the port, the city nearest its
  land), each division's `voyage` as its panel's, days to sail as the click's hint rounds them; a landing gone since
  the last hour is `over` with an outcome from its divisions' events (landed, thrown back, lost at sea; else
  `cancelled` when it was turning back, `over` otherwise), kept 24 hours. Sent only when they change; forgotten
  at a load. The page keeps them in `hud.landings`.
- **Consequences.** No sim rule and no state: the pin does not move. R47b draws them; R47c adds the cancel.

### ADR-852 · 2026-11-07 · accepted — Sea battles listed with a camera (R46)
- **Context.** The critic's sea-balls probe looked at seed 20885 where seed 7019's battle had been, and found no
  ship (run 50, `c50_sb_20885`, 0 elements): it had no way to find a battle on the seed it played.
- **Decision.** `tools/diag/seaBattles.ts` follows `world.seaBattles` hour by hour: each record from its first hour
  to its `SeaBattle` row, with its first and last tick, the place it began (cell, zone, sea name), sides, fleets
  with their ships, losses, and a camera at its first hour (the middle of its fleets; m/px holding them in 700 px,
  40 to 400). A battle begun and over in one hour is made and dropped inside the tick, never seen at an hour's end:
  its fleets are those of its sides' nations, or at war with them, within 16 cells (a carrier's wings fight from
  far: 7019 t21185, Japan's carriers 14.5 cells off). Carrier sinkings out of battle are listed too.
  `tools/diag/seaBattlesLook.ts` opens the seed in the page, steps to each battle's first hour, sets its camera and
  counts the ships of each side drawn in the view (`view.elementPlaces`); a battle with no fleet is not seen.
- **Consequences.** 3 seeds × 5 years: 275 battles, all seen with both sides' ships (one side where it was all sunk)
  and no page error. No sim rule changes: tools only.

### ADR-851 · 2026-11-07 · accepted — The critic's replay is a tool (R45)
- **Context.** Each batch began by replaying the last critic run's headless jobs from a hand-built list
  (`.cache/replay49/jobs.txt`, `suiteP.sh`) and diffing outputs by eye; 20 sims at once were killed for memory.
- **Decision.** `tools/diag/replayCritic.ts` reads `critic/scripts/c<N>_jobsAll.txt` (the latest N), rewrites each
  job's `critic/c<N>_…` outputs into `.cache/replay<N>[-<commit>]/`, and runs them 6 at a time (`--jobs`), at HEAD
  or in a worktree at the report's commit or any (`--at`; HEAD's `critic/scripts` copied in, the junction to
  node_modules taken down before the worktree). Each output is compared with the critic's after the run's wall
  time is taken out (`ms`, `wallS`, `…Ms` keys; seconds in text); sim times (`at`, `sailedAt`) are compared. A
  family is the script with its mode and its non-number env words; `--new K` runs each family's first job on K new
  seeds (60001 + 100·family + 2k). The report (`REPORT.md`) names each case that differs with what both say (a
  log's last line, or a probe JSON's findings) and the first line that differs. Run 50's job list is the only
  input it reads from the critic: it stays read-only.
- **Consequences.** At run 50's commit: 65 of 65 the same (`docs/replays/run50-at-3fe138b1.md`). At HEAD
  (`docs/replays/run50-at-abaceed3.md`): 30 the same; 35 differ, each for a change since: the landing checker's
  `slowClick` lines (R43), transports sailing at once (sailedAt 830 → 3–8, R43f), a far landing's fleets and
  sea events; every landing log still "0 broken". 95 jobs on new seeds, all exit 0; each checker "0 broken".

### ADR-850 · 2026-11-07 · accepted — The reports' small ideas: three were done, a fleet back with the AI is told (R35)
- **Context.** R35 gathered four ideas from the critic's "Ideas from other games": an order's error cleared by any
  new order (EU, for R35-N1); a flag at the destination while choosing (Supreme Ruler, EU); a long-press preview of
  an order on touch (Supreme Ruler, HoI); a mark on a fleet the player no longer commands (for R31d's transports).
- **Decision.** The first three are in the game already, and nothing is added: a refusal goes with the formation's
  next order (R24c, `staleNotice` by `orderedAt`; `orderNews1938`); the landing's mark is the flag on the coast
  (ADR-827); a touch screen's first tap previews an order over the sea (ADR-849; a long press is the box already).
  The fourth: the worker remembers each fleet of the played nation that has been on a player's order (its own, or
  a landing's) since the game was opened; its panel says "Done with your orders: the AI commands it again" while it
  is on none and the player's navy is the AI's (`FormationDetail.aiRun`), not after a refusal. A panel line, not a
  map mark: every fleet of the player's is the AI's by default (ADR-759), and a mark on each would say nothing.
- **Consequences.** R31d's released transports read so; a fleet never ordered has no line. The memory is the page
  worker's, not the sim's: a reload forgets it.

### ADR-849 · 2026-11-07 · accepted — On a touch screen an order over the sea takes two taps (R34k3)
- **Context.** R39-N2: the landing's mark (ADR-827) comes of a mouse's hover; a touch screen has none, and a tap
  over the sea ordered at once, the landing never shown: the blind click ADR-827 set out to end.
- **Decision.** A tap of the player's selection on a cell with nothing of theirs under it shows the hover there
  (`MapView.hoverAt`: the tooltip, and the sea hint asked as a mouse's) and asks the worker; an order that does not
  go by sea is sent at once (one round trip later); one that does waits for a second tap on the same cell with the
  same selection, and the tooltip says "Tap again to send them". The next finger down clears the tap's hover, so a
  pan or a pinch shows nothing. A mouse is as before.
- **Consequences.** A phone's order over the sea is two taps; a march by land still one. Long-press boxes, God
  tools and picks are untouched (they come before it in `onPick`). Tested by `landingMarkMore1938` (a phone).

### ADR-848 · 2026-11-07 · accepted — A sea hero does not come back under an enemy fleet (R34i)
- **Context.** R32-N5: sea heroes die often (Sovetsky Soyuz 46.7 times in 20 years over ten seeds). Six seeds ×
  five years, heroes on: 62 Soviet losses; 19 sea-hero losses within 24 hours of a return. The cause: a hero comes
  back on its port's water (R10, ADR-813, ADR-816) whatever is there, and the US fleet with Iowa (5867), or Hood
  (4253), held Leningrad's water: raised alone under it, sunk in 2 to 12 hours, every 60 days, eight times running.
- **Decision.** `returnPlace` skips a port with an enemy fleet within `BLOCKADE_CELLS` (2) of its water: the base
  first, then any port, on the start's basin as before; none left, the hero waits, and its row says why
  (`heroWaits` 'blockade': "waits: enemy ships hold its ports"). The checker's rule reads `returnPlace` and holds.
- **Consequences.** Losses within 24 hours of a return 19 → 2. Soviet losses only 62 → 58: the second cause,
  found and not changed, is the naval AI's. A nation with no other fleet of power leaves its hero to the rest of the
  naval AI (ADR-793), which turns a fleet home only at `AVOID_RATIO` (1.5×) the enemy's power: Sovetsky Soyuz
  (25,000) sails out of Leningrad at Hood (25,000) and the British bombers, and loses (5867 days 1145–1334: lost
  60 to 71 hours after each return). That rule is every fleet's; a fight at even odds is not wrong by itself, and
  a change of it is the user's (it moves every world). Heroes are off by default: seed 99's pin does not move.

### ADR-847 · 2026-11-07 · accepted — The relations graph's labels: one size on the screen, none over another (R34a)

- **Context.** Critic run 37's R37-N4, carried to run 50: labels printed over each other ("AustraliaUnited Kingdom",
  "Albania Manchuku"), and on a phone not readable: 10 drawing units are about 6 px in a 390 px panel.
- **Decision.** Labels are 11 px on the screen at any zoom (font size in drawing units set from the drawing's width
  on the screen, `ResizeObserver`), drawn in one layer above the nodes, and placed by `placeLabels`
  (`src/ui/relationLabels.ts`): in order of importance (the selected nation, the focus, then the largest, then the
  most tied), each at the first of below, above, right and left of its node that overlaps no label placed before it
  and lies in the view; one with no room is not drawn. A hidden name stays in its node's title and a tap's footer,
  and zooming in names more. Which nodes may be named is unchanged (at the whole graph: large, tied, chosen).
- **Evidence.** `relationLabels.test` (dense random graphs: no overlap, in view, the first named);
  `relationsLabels1938` on run 50's worlds a year on (20887 desk, 20889 phone, whole and ×3.4): 0 overlapping pairs,
  every label ≥ 10 px; red before (18 overlapping pairs zoomed in). `docs/evidence/R34/`.
- **Amended (a test it moved).** R11's `heroesRead1938` phone case asked a zoomed name to be twice its size on the
  screen (R11 made names readable by zooming, from ~6 px); since R34a it is 11 px at every zoom: the claim is now
  ≥ 10 px whole and zoomed (missed by R34a's spec run; found running R34c's).

### ADR-846 · 2026-11-07 · accepted — A landing ready to sail waits six days for those still marching, from the hour it was ready (R44a)

- **Context.** `slowClick` (ADR-845) on run 50's 19 seeds broke on 20827 (Britain): every southern port and
  Liverpool bombed shut, Newcastle the nearest open port of all. t708's click of six joined a landing there; 277 and
  both groups stood at Newcastle by t804, and the landing waited 8 days more for divisions walking from London. The
  wait was read anew each hour: a division of the click was waited for however far, and R31f's later ones once within
  a week, so each came within the bound in turn. Not ashore after 12.8 days (best way 5.8).
- **Decision.** A landing is ready the first hour its groups stand at its port with a division there
  (`Landing.ready`, saved in an optional section `world.landingReady`, so older saves load; reset for the next
  voyage). From then it waits only for those there within `READY_WAIT_HOURS` (144) of that hour, or of their own
  joining if later. Before it is ready, a division of its click is waited for while there within `READY_WAIT_HOURS`
  of the hour the landing could sail without it (`readyHours`). One not waited for goes on the next voyage (R31f's
  way, the transports coming back), and its panel says "its landing sails before it is there" (`later`), not "its
  landing waits for it". Six days: a day inside `slowClick`'s week for the estimates.
- **ADR-838's "not taken".** The user chose a sibling at the nearer port over "sail and let it follow" with a month
  bound. Here there is no nearer port (one open port for all), and the bound is ADR-843's week: a sibling cannot fix
  this case, and a click otherwise has no bound. Where a nearer port exists R43a's sibling still comes first (the
  click's own path, unchanged).
- **Stands on (ADR-803).** ADR-838 (`landingOwnPort1938`), ADR-836's sibling wait, R31f (`convoyLateOrder1938`),
  R17b/R38e's next voyage and `leftBehind`, ADR-837's `landingClickWait1938` (unit and spec): green before and after,
  with the whole unit suite and the 16 landing specs. One claim changed: `landingLegacySave1938` (R33b, a pre-R33b
  save of 3517 holding R49-N5's own pair) said the two land within a day; 365 was 448 hours off when the landing
  was ready, so they waited 19 days. Now 364 lands at t185 and 365 on the next voyage (t634), and its panel says so.
- **Evidence.** 20827: 0 broken, the click ashore after 10.5 days (4.6 over). Run 50's 19 seeds: 0 broken, the
  worst 4.6 days over (20827), others as before or within half a day (20821 1.7 → 2.2, 20825 −0.4 → 0.6, 20829 2.5
  → 1.7). The grid: 0 `slowClick`, the same 3 splits. `landingInvariants1938` runs 20827 (red before at t1016).
- **What it does not give.** A sibling at another port is still waited for up to a month (ADR-836), longer than this
  week; no seed broke on it. No news row for one left marching (as R31f's): its panel tells it.
- **The pin:** unmoved (player-only rule).

### ADR-845 · 2026-11-07 · accepted — `slowClick`: a click's landing ashore within a week of its best single-division way (R44)

- **Context.** ADR-843 (the user's decision), proposal 2: R49-N5 and R50-N1 were one class, a click whose landing took
  many times its crossing, and no checker bounded it (`farPort` only a division alone).
- **Decision.** `tests/helpers/slowClick.ts`, run by `landingInvariants` (the fuzz) and `landingGrid` (the grid): a
  click over the sea is broken when its first division ashore (abroad) comes over `SLOW_CLICK_DAYS` (7) after the
  click's best single-division way, or while it is still on its way past that. The best way is `farPort`'s reckoning,
  now one function (`bestWayHours`): the march to the division's land's nearest port or the sail there of a group a
  call tries (`callCandidates`), the later, then that group's voyage; the best of the click's divisions, reckoned on
  the world before the click. Told why at the click is a refusal in its hour only; the hover's day count is not (run
  50 filed R50-N1 with "sails in about 35 days" on the screen). A later click takes its divisions from earlier ones;
  a click with no group to reckon by is not judged (counted in the note).
- **Stands on (ADR-803).** `farPort` unchanged (its reckoning moved into `bestWayHours`): `landingInvariants1938`'s 11
  tests green before and after. No sim rule changed: the pin unmoved.
- **Evidence.** `slowClick1938` (the critic's clicks, Japan's nearest Tokyo to Shanghai): at `3fe138b1` 20661's two
  not ashore after 11.8 days (best 4.8), 20841's three after 10.8 (best 3.8), broken; at HEAD 4.8 and 4.9 days (0.1 and
  1.1 over). Run 50's 19 landing seeds: 18 clean (worst 3.8 days over, 20629), 20827 broken (R44a). The grid (400 cases
  run of 480): 0 `slowClick`, worst 14 hours over; its 3 splits (3517, recall at 120 h) are HEAD's without the rule.

### ADR-844 · 2026-11-07 · accepted — A nation God founds is of the province clicked: its capital is there (R43f)

- **Context (the critic's R50-N6).** God's Spawn nation on Greater Poland, five provinces, founded "Free Silesian
  Voivodeship": a founded nation is named for the province of its capital (ADR-100, ADR-103), and the capital was
  the area's largest city, Katowice. The run's other case, "Free Saxony" for the probe step called `revolt_bavaria`,
  was right: the probe's cell (Berlin −6, +10) is in Saxony (province 118), in the page and headless.
- **Decision.** `spawnRebels` takes a `seat`, the province God clicked (`forceRevolt`, `spawnNation`): the capital
  is the seat's largest city that is no other nation's capital, else the nation's own cell nearest the seat's
  middle. The origin rule is unchanged (the province of the capital's cell), so the name is the seat's. A revolt
  of the sim's own and a Kill's pieces have no seat: as before.
- **Stands on (ADR-803).** ADR-100 and ADR-103 (origin = the capital's province; the capital's cell, not its
  coordinates): their tests in `nationNames.test.ts` green before and after, and the every-province revolt test still
  finds no capital outside its origin. SPEC §3.4's `forceRevolt` and `spawnNation` line names the seat.
- **Evidence.** `nationNames.test.ts` "a nation God founds is named for the province clicked": every 7th province ×
  sizes 1, 2, 5, 12, 24 and region revolts, over 2,000 founded (over 1,000 of several provinces): 1,698 named for
  another province before, 0 after. The critic's probe replayed on the build: "Free Greater Poland Voivodeship was set
  up on land of Poland", its capital flag in Greater Poland.
- **The pin:** not moved: God's commands are not in the pinned run.

### ADR-843 · 2026-11-07 · accepted (the user's decision) — Naval's bar after run 50: name the 8, bound the click, show the landing

- **Context (the user asked, 2026-11-07: analyse the loop; can anything improve naval's chance of its bar?).**
  - Naval was 8 from run 28 to the release (run 31). It has been 7 (once 6) in all 19 runs since, 32–50. Every other
    dimension is at its bar.
  - Runs 32–48: a blocking landing issue nearly every run (ADR-829, ADR-833 cover this).
  - Runs 49 and 50 are a different problem. Zero blocking issues, and naval still 7. Run 49's reason: "nothing new in
    this run earns an 8 (a score above 7 needs explicit evidence). The fixes remove run 48's two reasons, but they add
    no new strength." This is ADR-829's third exit (no blocking issue, a score under its bar), twice in a row; naval is
    exempt from the exit (ADR-833). The levers for "no defects" and for "evidence of an 8" are different.
  - Since the release: 119 commits, 82 of them items, 63 of those subjects on landings, ports or transports.
    `src/sim/systems` +1,581 lines; `landings.ts` 1,190. `critic/scripts` 3,178 files, 150–250 more per run.
  - The 8 at the release was earned on sea battles, sea heroes and the navy rules (0 broken over 20 years). Since R17
    the critic's naval evidence is the player's landing alone. Its sea-balls probe found no ship to draw in runs 48
    and 50 (`critic/c50_sb_20885.json`, el 0), so the fleet war adds no evidence for an 8.
- **Findings.**
  1. **The critic never names what naval's 8 needs.** Each naval row is a "Not 8" list of defects. Stability is the
     precedent: run 49 named what its 8 needed (page years with no error, save and load in the page). R42 closed it,
     and run 50 gave the 8.
  2. **The last two naval findings are one class that no checker bounds.** R49-N5 (26.3 days for a 5-day crossing)
     and R50-N1 (39.6 days for 4) are both a click whose landing takes many times its crossing. `landingInvariants`
     bounds this only for a division landing alone (`farPort`); a click of several divisions is a note, never broken.
     R43a fixed the instance (39.6 → 5.4 days). The seam between R37c, R41 and R43a's waits is left, and the critic
     probes there ("two rules about the same click disagree").
  3. **The critic's ideas reach the roadmap late.** HoI's "the invasion as one operation" was in the ideas from run 32
     and was taken at run 43 (ADR-829). Its other repeated naval ideas are still not taken: one panel or bar per
     landing with its divisions and its transports needed and assigned, and one outcome per operation. "Each embarks
     at its own nearest port" (run 50) was taken in the same cycle (R43a), so the lag is shrinking.
  4. **The pre-critic replay (ADR-833) is rebuilt by hand each run** (`.cache/replay49/jobs.txt`, `suiteP.sh`,
     uncommitted). It replays named cases. The critic's next finding comes from a new seed or a moved parameter.
- **Proposed** (each one separate; none changes a bar, so none is ADR-828's way 3):
  1. **CRITIC_PROMPT: a score under its bar names the evidence that would earn the bar**, as a case the builder can
     run (a seed, a probe, a figure). This is a change to the critic's brief, so it is the user's decision. Highest
     leverage.
  2. **Checker rule `slowClick`** in `landingInvariants`: a click's landing ashore within its crossing plus a fixed
     slack (e.g. its best single-division way + 7 days), or told why at the click. It runs on the checker's seeds and
     run 47's grid, and it is the bound that every wait rule (R31f, R37c, ADR-836, R43a) must keep together. A ROADMAP
     item before critic run 51, with no new landing rule unless the checker finds a break.
  3. **Show the landing as one thing** (the critic's idea since run 32): a row per landing, with its target, its port,
     its divisions (at the port or marching), its transports needed and assigned, the days to sail, and a cancel. The
     sim has had one object since R33b (`world.landings`); the player still reads it division by division. Most naval
     non-blocking issues were "untold" or a cut row, and one place to read them also gives a strength to point at. A
     ROADMAP item in R34's place for naval (R34's R36-N3, R39-N2–N4 and R40-N2 are landing readability).
  4. **Fleet-war evidence the critic can find:** a `tools/diag/seaBattles.ts` that lists where and when sea battles
     and sinkings happen on a seed (the critic's brief runs `tools/diag/` checkers). Sea battles are the 8's other
     source, and the critic's camera currently misses them.
  5. **The replay as a committed tool:** `tools/diag/replayCritic.ts` builds the job list from the last report's JSON
     and `critic/scripts`, and adds N new seeds per probe family (as the critic does). Before each run it replays the
     named cases and a fuzz of those families.
  6. **On a dimension under its bar, each of the report's design objections and ideas in that dimension** gets a
     one-line ROADMAP entry in the commit that files the report: taken, or the reason it is not.
- **Not proposed again:** taking the landing out (way 2) or releasing at 7 (refused in ADR-827, 828, 829, 833).
- **Status.** Accepted 2026-11-07 by the user: "Yes, let's do all 6, but can we do option 2 before next critic
  run?" So:
  - 1: `CRITIC_PROMPT.md` OUTPUT 4, "what the bar needs" for every score under its bar (now).
  - 6: PROMPT.md "RELEASES" step 1, the filing commit files that dimension's objections, ideas and "what the bar
    needs" (now).
  - 2: ROADMAP R44, in R43's batch after R43f and before critic run 51 (ADR-842's R34 and R35 stay before the run).
  - 5, 4, 3: ROADMAP Batch 4, R45 (the replay tool), R46 (`seaBattles`), R47 (a landing as one row), after R35.
  - Amended the same day by the user: "no, sorry let's do all before 51". Every option comes before critic run 51:
    R43f, R44, R34, R35, R45, R46, R47, then the run.

### ADR-842 · 2026-11-07 · accepted (the user's decision) — R34 and R35 before the next critic run

- **Decision (the user's, 2026-11-07: "make sure that R43f, R34, and R35 are all scheduled before next critic
  run").** R43's batch does not end at R43f: Batch 3's R34 (the critic's carried issues) and R35 (small ideas) are
  done next, and the critic runs once after R35 (PROMPT.md "RELEASES" step 1), judging R43, R34 and R35 together.
- **Consequences.** No critic run between R43f and R34. The order of the items is unchanged (R43f, R34, R35). Naval's
  ADR-833 loop (fix, then the critic, until it is at its bar) waits one run longer for its next score.

### ADR-841 · 2026-11-07 · accepted — A landing that ends stops its divisions' march to its port (R43e)

- **Decision.** However a landing ends (its groups sunk with none to come, its port bombed shut or lost, no sea way,
  no transports, its target a neutral's), its divisions still marching to its port stop where they stand
  (`endLanding`); their order is over, and the AI has them from the next hour (ADR-759). R21a's stop at a peace is
  now this one rule.
- **Why.** Critic run 50, R50-N5: 20845's two, told their transports were sunk and the landing over, walked on to
  Hamburg for six days (t222, t242): an order the player did not give.
- **Stands on (ADR-803).** R21a (neutral: those marching stopped; `landingNeutral` green), R31b (port shut or lost:
  all told), R39a (sunk: another called, the landing goes on and its march with it; told 0 only when over;
  `landingSunk1938` green), R33b and ADR-759 (a division of a landing is the player's while it is; after, the
  AI's: `playerOrderSystem` drops the order of one standing in no landing). No AI rule: the pin of seed 99 unmoved.
- **Checker (ADR-804).** `landingInvariants` `marchOn`: a division out of its gathering landing with no click that
  hour, still marching to its port. Run 50's 19 landing seeds: before, 5 broken (28 cases, all England's: Portsmouth,
  Brighton, Chatham, Liverpool, Cardiff); after, 0. `landingEndedMarch1938` (sunk, port lost; red before).

### ADR-840 · 2026-11-07 · accepted — On a phone a tap opens an order row to its full words (R43c)

- **Decision.** On a phone (`compact`) the first tap on an order row told by its brief (R42b, R43b) opens it in place
  to its full words: a loss of several names every division; the next tap flies to the place and forgets it, as a
  click does. One row open at a time; a desk keeps one click (its tooltip has the words).
- **Why.** Critic run 50, R50-N3: the names were only in a tooltip a phone cannot hover. Not taken: the formation
  panel (a division lost at sea has none, and the click opens no panel: ADR-839's "the panel the click opens keeps
  them" was wrong, the words were in the panel only when the player selected the formation).
- **Bound.** Six lost at sea, opened, on the screen beside the panel and not under it, at 390 × 844 and 844 × 390
  (`orderRowsTap1938`).

### ADR-839 · 2026-11-07 · accepted — A single order row beside a panel by its gist (R43b)

- **Decision.** In the ticker's one-line rows (beside a panel, a phone) every order news has a brief: a division by
  its number, as its counter ("366: transports sunk, the landing is over"), a hero or a wing by its name; a refusal
  "not done, " and its reason's gist (`order.whyBrief.<reason>`, 20). The full words in the row's tooltip, as R42b's
  merged rows; the panel the click opens keeps them too. Not taken: two lines an order row (ADR-754's room, as R42b).
- **Why.** Critic run 50, R50-N2: "Square infantry division 366: the transports of its…", "…: not done: there is o…".
- **Bound.** Each kind and each reason, a division beside the longest name that can be told it (P.100 Ercole, Sovetsky
  Soyuz, Improved fighters), whole at 1600, 844 and 390 px (`orderRowsBrief1938`).

### ADR-838 · 2026-11-06 · accepted — A click's division a week nearer its own port boards there, a sibling landing (R43a)

- **Decision (the user's, 2026-11-06: "option 2", then "one week, do it fully").** A division ordered over the sea
  whose click's landing gathers at another port than its land's nearest, with none gathering there, makes a landing
  of its own at the nearer port when a group free there or one called there lands it `SPLIT_SOONER_HOURS` (a week)
  sooner than the click's landing would. The two are siblings (R37c) and wait for each other to land together. Not
  taken: the same month bound for the click's own last division as for a sibling's (ADR-836), sail and let it follow.
- **Why.** Critic run 50, R50-N1: 20841's three Tokyo→Shanghai waited 35 days at Tokyo for one walking 41 cells from
  western Honshu (landed after 39.6 days); 20661's two after 26. Now 5.4 and 5.3 days. R38's "Not taken" (one
  landing a port for every click: 35 → 160 splits on run 46's grid) is not this: a sibling only a week sooner, and
  siblings wait for each other.
- **What it took.** A gathering landing's voyage counted from its port, not its groups' sail to it (else a group
  still sailing there made the sibling look days later: 89 splits on run 47's grid, then 46); a sibling waited for
  only past a day and 12 hours (`SIBLING_SLACK_HOURS`: 40 of the 46 were 25 h apart); a landing waits six hours
  after its last order while another of its click gathers (`CLICK_HOLD_HOURS`: a click's orders one by one, the
  first sailed before the second found it). Run 47's grid (403 jobs): splits 5 → 5 (one gone; the new one a re-sent
  division that met the enemy on its march, its two partners now landed, none before), cases with no landing 54 → 30,
  259 last landings sooner (7,909 days in all), none later; refusals 394 → 416, met-the-enemy as more get ashore.
  Run 50's 19 landing checker seeds: 0 broken.
- **Tests.** Setups of one landing at Tokyo placed their divisions within Tokyo's reach (`nearPort`, 8 cells; the
  two-nearest-Tokyo pair was 365 near Ōsaka, R49-N5's case itself); claims unchanged. A recall 5 days out finds the
  partner's landing sailed (none to turn back to): told none, both land at Shanghai. 19206's 367 no longer marches
  (46 → 28 → 4 days): its note's claim is now no division gathers two weeks; ADR-835's march-is-not-a-stall rests
  on the planted cases. R31f's late order (`convoyLateOrder1938`): Honshu's farthest boards at its own port now (no
  march), so the case is Tientsin's: its two nearest to Tokyo, its farthest (390 h) three days later; the two land at
  hour 251 with it or without, 649 with R31f's rule taken out. New: `landingOwnPort1938` (20841, 20661, 3517's four with Sapporo's sibling told).
- **Consequences.** Player-only rule: the seed 99 pin unmoved.

### ADR-837 · 2026-11-06 · accepted — Run 49's issues (R42): a landing's wait told in days; heroes blended to 5,000 m/px; two order rows beside a panel

- **R42a (R49-N5).** The hover over the place of the landing they already have says when it sails, in days, once the
  click is taken (`seaHint`'s `sails`, `sailsIn`: `waitLeft`, or `siblingWait` where later); the marching one's panel
  its days to the port. Not before the click: no landing exists yet, and the order's port is chosen by
  `chooseTransports`, which sends a called group (a guess could name another port). 1938 seed 1, R22c's four to
  Shanghai: said 47 days, sailed after 46.6. The sibling's branch on `landingTwoPorts1938`'s three seeds.
- **R42c (R49-N1).** A hero's counter is 1× from 10,000 m/px and 2× from 5,000, by zoom level between (1.32× at 8,000,
  a Europe view); 5,000 not the critic's "for example 3,000": PLAN 7.184b3's accepted AT (`heroes1938`, 1.9–2.1× at
  5,000) stays green. Above 1× no wider than a quarter of the screen (the widest name's): inert at a desk, 1.07× on a
  390-px phone (Maus 12 % of it; the bar 38 %). `docs/evidence/7.184b/r42c-sizes.txt`.
- **R42b (R49-N3).** Beside a panel the last two order rows, the sea row giving way while there are two (ADR-754's room
  unchanged: `ticker1938` green); a loss of several by its count, its names in the tooltip. Not taken: two lines an
  order row (ADR-754's room, `ticker1938`'s two events). On a phone, upright or on its side, with two orders' news or
  more, the last two in place of the newest event: two rows in all, as ADR-760 has it (the user's choice of 2026-11-06,
  amending ADR-760's "the newest event and the last order"; R49-N3 cited the phone's shots too).
- **R42d (R49-N2).** `PuppetReleased` is a ticker kind, cue "return". **R42e.** "their landing… their port".
- **Budgets.** No sim system changed (`seaHint` and `voyageOf` are read on request); the frame adds one pass over the
  heroes (14) for the widest name.

### ADR-836 · 2026-11-06 · accepted — R38d's gate goes; a click's sibling waited for up to a month (R41)

- **Context.** ADR-835's `farPort` found that within R38d's gate (a far port under 20 straight cells beyond the
  nearer) a division walked to the far port's free group though a call to the nearer landed it 7–13 days sooner
  (18705 t784, 3517 t1574; critic run 49, R49-N4, 20621). The user chose to do R41 before R42. Dropping the gate
  alone made R37c's case split (`landingTwoPorts1938` red): the fresh one, from a nearer port, ready ~22 days before
  its pair walking to Tokyo, and `siblingWait` waits at most `LATE_WAIT_HOURS` (a week, R31f) for a sibling.
- **Decision.** The gate goes: any other port's free group is weighed against a call to the nearer by hours
  (`callSooner`, R39d). A landing waits for a sibling of its click while that one is ready within
  `SIBLING_WAIT_HOURS`, a month; a later order still within `LATE_WAIT_HOURS`. Without a bound (tried) run 47's
  `fresh2` stood still: the Tokyo pair waited on a landing that waited two months for a mate in the north, and none
  landed in the case (run 47: the pair at hour 656). A month is the bound both cases allow.
- **Evidence.** Run 47's 383 cases: 35 split as in run 47; only four changed (England, 274: a call to Portsmouth,
  landed at hour 64, where it walked to London and was refused `PortShut`). Every checker seed the critic has run:
  0 broken, with `farPort` at any distance. 19206's 367: 46 → 28 days in a gathering landing.
- **Checker.** `farPort` breaks at any distance; a landing gathering for the same water as one that gained ground
  gains it too (a wait for a sibling is not a stall); an escort let go is forgotten (20405 t1694: two one-hour
  orphans a month apart read as two hours running). `landingInvariants1938`'s 19206 case: its march over 20 days
  (over 40 before; 28 now).

### ADR-835 · 2026-11-06 · accepted — The landing checker's `stuck` is a stall; `farPort` (R40e, the user's decision)

- **Context.** Critic run 48 kept R47-N4 open: on 19206/19207 the landing checker said `stuck`, a division 45 days
  in a gathering landing. Traced: 19206's 367 marched ~70 cells to Kure at ~1 a day, its click's landing, through
  landings 7, 11, 12, 7 as the checker's own orders re-clicked it. The critic: "`stuck` is a wait limit… nothing it
  is told is false"; R39e (one click lands together) makes a long march to the click's port the rule's own result.
  No port rule cleared 45 days without splitting clicks. The user decided to refine the rule, and asked how the
  critic would accept it.
- **Decision (the user's).** `stuck` counts the hours a gathering landing gains no ground: none of its divisions a
  straight cell nearer its port, none of its groups a cell nearer its port's water, than each has come. A landing
  re-clicked or redirected starts afresh. The checker does not go blind: stalls planted by hand (every division and
  group held where it stood, or the divisions walking a circle of 2 cells) are told `stuck`; the same orders unplanted
  are not. Nothing is hidden: each division's longest gathering spell, and its part with no ground, is printed as a
  note (19206's 367: 46.0 days, 3.5 with no ground). And a new rule keeps R46-N3's class (a 40-day walk within Honshu
  to a far port's free group) caught, as `stuck` once caught it: `farPort`, a division making a landing alone (new
  in the hour, its only division) at a port whose whole way (march, voyage) is over `FAR_PORT_DAYS` (7) longer than
  by its land's nearest port, with an idle group of its nation with room called there (`callCandidates`) — R39d's
  rule as a checker. Within R38d's gate of 20 straight cells the game takes the far group by rule: told as a note,
  not broken (R41).
- **Evidence.** HEAD with the fix below: every checker seed the critic has run 0 broken. At `4040cad6` (before R38d), the
  same checker breaks on 18705 (4) and 19111 (7): 367 to Sasebo 43–49 days, by Sendai or Hakodate 11–15. To run it
  there, `sailHoursFrom` and `callCandidates` were copied into that worktree's copy as at HEAD (read-only helpers;
  `callTransports` picks the same groups at both commits).
- **A fault it found.** A group freed by the click's own re-send (R37a, `freedGroup`) was taken at any port: 19207's
  366, re-sent from Hiroshima, walked 24 days to the group it had freed at Tokyo. Now judged as any free group far
  off (`callSooner`). 19207 and 19111 clean; run 47's 383 cases as in run 47 (35 split, none later, none changed).
- **Not taken.** Dropping the 20-cell gate and sending the far group itself to the nearer port ('fetch'): with them
  `landingTwoPorts1938` (R37c) is red and run 47's splits rose 35 → 58; filed as R41.

### ADR-834 · 2026-11-06 · accepted — A rising on an overrun overlord is a release (R40a)

- **Context.** Critic run 48, R48-B1: diploInvariants 20429 (random diplomacy) day 546, "DEI rose on NED and is not
  at war with it". A puppet at loyalty < 20 with a voice rises (ADR-184, ADR-807); its war of independence passed
  `whyNotWar`, which refuses a war on an overrun leader (ADR-229: "a holder that is overrun declares no war on its
  rebels"). The rising was told ("rose against") and no war came.
- **Decision.** The critic offered two ways: let the rising past `Overrun`, or make it a release in name. ADR-229
  chose the second for rebels (the overrun nation is left to the wars it is in), so a rising is told once the war is
  known: the subject is cut loose untold, leaves the wars beside its overlord (and an alliance shared with it), and
  then is told `PuppetRevolt` with its war if the war may be declared, else `PuppetReleased` ("was freed from").
  Any refusal does this, not `Overrun` alone. The checker's `rise` rule is unchanged: a told rising has its war.
- **Consequence.** In the log the rows "left its war with …" come before the release or the rising of the hour.
  The pin of seed 99: see the gate (no rising refused in its first year expected).
- **Done (R40a).** `puppets.ts`; `puppets.test` (red without it); 20429 random 3650 and the critic's four other
  ten-year seeds 0 broken.

### ADR-833 · 2026-11-06 · accepted — Run 45: R44-B1 left in one case; way 1 or way 2

- **Context.** Critic run 45 (focused, on `7e09b7b3`, R36): naval **7** (bar 8; run 44: 6); the rest as run 44.
  R44-B2 fixed on every water, seed and selection tried. R44-B1 fixed in all of run 44's shapes (0 of 8 split on
  3517, 15101, 18601; run 44: 6 of 8), but one blocking issue is left:
  - **R45-B1.** The same edit as R44-B1 where the group the re-send freed is busy: seed 18705, three of four
    re-sent to Fuzhou; the landing sails with two and 366 stands at Tokyo untold, landing alone 12 days later
    (976/977/1272; at `813eb375` 975/976/976). 1 of 40 shapes on five new seeds. Cause, read: `detachDivision`
    hands the old landing's spare groups to the AI at once; R36a's call (`callTransports`) takes only idle
    groups, so with the freed one under way for the AI the landing sails with what fits (R17b's next voyage).
  - **R45-N1.** Every re-sent part lands 5.5–6.7 days later than at `813eb375` (the call's wait), the panel
    reading "waiting for the rest of the landing" beside "2 of 2 at the port".
- **The exit (PROMPT "RELEASES", ADR-829).** Naval has been under its bar in three runs in a row (43: 7, 44: 6,
  45: 7). ADR-832 said a third regression of the landing means way 2; R45-B1 is not a new rule broken but R44-B1
  in a case R36a did not reach, so whether it counts is the user's call. No naval item until the user decides;
  R37 filed, held.
- **Proposed.**
  1. **One more bounded fix (R37), then the critic, with no further exit.** At the re-send the new landing keeps
     the old one's groups it needs (sized to its divisions, as `813eb375` did in effect), which also removes
     R45-N1's wait; the call may take the nation's busy groups; one left behind at the sail hour is told.
     `leftBehind` gets a pool that reaches it (one group short). If the next run has any blocking naval issue,
     way 2 without another proposal.
  2. **Way 2: take the player's sea landings out of this release** (orders over the sea refused, as before
     R17); naval was 8 without them. Release; bring them back next batch.
  3. **Release with naval at 7**, R45-B1 listed in the CHANGELOG (offered in ADR-827, 828, 829; not taken).
  Recommended: 1. The rebuild's direction holds (run 45: R44-B2 gone everywhere, R44-B1 gone in 39 of 40
  shapes, the AI's worlds byte-identical); the cause is one place, and the fix also wins back the 5.5 days.
- **Status.** Accepted 2026-11-06 by the user, way 1 without its exit: "Let's do option 1, and let's just keep
  fixing until this works - I think this is an important feature - otherwise it's hard for players to get
  troops across the sea. If there's anything we can do to anticipate the critic's objections, then let's do
  it." So:
  - The player's sea landing stays in this release. Way 2 is off the table, and for the naval dimension the loop
    does not stop at ADR-829's exit: each blocking naval issue becomes an item, fixed, then the critic again,
    until naval is at its bar. (The exit still holds for other dimensions.)
  - The naval non-blocking issues are taken with the blocking one (ADR-829: they are the next blocking ones):
    R45-N1 (with R37a), R44-N1 and R44-N2.
  - Before each critic run, the critic's own probes are replayed on new seeds (its `critic/scripts`: the
    split shapes, the recall and sea-click cases, the panel at each step), and what they find is fixed first.
- **Done (R37).** R37a: the groups a leaving division frees are that hour's (`World.freed`) and its new landing
  takes them first; short at the sail hour the call may take a busy group; one left for the next voyage is told
  (`NextVoyage`). R37b: the panel's voyage states `ready` and `nextVoyage`; aboard and not sailing reads "sailing
  back to {port}"; the notice of a landing left goes at the next order; a recall's hover names the port it turns
  back to. R37c: a landing waits for a sibling of its click (same place, another port) that would land over a day
  after it, unless that one waits over a week. Player landings only; the pin of seed 99 unmoved.
- **Done (R38, run 46).** R38a: those aboard transports sunk leave the landing in the hour and are told
  `LostAtSea` (75), not refused. R38b: a panel state `sibling`. R38c: the tooltip within the screen. R38d: a free
  group over 20 cells farther than the nearest port: one is called to the nearer. Not taken: joining a far
  gathering landing from the nearer port; it split one click into a landing per port (35 → 160 of run 46's 383
  cases); one click lands together (R37c) stands over a long march. R38e: the checker's `leftBehind` exempts a
  told next voyage; short pools. R38f: the sea hover for a gathering landing and for land formations. Player
  landings only.
- **Done (R39, run 47).** R39a: a landing left with no group calls one (free, idle or busy) and goes on; its groups
  destroyed, its divisions are told `TransportsSunk`, never "no transports at a port". R39b: notices keep the name.
  R39c: the tooltip above the mouse near the bottom. R39d: R38d's call taken only when it lands over a day sooner by
  hours. R39e held: one click lands together over a long march (19206, 19207). Player landings only.

### ADR-832 · 2026-11-06 · accepted — After the rebuild: run 44's two regressions

- **Context.** Critic run 44 (full, on `0fba90d8`, R33's end): naval **6** (bar 8; run 43: 7); every other
  dimension as in run 43 (semantic zoom, tanks, aircraft, AI nukes 8; the rest 7). Two blocking issues, both
  found on the same cases on both commits and both fine at `813eb375`, so both regressions of R33:
  - **R44-B1.** A gathering landing re-sent in part by one click keeps too few transports: the sail hour boards
    those at the port that fit and sails, the rest stand at the port untold and land alone ~12 days apart.
    Split grid 6 of 8 shapes on HEAD, 0 of 8 at `813eb375`. Cause, read: `gather` skips one with no room
    (`if (fleet === undefined) continue`); the part re-sent is given groups by the old landing's room.
  - **R44-B2.** All of a landing at sea ordered onto water is taken as a cancel (ADR-830: "a place not over the
    sea: sails back"), sails home and is refused `OpenSea` a day later. At `813eb375`: refused at the click.
  What R33 fixed, the critic verified: R43-B1 (recall, all hours), R43-N1, N2, N3, N4; old saves mid-landing
  migrate and land at the old hours; landingInvariants 0 broken on six new seeds; the AI's worlds byte-identical.
  Non-blocking: R44-N1 (stale recall notice), N2 (two clicks in one hour, two ports), N3 (long waits ashore,
  R31f), N4 (the checkers miss B1 and B2: two divisions only, no water click).
- **The exit (PROMPT "RELEASES", ADR-829).** A blocking issue is a regression of an item ticked since the last
  release; naval has been under its bar in every run since 32. The loop stops; no naval item until the user
  decides. R36a/R36b are filed in ROADMAP, held.
- **Proposed.**
  1. **Fix the two inside the object (R36a, R36b), widen the checkers, then the critic.** Unlike runs 32–43,
     neither is two rules meeting: B1 is one missing condition of the object's sail hour (room for all its
     divisions, or wait and say so) and its part-split; B2 is one missing refusal on its at-sea edit. N4 is
     why they got through: R36 makes `landingInvariants` click parts elsewhere and water, and check "no sail
     leaves a division at its port" and "room covers the divisions", red on `0fba90d8` first.
  2. **Take the player's landing (R17) out of this release**: orders over the sea refused as before R17; naval
     was 8 without it. Release; the object stays in the code for the next batch.
  3. **Release with naval under its bar**, or score naval against a fixed case list (offered in ADR-827, 828,
     829; not taken).
  The question that decides it: does the rebuild hold, so that its gaps are cheap? Run 44 says it fixed what
  it was for (five of run 43's issues) and its two holes each have a one-place cause. Recommended: 1, with the
  rule that a third regression of the landing in the next run means 2.
- **Status.** Accepted 2026-11-06 by the user: "Let's do option 1". R36a, R36b, then the critic; a third
  regression of the landing in that run means way 2.
- **Done (R36).** R36a: a gathering landing sails with room for all at its port (`noRoom`): short, a group free
  at its port or called joins it and it waits; with no group to be had anywhere, R17b's next voyage stands
  (`landingCall1938`'s three with room for two: two sail, the group comes back). R36b: all of a landing at sea
  ordered to the sea is refused `OpenSea` at the click and keeps its course; the hover says so (`seaHint` 3).
  The cancel is an order to land not over the sea. Player landings only; the pin of seed 99 unmoved.

### ADR-831 · 2026-11-06 · accepted — R33d: a recalled division rejoins its landing; the player's transports keep their order; the landing checker

- **Context.** R33b's grid left one case broken 15 times (the one walking re-sent elsewhere, then recalled to its
  landing: it kept a landing of its own at another port, and its mate's sailed alone). Critic run 43's R43-N1:
  transports the player ordered onto the Channel were the AI's the hour they came (R31d: "transports with no
  landing and nobody aboard are the AI's"), with nothing to tell the player. ROADMAP R33d also asked for the
  rules checked together on many seeds (as ADR-803's `diploInvariants`).
- **Decision.**
  - `redirectGathering`: a gathering landing whose divisions one click sends to a place another landing gathers
    for, at another port of their land, joins it when none of its divisions stands at its own port yet (one
    there does not walk to another port: R29b, `landingJoinsAboard1938`); each keeps the hour it joined the
    landing it leaves (`World.rejoined`, read within the hour, not saved), so R31f's window judges it from its
    first click, not its recall.
  - `PlayerOrderKind.called` (3): transports a landing called or holds. R31d's rule hands back only those; a
    fleet the player ordered keeps its order (`fleetOrderKept1938`: red at t26 before). A save from before has
    its landings' groups as `march`, kept till the landing frees them (`endLanding`, `detachDivision`).
  - A destroyed group leaves its landing at once (`leaveLanding`); it stayed listed till the next hour, and its
    id may be given again (found by the checker, seed 17203).
  - `tests/helpers/landingInvariants.ts` (`landingBreaks`) and `tools/diag/landingInvariants.ts`: random landing
    orders, the rules each hour (one landing a division and a group; no empty landing; none aboard standing
    transports while gathering; none of the player's orders aboard outside a landing; no idle spell aboard over
    72 h; a returning landing's march; no escort for none; none gathering over 45 days) and a save loaded
    bit-identical on probe days. 120 days on six seeds (Japan 3517, 4021, 8803; Britain 15101, 16117, 17203):
    0 broken. `landingInvariants1938` runs two of them 60 days.
- **Left by decision:** the grid's recall after 3 and 5 days (6 cases): the mate's landing sailed before the
  recall; the recalled one goes on the next voyage (R31f, ADR-828), not one already at sea.
- **Stands on:** ADR-830 (its tests green), ADR-828 (R31d: `landingJoinsAboard1938`'s idle check green; R31f),
  ADR-759 (the player's orders; a division whose order is over is the AI's to ship, so the checker reads the
  player's orders only). Pin of seed 99 unmoved.

### ADR-830 · 2026-11-05 · accepted — The player's landing is one object; its divisions wait ashore (ROADMAP R33b)

- **Context.** ADR-829 (the user's decision): rebuild the player's landing as one object. R33a measured HEAD
  `b166998e` on the grid (`docs/sweeps/landingGrid-R33a-b166998e.md`): 140 of 480 cases broken, all on seed
  3517 (idle aboard 125, split 15, no mark 5).
- **Decision.** `world.landings` (`src/sim/systems/landings.ts`): a landing has its target (cell, water,
  land), one port, its transport groups, its divisions (each with the tick it joined), one state
  (`gathering`, `sailing`, `returning`), the tick of its last order and its escort (`world.escorts`, now by
  landing id). Saved as `world.landings` only while not empty; a save from before (its `convoyPort`,
  `seaFetch`, `seaFetchAt` sections) is read into landings at its first hour (`migrateLegacyLandings`).
  - **The divisions wait at the port ashore** and board at the hour the landing sails: "loading" is that
    hour, not a state. So nobody waits aboard (R43-N3's two aboard for two months; R22b–R24a, R29b–R31c's
    rules for the one aboard at its port go). A division in a fight at the port keeps its landing, and the
    landing waits for it; the AI leaves a landing's divisions and groups alone while it is (ADR-759).
  - **Joining** (`chooseTransports`): a landing gathering for the same place (`sameLandingAs`, R24b/R25a's
    nearness) at a port of the division's land; else a free group at the port of its land nearest it; else a
    group called; else, as a later voyage, a landing for that place that sailed. A division leaving a
    gathering landing frees the groups it no longer needs, those at its port first (R40-B1).
  - **It sails** when its groups all stand at its port, none of its divisions at the port fights, it waits
    for none still marching (R31f's window: joined within a day of its first, however far; later, a week's
    march), its escort is ready (R22d), and an hour has passed since its last order (R40-N1). Those that do
    not fit go on the next voyage.
  - **The hour's orders, as a batch** (`landingOrders`, replacing `noteLeaving`/`heldGroup`/`groupsLeft`):
    one click sending all of a gathering landing's divisions to one other place over the sea redirects it
    (port and groups kept), or merges it into one gathering for that place at the same port; all of a
    landing at sea, all aboard: to a landing gathering for that place, its groups sail to that one's port and
    join it (R43-B1's recall); to another place over the sea, it sails there; to a place not over the sea, it
    sails back to its own port and they march once ashore (a cancel). Some of those aboard at sea: refused
    `AtSea` (20, R33c; `Aboard`'s "takes no order until it lands" was false for a whole landing). A division ashore otherwise leaves its landing for its order, back in it if refused (R24a);
    told `LeftLanding` where others go on (R25b).
- **Removed, with the rule each test pinned** (ADR-829: a test goes only with its rule): `heldGroup`,
  `comingTo`, `noteLeaving`, `promised`, `convoyTarget`, `loading`, `sailingToPort`, `ashoreAtPort` (as an
  order's), `soleAtSea`, `turnBack`, `ashoreFromShip`, `aboardAtPort`, `ownLanding`, `endConvoy`,
  `assignTransports`, `sailAboard`, `stillLoading`, `boardConvoy`, `convoySystem`; `world.seaFetch`,
  `seaFetchAt`, `convoyPort`, `leaving`, `groupsLeft`. `RejectReason.Loading` (R24d) is no longer given:
  `landingAboardRefused1938.test.ts`'s third case now asserts its outcome (taken; it lands at Fuzhou, the
  three at Shanghai together). `landingJoinsAboard1938.test.ts` (R29b): the one at the port never walks and
  the two land together at h657 (the standing-start figure); the fresh one, a landing of its own at another
  port, lands at h475: R29b's ferry to that port (`sailAboard`) is not rebuilt; its panel state `toPortAboard`
  now means a landing sailing back to its port. `landingJoinsAboardMates1938.test.ts`: R31c's state (aboard,
  sailing to Plymouth) no longer exists; the case's outcome (nobody lands in France) is asserted.
  `convoyPortShut1938.test.ts`: on 15101 the two now sail before Portsmouth is shut and land together; the
  test accepts that or both told. The panel's `aboard` state is `gathering` ("At {port}, waiting for the rest
  of the landing"); five landing specs' precondition follows.
- **Stands on (ADR-803), each test green before and after:** ADR-823 (the player's landings with escort:
  `landingEscort*`, `landingCall`), ADR-826 (no landing on a neutral's ground: `landingNeutral`,
  `landingPeace`), ADR-827 (the mark while choosing: `landingFor`, `landingHintSelection`,
  `landingReclickFuzz`), ADR-828's R31a–f (`convoyFleetOrderRefused`, `convoyPortShut` as above,
  `convoyLateOrder`, `landingRecallAtSea`), ADR-649 (`tryLanding` with `via`, the AI's and the sail hour's:
  unchanged), ADR-759 (the AI leaves the player's orders: `playerOrders.ts`), PLAN 4.5a/4.9b (the AI's and
  God's `seaBound` path: `seaBound1938`, `amphibious1938`, unchanged). The pin of seed 99 is unmoved (no
  player).
- **Grid** (R33a's, on this code, `docs/sweeps/landingGrid-R33b.md`): 15 of 480 broken (was 140): idle
  aboard 0 (was 125), no mark 0 (was 5), split 15 (was 15): all one case, the one walking re-sent elsewhere
  two hours after the first is at the port, then recalled 6 h to 5 days later: its mate, alone in the
  landing, sails (h186), and the recall cannot rejoin a landing at sea (h608). Open, for R33d. The longest wait at the port is 507 h, as HEAD's longest
  idle aboard: the wait moved ashore; it is no shorter (R31f's window, by decision).

### ADR-829 · 2026-11-05 · accepted — Stop patching the player's landing case by case (the user's decision)

- **Status.** Accepted 2026-11-05 by the user: "Go with option 2, rebuild the landing as one object. Make the
  process fix." ROADMAP R33; PROMPT "RELEASES" (the exit) and "KEEPING WORK SHORT" (an AT sweeps its parameter).
- **How (settled now, so R33 does not re-decide it).**
  - **Player landings only.** `amphibiousSystem` and `escortConvoy` also carry the AI's landings; the AI's path
    is untouched and the pin of seed 99 does not move. If the rebuild must change shared code the AI uses, that
    is an ADR of its own with the old and new hash.
  - **Save.** A `world.landings` section written like `world.seaFetchAt` (only when not empty, optional on
    load): older saves and scenarios still load. No new format refusal.
  - **The landing tests** (33 files of `tests/unit/*landing*`, `*convoy*`). Each test's case is kept and asserted
    against the object's outcome (land together, or refused and told). A test goes only with the rule it pinned
    (`turnBack`, `waitedFor`, `noteLeaving`, `heldGroup` …), each named in the item's evidence; an hour pinned
    by the old rules (h633) is not a requirement of the new design, "within a day of each other" is.

- **Finding.** The loop is not stuck on naval; it is stuck on one feature. Naval was 8 at run 28 and at the
  release. It fell to 7 at run 32, the first run after R17 (the player's landings, ADR-823, 2026-11-04), and has
  been 7 in all twelve runs since (32–43). All thirteen blocking issues of those runs (R32-B1 … R43-B1) are
  cases of R17's orders: a re-click, a redirect, a recall, a refusal, a port shut. Every other dimension is at
  its bar. 60 commits since run 32; blocking per run 1, 0, 1, 2, 2, 1, 1, 1, 2, 1, 0, 1: no trend.
- **Why case by case does not end.** A landing is not one thing in the sim: it is resolved per division and
  per hour from rules each measured from its own place (`landingOf`, `sameLanding`, `SAME_LANDING_CELLS`,
  `noteLeaving`, `heldGroup`, `assignTransports`, `waitedFor`, `seaFetchAt`, `turnBack`, `ashoreFromShip`,
  `endConvoy`). Each fix adds a rule, and the critic's next probe finds where two rules meet: R40-N1 → R31e →
  R43-B1 (a regression; R32a undid half of R31e); R41-N1 → R31d → R43-N1. ADR-828's "fix all six" made the
  next blocking issue. The critic has said so since run 35 (design objection) and in every "ideas" section
  since run 32 (Hearts of Iron: the invasion as one operation, its transports assigned, one port, a cancel
  returns to the port it left). That is not an idea list; it is the critic's diagnosis.
- **Proposed** (ADR-827 and ADR-828 offered only the first, third and fourth):
  1. Go on as now. Twelve runs say it does not converge.
  2. **Rebuild R17's landing as one object**: a landing with its target, its port, its transports and its
     divisions, one state (assembling, loading, sailing, landing, over), one sailing; a re-click, a redirect
     or a recall is an edit of that object; a cancel at sea sails back to its own port. The R21–R32 cases
     become its tests, and a landing checker (as `diploInvariants` for war) and R27c's fuzz extended to
     recall, redirect, port shut and late order, on several seeds, are its AT. One bounded item, then the
     critic.
  3. **Take R17 out of this release** (refuse player orders over the sea, or only allow them before boarding,
     as before R17): naval was 8 without it. Release; bring the landing back as way 2 in the next batch.
  4. Release with naval at 7, or score naval against a fixed list of cases (a change of the bars). Offered
     twice and not taken.
  The question that decides it: is the player's landing a must-have for this release? Yes → 2. No → 3.
- **Non-blocking issues and ideas.** The naval ones (R43-N1–N4) are the next blocking issues by the pattern
  above: not taken one by one, but inputs to way 2 (or moot under way 3). The twelve carried ones (R31-N1,
  R31-N6, R32-N2, R32-N3, R32-N5, R36-N3, R37-N3, R37-N4, R39-N2, R39-N3, R39-N4, R40-N2) are why other
  dimensions are 7 and not 8; none gates a release. They go into a readability batch after the release
  (PROMPT: work found during a batch joins the next), with the small ideas (the error cleared on a new order,
  a flag at the destination while choosing, a long-press preview, a mark on a fleet the AI took back).
- **Process.** PROMPT "RELEASES" step 2 loops blocking → item → critic with no exit, and step 3 has no path
  for "no blocking issue, a score under its bar". Proposed: when one dimension stays under its bar for three
  critic runs, the loop stops and writes a user's-decision ADR naming the structural options, as this one.
- **Note.** R32a's source change (`amphibious.ts`, `movement.ts`) is in the critic-run-43 commit `dc365b36`,
  not a commit of its own; the next critic run should diff from `813eb375`.

### ADR-828 · 2026-11-05 · accepted — The naval bar after ten rounds (the user's decision)

- **Context.** Naval has scored 7 against its bar of 8 in every critic run from 33 to 42. Ten rounds (R21–R30,
  with ADR-827's marker and fuzz between) fixed what each run blocked on; each fix, or the critic's next probe of
  the same feature (the player's landing over the sea), found the next case. Run 42 (focused, on `1eb4bf85`) has
  no blocking issue, and still names six non-blocking ones for naval: R42-N1 (a land order refused while the one
  aboard ferries between home ports, then it lands abroad untold), R42-N2 (a port bombed shut: its convoy sails
  with the one aboard alone), R42-N3 (a fleet order to a loading convoy's transports strands the one aboard),
  R41-N1 (a bound division walks to another port), R40-N1 (one re-sent alone sails at once), R37-N2 (a loaded
  convoy waits for any later order to the same coast). PROMPT's RELEASES have no step for "no blocking issue, a
  score under its bar"; a release needs every score at its bar.
- **Proposed.** One of: (1) go on as now: each named issue a ROADMAP item, the critic again, until it gives 8;
  (2) a release with naval at 7, its open issues listed in the CHANGELOG; (3) score naval against a fixed list of
  cases agreed now (a change of the bars, ADR-804): the landing cases R21–R30 fixed, as tests, plus these six.
- **Meanwhile.** R31 takes R42-N3, R42-N2 and R42-N1 (a division stranded at sea, one lost alone, one sent abroad
  untold: bugs whatever the bar), and the next critic run is full (a clean focused run is followed by one).
- **Status.** Accepted 2026-11-05 by the user: "Fix all six, then critic" (the first way). R31 takes all six
  (R31a–R31f), then a full critic run.
- **R31a** (R42-N3). A player's order to transports with a convoy (`convoyPort`) or carrying a landing is
  refused, `Convoy` (19, "these transports carry a landing, or load for one: they sail with it"): the one
  aboard takes no order, and ordered onto the Channel they stood there with it for weeks. The AI's orders
  (no nation named) are not checked. `convoyFleetOrderRefused1938.test.ts` (red without: it sailed).
  Player orders only: pin unmoved.
- **R31b** (R42-N2). A port bombed shut while a division marched to its convoy there: the division was
  refused at the port (`PortShut`, R21b) and the convoy, nobody else to wait for, sailed with the one aboard
  alone (Britain 15101: 270 at Calais h99, then lost). Now a convoy whose port is shut while it loads is
  over: those aboard are told `PortShut` and go ashore at the port, those bound are told (`endConvoy`). The
  player orders them again (another port). `convoyPortShut1938.test.ts` (red without); R21b's spec green.
  Player convoys only: pin unmoved.
- **R31c** (R42-N1). The one aboard transports under way to their convoy's port (R29b's), given an order not
  over the sea from that port (a march inland), was refused "aboard ... until it lands" and then sailed to
  France with the landing it was ordered away from (Britain 15101: 270 at Caen h99). Now it goes ashore on
  its side's land nearest the transports (`ashoreFromShip`, `strayLanding`: within AT_PORT_CELLS; they sail
  along its own coast) and takes the order from there; out of reach of such land it is refused as before.
  After: 270 ashore, marching; neither lands in France. `landingJoinsAboardMates1938.test.ts` (red
  without). Player convoys only: pin unmoved.
- **R31d** (R41-N1). The bound one of a redirected landing (365, bound for group 1144 called to Tokyo for
  it) walks to the other port's convoy (~29 days) while 1144 stood empty at Tokyo for a month: a fleet's
  player order never ended (`playerOrderSystem` keeps an order while the formation is `afloat`, which a
  fleet always is). Now transports standing with no convoy and nobody aboard are the AI's again.
  **Not chosen:** 1144 fetching 365 at Tokyo and ferrying it to Sasebo (R29b's state for the bound): on
  the trace 365 stands ~25 cells from Tokyo and ~33 from Sasebo at ~17 h a cell, so the ferry saves
  about two days for a cross-port convoy rule (a canonical port, every same-target check) that R21e
  exists to avoid; measured first, at the advisor's word. **Changed:** R22b's test
  (`landingAshore1938.test.ts`) expected the one recalled inland never to land in 70 days; once its march
  is over it is the AI's (ADR-759), which now ships it on the group it left, freed, to China at h183. The
  test checks the other three land together, as it says. `landingJoinsAboard1938.test.ts` (red without:
  1144 idle under the player's order). Player orders only: pin unmoved.
- **R31e** (R40-N1). The one aboard sent alone to another landing takes its own transports (R28a) and they
  sail at once; recalled a day later it was refused at sea and landed alone (seed 3517: Fuzhou h151; before
  R28a it rejoined, 631/632). Now the player's transports at sea with one division alone aboard, bound for
  its landing (`soleAtSea`), turn back for their nation's nearest port on an order to it (`turnBack`): under
  way there as R29b's (`sailingToPort`), it takes the order as at that port (R30b, R31c); refused, they
  sail on for the landing as before. An order for the landing it has changes nothing (`ownLanding`).
  After: both at Shanghai h633. **Changed:** the seed-2207 case of `serverOrderNews.test.ts` (a second order
  while aboard, to Kassel inland) is refused `NoLanding` (no water to land from), not `Aboard`; the voyage
  goes on as before. `landingRecallAtSea1938.test.ts` (red without: refused, Fuzhou h151). Player convoys
  only: pin unmoved.
- **R32a** (critic run 43, R43-B1; a regression of R31e). `turnBack` turned a convoy of one for the
  nearest port of its nation; the order was then taken there, and recalled after the first day the one
  aboard was put ashore and bound for its landing's convoy at another port, walking weeks (R31f did not
  wait for it: bound days after its landing's first) while its partner landed alone. Now the transports turn
  back only for the port where a landing for the order's exact target loads, and it rejoins it there, never
  ashore on the way; with none, the order is refused `Aboard`, as before R31e (so other orders at sea are
  refused: R43-N2, open). Seed 3517, recalled at 1, 2, 3, 5 days: both h633 (red: h633 walking, h1015,
  h1563, h230). The seed-2207 news test's Kassel order is refused `Aboard` again. Pin unmoved.
- **R31f** (R37-N2, named in runs 37 and 40-42). A landing loading at its port waited for any later order to
  the same target, however far: two aboard sat 45 days for a third ordered ten days later from 48 days
  away. Now each binding has its hour (`world.seaFetchAt`, saved while not empty; reset when R29b keeps one
  aboard), and a convoy waits (`waitedFor`: `convoySystem`, `stillLoading`, `waitLeft`, the panel's
  `landingWait`) for those bound within a day of the first of its landing at that port (its click, however
  far: R29b's 365 walks 32 days and is waited for) and for a later one only within a week's march; the
  rest stay bound and go on the next voyage. Seed 3517: two to Shanghai, the farthest of Honshu (1,094 h
  away) three days later: the two land h632/633 as without it (red: all three h1289/1290), the third h1290
  on the next voyage. **Not chosen:** a cap on the march alone (R29b's own-click 32-day walk would split).
  `convoyLateOrder1938.test.ts` (red without). Player convoys only: pin unmoved.

### ADR-827 · 2026-11-05 · accepted — Show the landing while choosing it (the user's decision)

- **Context.** Critic runs 33–38 each found the next edge of one feature, the player's landing over the
  sea (R17); R21–R26 fixed them one by one. Each was a case of one thing: the player clicks a cell and
  the game resolves it, unseen, to a landing (a water and a land cell, `landingOf`) that can lie cells
  away; a re-click, a near-miss or the news then disagrees with what the player meant. The critic has
  named it as a design objection since run 35.
- **Proposed.** While a land formation's order over the sea is chosen, the map marks the landing the
  click resolves to (its water and land, a ring and an arrow), and a click whose landing is a
  division's own is shown so. The order is the marked landing; with it, a fuzz test of re-clicks about
  a landing (1–4 divisions, at several hours, cells all around) that checks no landing splits and no
  news is false.
- **Other ways.** Go on fixing cases as the critic finds them (six rounds so far); accept naval at 7
  for a release, or score naval against a fixed list of cases (a change of the bars, ADR-804).
- **Status.** Accepted 2026-11-05 by the user: "Yes do 1 and 2 first" (the marker, and the fuzz of
  re-clicks), before the critic again. The third way (the bars) is not taken now. ROADMAP R27.
- **How.** One source of truth: the worker's hover answer (`overSea`) gives the landing to draw from
  the functions the order itself uses (`sameLanding`, the division's own landing; else `landingOf`
  of the click), so the mark cannot disagree with the order; `moveFormation` still sends the click.
- **R27a.** `landingFor(world, id, x, y)` (amphibious): the landing and the cell the order is for,
  kept (`same`) or the click's; `overSea` answers a `SeaHint` with it, and the worker's order news
  takes its `goal` (R26a's rule, now one function). `landingFor1938.test.ts`. Worker: pin unmoved.
- **R27b.** The mark is drawn over the unit markers, in orange (new) or green (the landing it has),
  each over a dark edge: amber read poorly on Japan's yellow and was hidden by a marker. The hint
  for the one aboard is asked from its port (`aboardAtPort`, factored out of `ashoreAtPort`;
  `overSeaFrom`): it takes orders there, and before it was "not over the sea". The hover is asked
  again at each tick (the answer turns on who is aboard or bound). **Not chosen:** marking every
  selected division's landing: a click sends one cell to all, and the first's answer is the one
  that differs only for one aboard or bound. `landingMark1938.spec.ts` (looked at). UI and a
  read-only query: pin unmoved.
- **R27c.** `landingReclickFuzz1938.test.ts`: two and four to Shanghai, re-clicked at hours 26 and
  200, one, two and three cells off in eight directions, the one aboard, one walking, or all: 288
  cases from four saved states, 26 s. Its finds, fixed here: (1) a whole click sent three cells
  south-west told the one aboard it "will not land with the rest" while the rest went with it; (2)
  one walking to its port, sent alone to another landing, left its partner to land alone, untold.
  `LeftLanding` is now noted in `orderMove` for aboard and bound alike and told once the hour's
  orders are in, only where another of its nation still has the landing it left. Judged by the
  landing, not the transports: two groups can carry one landing (R21e), and a first version by
  transports missed it. The worker's news now judges every order over the sea against the marked
  landing's land (`seaOrderLanding`, `landedAway`): a click three cells off, not kept, resolved to
  a landing four or five cells away and would have been told "came ashore away". Red without
  (HEAD's rule: two violations in each two-division state). Events and a
  transient list only: pin unmoved.
- **R28a** (critic run 39, R39-B1). Each division's order chose transports while the rest of its
  click still held the landing's, so the first went to another port's and the rest followed it there
  by the same-target rule; the landing's own lay idle. Seed 3517: two re-sent to Fuzhou two hours
  after the first boarded landed at h1291 (h657 from a standing start); of three, the two sent on
  landed 21 days apart; the four re-clicked three cells south-west were all refused. Now the hour's
  orders are judged together: `noteLeaving` (before `applyPendingCommands` applies them) notes the
  player's divisions they take off a landing and its transports; those are free once nobody else
  holds them (`heldGroup`, in `assignTransports` and `callTransports`), and `aboard`, `promised`
  and `convoyTarget` leave out those still to be ordered. A released group sailing to the convoy's
  port comes on (R21e). After: h657/h658 for both cases, the four on their own four groups, none
  refused. **Changed:** the one aboard sent alone elsewhere now takes its own transports where they
  carry no one else (R24d's refusal and R25b's "other transports" were for that case);
  `LeftLanding` is told on its own transports too (by landing, as R27c judges). R24d's refusal is
  kept where they carry another (`landingAboardRefused1938.test.ts` builds that group: room for two,
  the next bound for it); its page spec now checks the notice and "at sea". The notice's words no
  longer say its transports stay. **Not chosen:** a second pass after the hour's orders (moving
  divisions already sent to other ports back onto the freed groups), which would leave called groups
  sailing and escorts to undo. `landingLeftTakesShips1938.test.ts` (red without, the critic's three
  numbers); the fuzz checks a whole click is refused nothing, a landing loads at one port, and every
  convoy has one target (red without: the four re-clicked south-west). Player convoys only: pin
  unmoved.
- **R30b, R30c** (critic run 41, R41-N2, R40-N1's re-click, R41-N3; the advisor: one state of R29b's
  with a hole wherever a rule asked `loading`). The one aboard transports under way to their convoy's
  port (`sailingToPort`) was at sea: a click onto the landing it has was refused `Aboard` (SPEC: it
  "changes nothing"), and the redirect undone four hours later split the landing (364 refused, landed
  at Fuzhou h478; 365 at Shanghai h772; on 76b88197 both back at h656). Now it takes an order as at
  that port (`aboardAtPort`, `ownLanding`): the same landing changes nothing; another over the sea
  from that port keeps it on its transports, which load for that one there (`assignTransports`' first
  choice, `sailAboard` on as it goes); anything else is refused as before, not put ashore at a port it
  is not at. After: the recall lands both at Shanghai h766/772; the re-click refuses nothing. Its
  panel: "Aboard, sailing to {port} to load the rest of the landing" (`toPortAboard`; was "At sea,
  bound for its landing"). `landingJoinsAboard1938.test.ts` (red without: refused, Fuzhou, "atSea");
  refusals there and in `landingJoinsAboardMates1938.test.ts` now read from the order news (a refusal
  at the click was not seen by the step's events). **Not done:** R41-N1 (the bound one walks to the
  other port; it stood about as far from both) and R37-N2. Player convoys only: pin unmoved.
- **R30a** (critic run 41, R41-B1; a regression of R29b). R29b's transports, under way to the port
  where a convoy for the new landing loads with the one aboard, were not still to load (`stillLoading`
  read any group under way as gone), so the convoy at that port sailed once its own were aboard.
  Britain at war with France (seeds 15101, 7019; forced, the two are allied): 270 and 271 to Calais;
  the hour after 270 boards, 276 to Caen, then the two: 276 landed alone at h84 and was destroyed
  (h233), the two at h289 (on 76b88197: h290/291). Now a group carrying and under way to its own
  convoy's port is still to load. After: h288/288/289. `landingJoinsAboardMates1938.test.ts` (red
  without); R29b's test unchanged (h792–796). Player convoys only: pin unmoved.
- **R29b** (critic run 40, R40-B1). A landing redirected to a target another convoy loads for at
  another port (a fresh division sent to Fuzhou first, loading at Sasebo; then the two of the Shanghai
  landing): the one aboard at Tokyo went ashore and was bound for that convoy by R21e's same-target
  rule, and walked ~50 days to Sasebo, while its own transports, freed by R28a and called there for
  the second, sailed there empty. Seed 3517: 365 h657, 364 and 366 h1291 (one-at-a-time orders);
  h1292–1294 with R29a's batch, the one aboard still walking. Now `assignTransports` offers the one
  aboard its own group at the convoy's port where nobody else holds it, and `sailAboard` keeps it
  aboard for the new landing while the group sails there (`convoyPort` that port; it loads the rest
  and sails with the port's convoys, R21e). After: h792–796, the three within a day, the one aboard
  never ashore; the fresh one an hour before, the same. `landingJoinsAboard1938.test.ts` (red
  without). **Not chosen:** the one aboard and its group as a convoy of their own at their port,
  which splits the landing by port. Player convoys only: pin unmoved.
- **R29a** (critic run 40, R40-B2). The map's click sent one `hud.command` per selected division,
  each applied at once (`now`, `applyNow`), so R28a's `noteLeaving` and R27c's `tellLandingsLeft`
  judged one division at a time: the four of a landing re-clicked three cells south-west were told,
  all but the last, "the rest keep the old landing", and landed together; R25–R28's tests queued the
  orders as one hour's, a path the page never took. Now a click's orders go in one message (`cmds`,
  `Hud.commands`, `SimClient.commands`) and the worker takes them all, then applies them once
  (`SimServer.take`, `applyNow`); a paradrop of the selection too. `landingClickBatch1938.test.ts`
  drives the worker as the page does (red with one `cmd` each: three told of four, one of two;
  landings h1244/1245, h657/658); `landingClickBatch1938.spec.ts` by `Player.click` (red with
  HEAD's `player.ts`). Page and worker only: pin unmoved.
- **R28c** (the advisor's trace of the critic's `c39_ll_three_stagger`). Two clicks an hour apart:
  the first, alone aboard its own transports, sails for Fuzhou at once; the second's own, still under
  way to the port for it, were not offered (only R21e's block took a group under way), so it went on
  another port's group and landed at h794 (h657 from a standing start). A group of a landing left,
  under way to its convoy's port, is now offered at that port in the general choice too (`comingTo`).
  After: h658. `noteLeaving` also skips an order naming another nation than the division's. Red
  without. Pin unmoved.
- **R28b** (critic run 39, R39-N1). The mark and the tooltip were the first selected division's
  answer (R27b's "Not chosen": marking every one's landing). The one aboard and a fresh one, two cells
  south of Shanghai: green, "they keep their transports", and the fresh one landed alone four cells
  off. Reversed: `seaHint` (amphibious; the worker's `overSea` now takes the selection's ids) marks
  each distinct landing of the selection, green where all it is for already have it; with two or
  more the tooltip says "{n} landings, each marked: they will not land together". `how` and the
  first's landing as before. `landingHintSelection1938.test.ts`; `landingMark1938.spec.ts` (looked
  at). UI and a read-only query: pin unmoved.

### ADR-826 · 2026-11-04 · accepted — No landing on a neutral's ground (ROADMAP R20, R32-B1)

- **Context.** Critic run 32 (R32-B1): a player's order over the sea (R17, `seaConvoy`) checked only
  that a landing exists. A division landed at Calais (France at peace with Britain) stood there until
  the day start, when the march home (`repatriationSystem`, ADR-169) found it on foreign ground with
  no land way home and set it on Britain's spawn point, untold. A march by land onto such ground is
  refused (`NoRoute`); the two orders disagreed.
- **Decision.** The sea order is refused as the march is: where the target cell's holder or the
  landing cell's is `foreignTo` the nation, `MoveRejected` with a reason of its own, `Neutral` (15:
  "it would land on the ground of a nation outside its wars"; `NoRoute`'s words speak of the land).
  The march home keeps its jump, which a peace made while a convoy is at sea still brings about, and
  says it: `FormationSentHome` (71), a row below the ticker for a formation of the player's.
- **Not chosen.** Keeping a landed division where it is: it would stand idle on a neutral's ground,
  the state ADR-169 exists to end; a landing to make war on a neutral is a declaration of war first.
- **Pin.** Unmoved: the AI never gives a player's sea order, and an event is no state.
- **R21a (critic run 33, R33-N1).** The same holds after the order, until the transports sail: a
  division bound for its convoy is stopped where it stands (`Neutral`), as a march is stopped at
  the border (`Barred`); a loading convoy with its landing a neutral's ends, those aboard ashore at
  the port. A convoy at sea goes on: turning it back is a voyage of its own, and the landing is told.
  `landingPeace1938.test.ts` (bound at the peace; aboard a loading convoy at the peace), red without.
- **R21b (R33-N2).** A port of its nation that it stands at, bombed shut, is `PortShut` (16), not
  `NoPort`: a reason only, for the player's order and the AI's alike (no state, the pin unmoved).
  `portBombing1938.test.ts` asserted `NoPort` for that case; it now asserts the new reason.
  `landingPortShut1938.test.ts`: the critic's case through a player's convoy.
- **R21c (R33-N3).** A click on the map closes the formation panel (PLAN 2.14b) before the order
  goes, so a refusal had only a ticker row, one line beside a panel (ADR-754). The refusal now opens
  the panel of the formation refused again, if it is selected and no formation panel is open: the
  reason is read in full where the order was given. The tooltip's sea line asks the worker for a
  neutral's landing (`neutralLanding`) and says no landing instead of promising the voyage.
- **R21d (R33-N4).** The player's formations sent home in one day start are one event,
  `FormationsSentHome` (72: the nation, how many), a History kind, and one row below the ticker
  (the page keeps four rows; ten sent home lost six). The player's only: the AI's are mechanics, not
  history (seed 9419: 255 in 30 years), and with none played (the pin's run) nothing is recorded, so
  the pin stands. `sentHomeMany1938.test.ts`: ten at once, one event, one History record, one row.
- **R21e (R32-N1).** One click, one port, one sailing. A division whose target has a convoy loading
  at a port of its land, full, takes a group standing at that port or calls one there, before the
  nearest standing group elsewhere (an amendment of R17b's order of choice); and a loaded convoy waits
  while another at its port for the same landing is still to load. The wait is not bounded: on the
  critic's case (Japan to Shanghai, room for one division a group) the second division is some 500
  hours from Tokyo's port, and no bound short of that lands them together; so both land at hour 632
  and 633 where they landed at 123 and 510. The trade is the landing together; the panel says why the
  first waits (`aboard`, "waiting for the rest of the landing"). A click that wants speed gives the
  far division a target of its own. The second group, a new convoy, takes its own escort (two
  warfleets for such a click with the box ticked). The ROADMAP's "where one group has room" did not
  cover the AT's own case; restated. `landingTogether1938.test.ts` (red without: 387 hours apart).
- **R22b (critic run 34, R34-N1).** The unbounded wait gets a way out. A division aboard a player's
  convoy still loading at a port of its nation takes an order (an amendment of PLAN 4.5a's "aboard it
  takes no order", ADR-262): it goes ashore at the port's cell and the order stands; the convoy waits
  on for the rest, or is over with nobody aboard or bound. Not a landing (no event, no loss of
  organisation: it never left the quay). The AI's embarked and every convoy under way keep 4.5a: the
  AI never has a player's convoy, so the pin stands. Checked against: `rejectReasons1938.test.ts`
  (an order aboard a landing's transports refused `Aboard`), `serverOrderNews.test.ts` (an order
  while the voyage is under way refused, the voyage told on), `landingTogether1938.test.ts`,
  `landingPeace1938.test.ts`: green before and after. `landingAshore1938.test.ts`: red without.
  R23a (critic run 35, R35-B2): the order is judged with the division ashore, and a refused one puts
  it back aboard as it was (`ashoreAtPort` returns the way back): "a refused order leaves the one
  before it standing" holds aboard too. `landingAboardRefused1938.test.ts` and `.spec.ts`: red without.
  R24a (critic run 36, R36-B1, older): and for a division bound for a convoy, walking to its port or
  waiting there: a refused order restores its `seaBound`/`seaFetch` (cleared, it stood at Tokyo for
  good, and a convoy whose bound divisions were all refused sailed with the one aboard alone).
  `landingRefusedBound1938.test.ts`: red without.
  R23b (R35-B1): an order to the landing it is aboard for (the same land and water, `sameLanding`)
  is taken and changes nothing; ashore, it was bound anew to transports another division of its
  click was walking to, and that one waited on the quay for weeks. `landingSameAgain1938.test.ts`:
  red without. R23e (R35-N2, older than R22): the same for a division bound for a convoy still at its
  port; its order cleared its binding, which was all that gave its convoy a landing (`convoyTarget`),
  so it was put on another convoy's next voyage, and a click clicked again landed one at a time
  (148, 633, 952, 1243 h). Now the four land together (1242–1243). Red without.
  R24b (critic run 36, R36-B2, older): "the same landing" is a landing within two cells (water and
  land, `SAME_LANDING_CELLS`), the land of the same holder, not only the same cell pair: a click a
  cell off (14 px at the default zoom, nothing on the screen to tell) sent the one aboard ashore to
  Sasebo's transports, landing 27 days after its partner. **Not chosen:** moving the convoy to the
  new cell: it changes the landing of every division of the click for a difference the player
  cannot see. A marker of the landing while choosing (the critic's design objection) stays open.
  `landingNearSame1938.test.ts`: red without (one cell east: 633 / 1285).
  R25a (critic run 37, R37-B1): the near-miss is also measured from the click: a cell within two of
  the cell the landing was ordered for (the convoy's `target`, or the bound division's), of the same
  holder, is the same landing. Two cells south of Shanghai resolved to a landing four cells off (the
  coast bends), so R24b's landing-to-landing test missed it and the one aboard went to Sasebo. Both
  tests stand: either is enough. **Not chosen:** the critic's "click within two cells of the
  convoy's land": the landing's land lies four cells north of that click, so it fails the same way.
  `landingNearSame1938.test.ts` (two south, two south-west): red without (633 / 1288, 633 / 1291).
  R25b (R37-B1, the silence): the one aboard a loading convoy, taken by an order over the sea to
  other transports, emits `LeftLanding` (73) and is told so (order news "leftLanding": a row and its
  panel's notice). **Not chosen:** refusing it (`Loading`) whenever its own convoy is loading: the
  player could no longer redirect one division aboard. An event, not state: pin unmoved.
  `landingLeftTold1938.test.ts` and `.spec.ts` (Fuzhou with two: told, on fleet 1151 for 1136): red
  without. R25c (R37-N1): the walkers of a whole click re-clicked near it are bound, and R25a's rule
  covers them: no refusal. `landingNearAll1938.test.ts`: red without R25a.
  R26a (critic run 38, R38-B1, new in R25): the worker judged "came ashore away from its target"
  against the new click, two cells south of Shanghai and four from the landing's land; a landing as
  ordered was told as failed. An order the sim keeps (`sameLanding`, asked when the command comes)
  keeps the landing's target in the worker's news. **Not chosen:** widening `AT_PORT_CELLS`: it
  would hide a landing truly thrown off. `landingNearNews1938.spec.ts` (seed 3517, two and four):
  red without (364 told; all four told). Worker only: pin unmoved.
- **R22c.** The wait aboard is accounted for: "1 of 4 aboard; the last 47 days from the port"
  (`voyage.wait`, the furthest bound division's `marchHoursLeft`). Worker and UI only.
- **R22d (R34-N1).** The escort is not sent weeks ahead. R17d sent it at the order; with R21e's wait
  it stood at Shanghai's water from hour 23 to hour 1243. It is now kept where it stands and sails
  when its voyage (`sailHours`) is at least the wait left (`waitLeft`), so it is there about when
  the last division is aboard; a loaded convoy waits only for an escort in a battle or one that
  would be there after its transports (`escortAhead`). **Not chosen:** sailing it with the
  transports and holding the loaded convoy at its port until the escort is there: the escort is
  there first by construction, but every escorted landing is later (Belfast 110 h → 172 h,
  Shanghai 1243 → 1289 h), a cost with nothing bought. With the timing, both land as without an
  escort (110 h; 1242–1243 h). The pin stands: the AI has no player's convoy. Checked against:
  `landingEscort1938.test.ts` (R17d: sails at the click on Belfast, there first, held until ashore,
  none free told, none asked none taken), unchanged and green; `landingTogether1938.test.ts`.
  `landingEscortWait1938.test.ts` (Shanghai: none there more than a day before the last is aboard,
  each there before its transports, together, no later than unescorted; Belfast no later): red
  without (the escorts there from hour 23).
  R23d (critic run 35, R35-N3): the escort is the one of the eight nearest by straight cells that is
  there soonest by sea (`sailHours`), not the nearest: Britain's nearest to Belfast had Scotland to go
  round (72 h), and the loaded transports of a division already at the port waited for it (landed
  73 h against 58). `landingEscortWait1938.test.ts`'s fourth-nearest case: red without. Its nearer
  escort waits where it stands, so `landingEscort1938.test.ts`'s "under way after the first hour"
  (R17d's sailing at the order, which R22d replaced) is restated: under way, or kept where it stood.
- **Tests restated.** `serverOrderNews.test.ts` (Britain on Cuxhaven) and `orderNews1938.spec.ts`
  (Switzerland on London) each order a landing at peace to see a refusal told with its reason (no
  port, no transports); `Neutral` now comes first. Each now makes that war first, and its assertions
  stand unchanged: a neutral's coast is refused whatever ports there are, so `Neutral` comes first.
- **Test.** `landingNeutral1938.test.ts` (Calais at peace refused `Neutral`; held by an enemy, by
  sea; idle there, sent home with the event; the first and last red without the rule),
  `landingNeutral1938.spec.ts` (the panel's reason; the ticker's row).

### ADR-825 · 2026-11-04 · accepted — A moved pin runs the whole e2e suite (ROADMAP R19)

- **Context.** The gate runs the e2e specs whose files changed (ADR-87; its full run at each
  numbered tick went with the plan, ADR-805). R16b changed rules, moved the pin and passed; nine
  specs that find a scene in a seeded 1938 world (a battle, a fall, a fleet on a day) were red,
  found by a full run by hand. R18 moved the pin again and turned `declutter1938` red. ADR-87's own
  amendment (PLAN 3.4Rn) had found the same: rule changes that moved the pin broke `wrecks1938`.
- **Decision.** `planE2e` runs every spec when the pin's file (`tests/sweep/baselineHash.test.ts`)
  changed. A rule that moves the history must move the pin in the same commit, so that file is the
  mark of a moved history; a sim change that leaves the history alone runs what it ran before. The
  whole run goes through the gate's rule of a red run again alone (ADR-779), which the hand-run
  full suites lacked: six or seven specs red by load in each, green alone.
- **What it costs.** About fifty minutes on a commit that moves the pin, a few a batch. Narrower
  than ADR-87's rule of a full run at every numbered tick, which the user found too often; a
  spec that steps a seeded world cannot be told from one that does not without running it.
- **Test.** `gate.test.ts`: a change with the pin's file plans the e2e stage in full; the same
  sim change without it plans none.

### ADR-824 · 2026-11-04 · accepted — A block keeps clear of its own side's other stacks (ROADMAP R18)

- **Context.** `stackBlocks1938.spec.ts` went red after R16b moved its scene: on seed 1212 (the
  Soviet Union at war with Poland from the start, day 20) Soviet blocks on two neighbouring Polish
  divisions stood in one another (66/164, 153/164, 156/200, 153/156; up to 0.036 cells deep).
  `deployOf` kept a block clear of the enemy's blocks before it in the hour's order and of its own
  stack's lines, but read no block of its own side's other stacks. The rule was always so.
- **Decision.** Of the blocks near it in contact and before it in the hour's order (`orderOf`), a
  block reads its own nation's and its side's (`sameSide`) as it reads an enemy's: it stops the gap
  short of one in its way, or takes the next file out with room.
- **Consequences.** The deployment is read by the air AI's patrols, so a game moves: pin aa1a5dbb →
  6012d9d2. `deployStacks1938.test.ts` (red without: the four pairs), `stackBlocks1938.spec.ts`
  green unchanged; `diploInvariants` 99 0 broken; the whole e2e suite run (ROADMAP R19's lesson).
  The sim reads a block's place in the air AI's missions (`air.ts`: `deployOf`, `withFreshDeployments`);
  land combat reads it only for the fire events it tells.
- **The full suite on it:** 330 passed, 7 red; six green alone (load), one of the history:
  `declutter1938.spec.ts`'s "more clusters in the box at each finer level" fell to a tie (5 → 3 at
  6 px per cell, 6 → 6). A probe of the cluster keys showed each of the six with its formations in
  one fine cell and one child, the whole view 223 → 328: a tie the nested grids allow. Restated
  (ADR-79, seventh addendum in the spec): at a level change no fewer clusters in the box and more in
  the whole view; over the whole way in more clusters in the box, and more than twice the counters.

### ADR-823 · 2026-11-04 · accepted — The player orders landings overseas, with escort (ROADMAP R17)

- **Context.** A left-click on land over the sea with divisions selected lands them (PLAN 4.5a,
  4.9b), but only when the player's transports already wait at a port of their land; transports
  never come to the troops, divisions land one by one, no screen shows the voyage's state, and
  only the AI escorts its landings.
- **Decision (the user's, 2026-11-04).** Keep real transports (no abstract sea lift: it would make
  transports, the sea's control and the invasion AI pointless). The same left-click order; the
  transports come to the troops (R17a); a click's divisions land together (R17b); the state and the
  sea leg are shown (R17c); an "Escort with warships" box, ticked by default and remembered, sends
  the nearest idle warfleet not under the player's own order with the landing (R17d). A fleet the
  player orders is never taken; ordering a fleet to the landing water stays the way to pick one.
- **R17a.** Only a player's order calls (`moveFormation` naming its nation; God's and the AI's
  orders never take this path, so the pin holds). The group called is the nearest idle one by
  straight cells that has a sea way (4 tried), never one under way, fighting, carrying, held by the
  editor, or called already; it sails under the player's order, which the naval, invasion and
  economic AIs leave alone, and which lasts while the fleet lives (a fleet's player order never ends
  on arrival today; relied on here, filed under R17). The formation waits at the port while the
  group is under way; sunk or stopped elsewhere, the order ends refused (`NoTransports`). The call is
  saved as an optional section (`world.seaFetch`): no new save format.
- **R17b.** A convoy is a transport group bound for one target cell (`world.convoyPort`, the
  group's port; `world.seaFetch`, the divisions bound for it); a later order to the same cell joins
  it while it loads. The group waits at the port until no division bound for it that would fit is
  still to come, then sails; one left over waits for the voyage back. No timer: a division whose
  march ends short of the port is not waited for (refused `NoTransports`), and a contact cancels as
  any player's march. A repulse ends the convoy. Every player's order over the sea goes this way,
  transports at the port or not; the AI's and God's orders keep the old path (`tryLanding` sails on
  boarding), so the pin holds. `Embarked` is not widened (its saved stride stays).
- **R17c.** Shown, not simulated: the sea leg is a straight dashed line (port's water or the
  transports, to the landing's water and the land), drawn for the formations whose order lines are
  shown; the transports' own order line shows their way. "Landed" is the worker's (a day after a
  player's order lands), not the sim's. The tooltip's hint asks the worker (`overSea`), as the
  client has no land components.
- **R17d.** The box is the page's setting, not the world's (`Settings.escort`, localStorage, as
  the nuclear pause): it travels on each order (`moveFormation.escort`, absent = none, so a God
  order or an old script takes no escort), and the world keeps only the escorts under way
  (`world.escorts`, an optional section: no format change, the pin unmoved). A convoy's escort is
  picked when the convoy is made; a division that joins it adds none. A warfleet is a fleet with no
  transport room. It sails at once to the landing's water, so it is there first while the
  transports load; "its station" is the cell it came from (a port's water, or its place at sea).
- **Also (the user's, 2026-11-04).** The United States' lean after R16b (29% of the land on the
  mean, done31 20%) stays a watch for the critic and the release sweeps, not an item.

### ADR-822 · 2026-11-03 · accepted — A nation's traits are state, shown and set by God (ROADMAP R16a)

- **Context.** Of a trait's 18 modifier kinds only `income` and `manpower` acted, folded into two
  multipliers at the start; the nation's traits themselves were kept nowhere, no screen showed
  them, and nothing could set them. The user chose (2026-11-03) to make the modifiers act where the
  game has a rule for them, drop the rest, and let God set a nation's traits; old saves need not
  load.
- **Decision (R16a, no rule change).** `nations.traits` (u16, saved) holds a nation's traits as a
  bit mask of `data/traits/traits.json`'s order (`src/shared/traits.ts`). The scenario, random
  traits and the new command `setTraits` (refused `TraitsClash`, `OutOfRange` past the 14 bits, for
  a dead or absent nation) set it; `applyTraits` sets the income and manpower multipliers with it.
  Rebels, spawned nations and reused ids start with none; a revived nation keeps its own. Setting
  traits leaves aggression alone: a scenario's aggression is set with its traits in mind (Germany
  90), and adding the bias again would count them twice; the bias stays the random option's. The
  nation panel's Overview shows the traits, each with its description; the God tab has a box a
  trait, one that would clash greyed. God's edits of a nation (rename, colour, bonus, gold) make no
  row of the history, and traits are among them.
- **Save format** 1 → 2 (`STATE_FORMAT`): a save from before loads no more; the title screen says
  it is from an older version.
- **Pin** (`tests/sweep/baselineHash.test.ts`): 614c24dd → f7089e32, a new column only. Seed 99's
  state after one year, hashed without `nations.traits`, is 614c24dd: no rule moved.
- **R16b: the modifiers act** (`traitMod`, summed over the mask, cached by mask), each where the
  game has its rule, all 16 kinds of the data used (none dropped):
  - `landAttack` and `landDefense` beside the land attack and defence buffs; `armorAttack` on the
    fire of armour elements alone; `navalAttack` beside the naval attack buff; `airAttack` on air
    fire and strikes (not bomb tons), `airDefense` dividing the air fire a wing takes;
  - `warExhaustion` × a war side's exhaustion before a nuclear shock, by the side's leader (the
    side's first nation, as the suing rule reads it);
  - `stability` as −10 × it unrest a month (the unrest buff's scale) on the holder's core land
    only, `revoltSuppression` × suppression's unrest taken off;
  - `research`: each gold paid counts 1 + it, so a tech is both sooner and cheaper;
  - `industry`: an order's gold ÷ (1 + it); `buildSpeed`: its training days ÷ (1 + it), rounded up,
    at least a day (`priceWith`, `daysWith`, shared with the production list, which shows the
    nation's own price and days). The economic AI still weighs an order at the template's price:
    an industrial nation keeps a little more than it plans to;
  - `org`: org regained fed and out of contact × (1 + it);
  - `fortStrength`: the defence of a cell the nation holds against a flip × (1 + it); this is the
    game's fortification, with no new system.
  Magnitudes as the data had them. Judged by a ten-seed sweep against the last one on the same
  seeds (2026-11-04 done31, no rule change since) and the rules of war and peace.
- **R16b: stability on core land only.** With `stability` on every province a nation held, the
  sweep of seeds 1551–1560 broke: the largest realm's land 34% on the mean (done31 17%), the
  United States' 44% (20%), limits 4 of 10 (7). Sweeps that zeroed one family of modifiers each
  (scratch, `.cache/sweep/reports/2026-11-04-sweep-z*.md`), the mean largest land: defence and
  fortification off 26%, production off 28%, war exhaustion off 36%, stability and suppression off
  20% (9 of 10). Stability had calmed the conquests of the isolationist United States and stirred
  those of the militarist and revolutionary empires that hold it in check. A nation's mood is its
  own land's: conquests breed unrest as before. A no-industry run was set aside: Germany and the
  Soviet Union are industrial too.
- **R16b sweep** (`docs/sweeps/2026-11-04-sweep-traits16b.md`): limits 7 of 10, riser and faller 10
  of 10, no stasis 9 of 10 (reported), no break-up 10 of 10; the largest land 22% on the mean, the
  United States' 29%. Limits are done31's 7, under the bar of 8 as done31's were; the United
  States still leans larger than before (its defence and production traits), a watch for the next
  balance item.
- **R16b tests.** Tests that pin a base rule on a nation now given traits read it bare
  (`withoutTraits`, `tests/helpers/sim1938.ts`): production, wings, the heavy division, buffs, org,
  carrier strikes, naval guns, the economic AI's reserve; `traitEffects1938.test.ts` pins each
  trait's own factor. `nukeMeansLost1938`: the fortifier holds Prague to day 50, the window 40 → 80
  days. The economy invariant's desertion bound now leaves armour out (under fire in the same hour
  it loses whole tanks on a roll and drops desertion's share; Poland's armour on 7019, day 59) and
  holds that its tanks rise not; still red with no desertion.
- **Pin**: f7089e32 → aa1a5dbb. `diploInvariants` 99: 0 broken.

### ADR-821 · 2026-11-03 · accepted — SPEC.md rewritten from the code, its references checked (ROADMAP R6)

- **Context.** SPEC.md §3–§10 (260 KB) is a design log: PLAN references, "as built" and "before it
  was" narratives, measurements, and names gone from the code (§10 still described `npm run parity`,
  `critic:due` and the phase reviews). R6 is too big for one sitting.
- **Decision.** R6 in ten parts by size (R6a–R6j, about 30 KB each). The rules of every part:
  - written from the code outward: for each subsection, read the files it covers and keep only
    what they do; prose is not reformatted into place;
  - `[ADR-n]` cites stay; PLAN references and the history of a rule go (DECISIONS has them);
  - a number is a rule's constant, a budget, a schema's field or a data size, never a measurement;
  - what was dropped is removed, not narrated;
  - the part updates the header's list of current sections and the contents list.
- **The checker.** `tools/spec/refs.ts` judges each backticked path (the tail of a tracked path,
  `<x>` and `*` for any part, `.cache/` not judged), `npm run` script and code name (each dotted
  part a word of the code, data or config) of a section; `tests/unit/specRefs.test.ts` holds the
  current sections at 0 misses, each part adding its own. It is a floor: a name that exists may
  still be described wrong, so each part lists the constants it states with the file and line read.
- **Gate.** A commit of SPEC.md alone runs nothing (documents), and a code change that removes a
  name SPEC cites does not reach the test by its imports. The test runs by hand in each part (named
  in PROGRESS) and every night in the whole unit suite; no gate change.

### ADR-820 · 2026-11-03 · accepted — A second release on one day is tagged with a letter (ROADMAP R5b)

- **Context.** Batch 1's release falls on the day of the first (`release-2026-11-03`), and PROMPT.md's
  tag is `release-<YYYY-MM-DD>`: the name is taken.
- **Decision.** A later release on a day already tagged takes the next letter: `release-2026-11-03b`
  (then `c`, …). The CHANGELOG heading is the tag.
- **Also.** Two known reds passed in this release's review and leave `tools/gate/knownRed.json` as
  their BLOCKERS entries say (moved to `docs/BLOCKERS_DONE.md`): `shipMarks1938`'s T3 (18 px, bar 17)
  and `seaRow1938`'s Speed x1 (red once in its chunk, green alone, which the review counts a pass).

### ADR-819 · 2026-11-03 · accepted — A default is a row of the history (ROADMAP R7)

- **Context.** After COLLAPSE_MONTHS bankrupt months a nation with nothing to fragment (no
  puppets, dead claimants or restless provinces) had its debts voided by `collapseNation`'s early
  return, with no event: the history never said why its gold went to 0. R4a's checker let it pass
  by a rule of its own (Poland on 7019, day 151).
- **Decision.** A new kind, `NationDefaulted` (a = the nation, b = the debt voided, gold rounded),
  logged in the History ("Poland defaulted: its debts were voided", type "Default"), not the ticker:
  a bankruptcy is not either. A collapse that fragments the nation is told by `NationCollapsed` as
  before.
- **Checker.** The economy rules' "a default with no row" exemption is gone: a default's gold rise
  is allowed in the hour of its row, as a collapse's.
- **Evidence.** `worldInvariantsEconomy.test.ts` (7019, Poland 800 in debt) red without the row
  ("POL's gold rose 251.45 … day 151"), green with it. `defaultRow1938.test.ts` 1 of 1 (red without
  the row); `history.test.ts` (every kind has its roles and texts) green. Seed 99's pin unchanged.

### ADR-818 · 2026-11-03 · accepted — A fleet moved after the air hour takes its wings (ROADMAP R15, R30-B3)

- **Context.** Critic run 30: with heroes on, the checker's air rules broke on 3373 (random
  diplomacy) and 5591, and never with heroes off. Traced per system: Japan's carrier group closed in
  a sea battle (`closeOn`, in `navalCombat`, after `air`) that it came into and left in the same hour,
  so no battle excused its wings standing behind (5591, day 158); Britain's was set on its cell's
  water by sea control's order home from a lost base (`orderSail`, 3373, day 601). The heroes change
  the wars, not the rule: both moves exist with them off.
- **Decision.** `carryWings` (air.ts): a fleet's carrier wings (not one ferrying to it) are set where
  it is; `closeOn` and `orderSail` call it after they move the fleet. A wing's place is its base's
  (the air system sets it each hour), so nothing else reads differently.
- **Checker.** "Kept a base lost an hour ago" now means the same base: Nationalist Spain's wing 932
  (5591, day 831) fell back from airbase 23, taken by Germany, to 121, taken in the same hour, and
  fell back again the next; it kept neither. The air system does as its rule says; the line was the
  checker's.
- **Evidence.** HEAD: 5591 (heroes, 170 days) 1 broken, 3373 random (heroes, 610 days) 2. With the fix,
  20 years with heroes, air rules: 0 broken on 3373 random, 5591, 1009, 2207, 3739, 7019, 4637.
  `carrierWingsMove1938.test.ts` 2 of 2, both red without the fix; `worldInvariantsAir.test.ts` adds
  5591 with heroes. Seed 99's pin unchanged.

### ADR-817 · 2026-11-03 · accepted — A hero fold is one nation's, and its round outlives the panel (ROADMAP R14, R30-B1)

- **Context.** Critic run 30, seed 5521's start view on a phone: the panel the first tap on a
  folded hero counter opens covers the counter, and closing it started the fold's round at its lead
  again, so HMS Hood, TOG II and Char 2C were never opened. A fold also took another nation's hero
  (Hood in "Sovetsky Soyuz +1", under the Soviet flag ~2,900 km from itself), and a "+1" was cut by
  the screen's edge.
- **Decision.** A hero with no free step (its place, one height down, one up) folds only into a
  hero counter of its own nation; with none, it is drawn at the step of the three that covers the
  least of the others. `formationPick` keeps the last clicked fold and the place in its round, so
  a tap after the panel is closed opens the next hero. A hero counter whose place is in the view is
  drawn whole in it.
- **Trade.** Where Europe is crowded at the world's zoom, counters of two nations now overlap a
  little (on 5521, TOG II over the top of "Bismarck"), where before one was hidden under the other's
  flag. Every name reads and every hero is reached.
- **Evidence.** `heroes1938.spec.ts` "ROADMAP R14", desk 1600 × 900 by mouse and phone 390 × 844 by
  touch: no fold of two nations, none cut, each hero of a counter the map takes opened by taps on
  it. Red on HEAD (folds of two nations: "Sovetsky Soyuz +1", "Bismarck +2", "Maus +2"), and with
  only the layout fixed (tap 2 on "Richelieu +1" opened Richelieu again). R8's test still green.
  Shots: `docs/evidence/R14/`.

### ADR-816 · 2026-11-03 · accepted — A sea hero comes back only on its start's basin (ROADMAP R13, R30-B2)

- **Context.** Critic run 30: R10's fallback (ADR-813, the held port nearest the start) took ports
  on cut-off water. Sovetsky Soyuz came back at Baku, Atyrau or Makhachkala (the Caspian) or at
  Petrozavodsk (Lake Onega) and stayed there to the run's end: 11,259 days in 4 of 13 seeds.
- **Decision.** A sea hero's return port must have water of the lane graph (`portSeaOf`; a lake's
  port has none) in the basin of its start (`heroBasin`: the basin of the zone at a place, 0 off
  every zone). With no such port held it waits, and its row says "waits for a port on its sea".
- **Checker.** The heroes rules add: a sea hero on water is in its start's basin. On land it is on
  a passage (Suez is drawn over land cells) and is not judged.
- **Evidence.** The rule on HEAD's return (the filter off), 4 critic seeds × 20 years, heroes on:
  red on 4637 (Soviet hero in the Caspian, day 2640; French on a lake, day 6048), 7603 (Caspian,
  day 4399), 4111 (lake, day 7045); 9001 green. With the fix: 0 broken on all four.
  `heroes.test.ts` 17 of 17 (1 new, red with the filter off). Heroes off: no change, seed 99's pin
  as it was.

### ADR-815 · 2026-11-03 · accepted — A hero's loss and return are rows of the history (ROADMAP R12, R29-N1)

- **Context.** Critic run 29: a hero lost or back was told nowhere but its Overview row: no ticker
  row, no History row or kind.
- **Decision.** Two event kinds, `HeroLost` and `HeroReturned` (a = its nation, b = its roster
  row, x, y = its place), kept in the history log and told in the ticker: "Germany lost Bismarck
  near Kiel", "Bismarck is back with Germany near Bremerhaven", each with Go to and a History
  kind. A hero gone with its nation's death has no row: the death tells it.
- **Why the log.** The ticker and History both read it (PLAN 3.12c); its rows are state, saved
  and hashed, and come only with the heroes on: seed 99's pin (heroes off) is unchanged.
- **Decisions checked (ADR-803).** PLAN 3.12c (the ticker's major events): a hero's loss is one,
  as a capital's. `heroes.test.ts` 16 of 16 (1 new), `heroesRead1938.spec.ts` 6 of 6 (1 new).

### ADR-814 · 2026-11-03 · accepted — A hero reads its health; the graph zooms; the bar fits 1024 px (ROADMAP R11)

- **Context.** Critic run 29 put `mapVisuals` and `uiUxPolish` at 6 (bar 7): a hero's men stay
  whole while it is hurt (ADR-787), so its formation panel said "Men 2,200 of 2,200" at 35 % and its
  T1 marker read "6" for the Maus; the heroes option explained itself on hover only; the relations
  graph said "X is at war beside X" for a side's leader or a lone nation, could not be read on a
  phone, and its button made the bottom bar wrap at 1024 px.
- **Decision.** The snapshot carries a hero's health (`SnapshotFormations.health`, percent;
  `NO_HEALTH` for any other formation) and the formation detail its `health`: the panel shows a
  Health row with a bar above the men, a hero's T1 marker its health as its number and bar, its T2
  tag its health beside its name. The new-game form shows the option's hint as a line of text. A
  war line names its side: beside its leader, leading it with whom, or alone on it. The graph
  zooms (wheel, pinch, buttons) and pans (drag) up to 6×, naming every nation from 2×. Between 601
  and 1,180 px the bar's buttons are closer and narrower.
- **Why a column, not the men.** A hero's men are its whole crew (ADR-787: no refill, a heal);
  health is what its loss turns on. A byte a formation is the snapshot's smallest column.
- **Decisions checked (ADR-803).** ADR-787 (a hero's men stay whole): kept, shown beside its
  health. ADR-806 (the graph): its layout and kinds unchanged. `heroesRead1938.spec.ts` 5 of 5,
  `heroes1938.spec.ts` and `relations1938.spec.ts` 8 of 8.

### ADR-813 · 2026-11-03 · accepted — A sea hero comes back at any port its nation holds (ROADMAP R10, R29-B3)

- **Context.** Critic run 29: a sea hero came back only at the water of a naval base its nation
  held (PLAN 7.184a2); the 1938 data gives France 4, Germany 2, the Soviet Union 4, and losing them
  is common. Over ten 20-year runs Richelieu waited 16,123 days past its 60, Roma 11,218, Sovetsky
  Soyuz 5,551, Bismarck 4,888; the Soviet Union of 4253 held 12 ports, none a base. The option
  says "they come back 60 days after they are lost".
- **Decision.** With no naval base held, at the water of the port it holds nearest the hero's
  start (`returnPlace`). With no port at all it waits, and its Overview row says why: "waits for
  a port to return to", or, its nation dead, "waits for its nation's revival" (`heroWaits`). The
  checker's heroes rules (ADR-812) gain one: a row past its day, its nation living and a place
  for it, is back within the hour.
- **Why not the coast by the capital.** The ports' water is the place the navy's rules already
  know (`portWater`); a nation with none waits, and its row now says so.
- **Decisions checked (ADR-803).** PLAN 7.184a2 (back at its start, else the nearest naval base
  held): kept first; the port a fallback. `heroes.test.ts` 15 of 15 (1 new, red with bases only).
  `tools/diag/heroWaits.ts` on the critic's ten seeds × 20 years: 0 days past a return with a
  place; Richelieu's 16,123 days waiting now 542, all while France held no port; Sovetsky Soyuz 0.

### ADR-812 · 2026-11-03 · accepted — A hero is its roster nation's: it goes with its nation, not with its land (ROADMAP R9, R29-B2)

- **Context.** Critic run 29: an annexation or an integration (`annexInto`) moved every formation
  of the dead nation to the taker, heroes too, while the roster row stayed the dead nation's.
  Britain fielded Roma and P.100 (4637), the United States the Maus (7603, 1,033 days); the
  Overview listed them under no nation, and once lost they waited for a revival of a nation that
  no longer owned them. A conquest (`eliminateNation`) already destroyed a dead nation's heroes.
- **Decision.** `annexInto` hands over no hero; `eliminateNation`, which follows it on both paths,
  takes the hero with its nation, and its row waits for the revival (PLAN 7.184a2), as at a
  conquest. The checker (ADR-809) gains a heroes rule set: a hero's formation is its row's
  nation's and living, no row on two formations, a row with no hero waiting to return.
- **Why not move the row.** Each great power has its own one hero of each kind (PLAN 7.184a); a
  taker with five breaks the roster's one-a-row, the Overview's "its nation's heroes" (ADR-791)
  and the stats' rows. A revival brings its heroes back with it.
- **Decisions checked (ADR-803).** ADR-181 (an annexation's formations go to the annexer): kept for
  all but heroes. PLAN 7.184a2 (a dead nation's heroes wait for its revival): now on every death.
  `heroes.test.ts` 14 of 14 (2 new, red before: "Roma not handed to Britain"). The checker's
  heroes rules over 20 years: red on the old rule on 4637 (day 1591, Italy's hero Britain's) and
  7603 (day 6044, Germany's the United States'); 0 broken on the critic's ten seeds after.

### ADR-811 · 2026-11-03 · accepted — Heroes' counters at T0 stay at their place; crowded ones fold (ROADMAP R8, R29-B1)

- **Context.** Critic run 29: at the world's zoom, the view a heroes game opens on, a hero counter
  that would cover another's stepped down as many times as it took (PLAN 7.184b3). Europe's ten
  cascaded into Africa (seed 5521: P.100 Ercole drawn 5,009 km from itself), and a click on one
  opened the nation under it: the pick never looked at the hero counters.
- **Decision.** A hero counter that would cover another steps one height down, else one up; else
  it is folded into the hero counter it covers, which reads "Char 2C +2". A click on a hero counter
  (the topmost under it) opens its first hero; a click again opens the next, round to the first,
  as a T1 marker's stack does (PLAN 7.4f20). Heroes are still never folded into a nation's counter.
- **Why fold, not hide the name.** Every hero stays on the map and in reach of a click; the "+n"
  reads as a nation counter's does (PLAN 1.45b). At closer zooms (5,000 m/px and nearer) they no
  longer crowd and each is its own, as before (PLAN 7.184b3's test unchanged).
- **Decisions checked (ADR-803).** PLAN 7.184b3 (each its own counter, never folded into its
  nation's): kept but for heroes that cannot find room within a step, which fold among themselves.
  `heroes1938.spec.ts` 6 of 6 (R8's two red before: 8 counters drawn more than a step off).

### ADR-810 · 2026-11-03 · accepted — A realm has one head: no puppet of a puppet (ROADMAP R4e)

- **Context.** The bonds' checker (ADR-809) on its first runs: a puppet of a puppet on 1009 (day
  235: Turkey, Bulgaria's overlord, made a Soviet puppet), 2207, 3739 and the random world 11.
  The scenario's schema refuses one (ADR-148), and the game made one: `makePuppet` left the
  subject's puppets under it and took a puppet as an overlord; `annexNation` handed the annexed
  nation's puppets to an annexer that was a puppet itself.
- **Decision.** A bond is made to the head of the overlord's realm (its overlord, if it has one),
  and the subject's own puppets pass to that head with it, leaving the wars they fought against
  its realm (PLAN 3.8d), as an annexation's do (no row of their own, as there). An annexation hands
  the target's puppets to the head of the annexer's realm.
- **Why the head, not a refusal.** A puppet's victory then still has its peace terms; a refusal
  left the beaten nation free at a crushing peace. The head is who the bond serves: the tribute and
  integration go there already through the realm's wars.
- **Decisions checked (ADR-803).** ADR-148 (a dead nation is nobody's puppet; the schema refuses a
  chain): now held in play. ADR-181 (an annexation's puppets go with it): kept, to the head.
  PLAN 3.8d (a new puppet leaves the wars against its realm): applied to the handed puppets too.
  `puppets.test.ts` 18 of 18 (3 new, red before), `npm test` 2086 of 2086, seed 99's pin unchanged.

### ADR-809 · 2026-11-03 · accepted — One checker for the other systems' rules, a rule set a system (ROADMAP R4)

- **Context.** ADR-804: a feature's rules go to a checker run on several seeds, as the rules of war
  and peace do (ADR-803). Only war and peace had one.
- **Decision.** `tests/helpers/worldInvariants.ts` steps one run hour by hour and checks every rule
  set at once (`economy`, then the navy, air, nukes and the bonds, ROADMAP R4b–e), as
  `diploInvariants.ts` does; the same line kinds kept once a case. It runs in the unit suite (180
  days, four 1938 seeds and four random worlds, a file a rule set), by hand
  (`tools/diag/worldInvariants.ts <seed> [days]`), and every night on new seeds for two years (the
  `systems` job). A rule is a statement of the code as it should be, read from the system's own
  comment and SPEC; each is shown red on a patched rule before it is trusted.
- **The economy (R4a).** Gold rises only at a month's start, at a founding or return, or at a
  collapse or default (debts void, PLAN 1.24); at a month's start by no more than the month's gross
  income and the tribute owed by its puppets; a nation bankrupt after a month's start has each
  formation on land lose DESERTION of its elements' units (the units less their carried damage: a
  part of a unit is carried, so whole units lag). A deep debt set at the start has the AI disband
  the whole army in an hour, so the bankrupt case is a debt just past the line (Poland, 800).
- **Found.** A default with nothing to fragment voids the debt with no row (ROADMAP R7).
- **The navy (R4b).** A fleet not under way stands on water (a passage's hours are drawn over its
  land); a formation aboard rides a fleet of its own nation and stands where it stands; when its
  transports are sunk (`destroyFormation` marks it `fleet` −1) it is lost by the next hour, when the
  amphibious system runs; no fleet is a dead nation's. The roadmap's "a fleet in its own or a
  partner's port" is not a rule of the game (a fleet stands at an enemy port to blockade it,
  PLAN 7.35): replaced by these.
- **Air (R4c).** Every wing has a base: an airbase its side holds, or a fleet of its nation's;
  one lost (taken, its carrier sunk) is left or lost with it by the next hour, at the air system's
  hour. A wing not ferrying stands at its base: a carrier's at its fleet as the air system left it,
  and a fleet in a sea battle (this hour or the last, when it ended) moves after it. A sortie
  flies to a place within the wing's range of where it took off; an airbase wing's mission is
  within its range. A carrier wing's mission may lie beyond its range while the fleet has sailed
  off: the scheduler waits ("its carrier sailed off"), so the rule is the sortie's.
- **Nukes (R4d).** A launch needs nukes allowed, a warhead the hour before and a means (a strategic
  bomber of its nation's at its airbase with the target in range; or missiles known and the target
  within MISSILE_KM); its yield is at most what the nation builds; launches are counted by their
  rows, as a missile may burst in the hour it rose; every launch that ends is told as a burst or
  an interception, and none is told without one; a stockpile grows only by one built at the day's
  pass (what was paid toward it starts anew), to WARHEAD_MAX, and is no dead nation's after it.
- **The bonds (R4e).** As ADR-148 and the scenario's schema have them: an overlord is a living
  nation other than its puppet and no puppet itself; a dead nation has none; a puppet is never at
  war with its overlord; autonomy, loyalty, integration and unity within 0..100; an alliance has
  two living members or more and its leader among them, and a nation is in one at most; a
  guarantee binds two living nations at peace with each other. The roadmap's "no alliance with an
  overlord" is no rule of the game (1938's data puts Tannu Tuva in the Soviet alliance).

### ADR-808 · 2026-11-03 · accepted — A nation called beside one it is at war with stays out (ROADMAP R3, R27-N2)

- **Context.** Critic runs 27–28 (R27-N2): a bonded Force war "calls a nation in beside its enemy"
  (1777: 3 cases; 8209: 7 pairs), and the nightly's checker on new seed 1009 (run 41624512914):
  a day after Greece's Force war on Turkey, Italy's AI declared on Turkey, and Czechoslovakia, at
  war with Turkey and Iran, was called to their side as Turkey's guarantor. The Force war only made
  the state; the hole was `declareWar`'s call: a nation called to a side was judged against the
  other side (ADR-230, ADR-797, R25-B1) and never against its own.
- **Decision.** In each of the call's three steps, a called nation stays out (with its puppets) when
  it is at war with a nation already standing on the side it is called to. As with the other
  checks, of two at war the one called first fights; the leaders, and the puppet a declaration
  names, always stand.
- **Evidence.** The checker (`tools/diag/diploInvariants.ts`, rule `realm`): at the critic's commit
  73c531b6, 1777 to day 351 with every pair tried on days 60, 200, 350: **21 broken → 0** with the
  fix patched in; 8209 (random, heroes) 0 either way. On HEAD: 1009 (the nightly's) 2 → 0; 1777 and
  1009 every pair to day 351: 0. `tests/unit/calledBesideFoe.test.ts` red before, green after.
- **Decisions checked (ADR-803).** ADR-230 (one at war with the enemy stays out), ADR-797 (pledges),
  R25-B1 (one fighting beside the enemy stays out), ADR-184 (`alone` calls nobody): the change only
  keeps nations out, and they are held by `realmWars.test.ts`, `diploInvariants*.test.ts` and the
  whole suite, green. Seed 99's pin is unchanged.

### ADR-807 · 2026-11-03 · accepted — A beaten overlord's great subjects turn on it; a rising leaves the shared alliance (ROADMAP R2)

- **Context.** Critic run 28, non-blocking 1: in 3 seeds × 30 years no AI puppet rose. Loyalty
  relaxes toward 40 + 0.6 × autonomy, 25 lower while the overlord is losing (ADR-31); at autonomy
  ≥ 10, the voice a rising needs, that target is never under 21, and the line is 20. The war of
  independence happened only by God's hand.
- **Decision.**
  - While the overlord is losing a war (its side's score ≤ −30), the target falls by a further
    `SIZE_PENALTY` (25) × min(1, the puppet's gross income ÷ its overlord's). A beaten master is
    turned on by the subjects as rich as itself; a poor one is held. At peace, and at war but not
    losing, the target is ADR-31's alone: the loyalty the panel shows does not move with no war to
    explain it. Income, as tribute reads it: land made the great colonies (the Congo, French West
    Africa) larger than their metropoles at once, and the men under arms read 0 for most colonies.
    The share is capped at 1, so in effect the term is "a subject as great as its master".
  - A puppet that rises and shares an alliance with its overlord's realm (Tannu Tuva in the Soviet
    one) leaves it first (`AllianceLeft`). Before, the war was refused as between allies
    (`WarRejected`): the rising only freed it. Found by the checker's new rule.
  - No shock to loyalty on a lost peace: a replay of 30 such drops counted 500–1,200 wars ended on
    the losing side a seed (white peaces among them), and every variant made a wave.
- **Why these numbers.** `tools/diag/puppetLoyalty.ts`, 3 seeds (7019, 3163, 1777) × 30 years
  each, the risings (`PuppetRevolt`) against the puppets made (`PuppetCreated`); bar ≥ 1 rising
  on 2 of 3 seeds, at most 1 in 10:
  - 35: 11 / 87, 5 / 64, 4 / 97 (7019 over); 30: 10 / 75, 5 / 82, 7 / 114 (7019 over);
  - **25: 3 / 81, 2 / 72, 5 / 84**; 20: 1 / 85, 0 / 76, 3 / 74 (one seed with none).
  At 25 a rising needs about autonomy ≤ 46 and a long losing war: a peace's puppet (autonomy 30,
  +0.25 a month) can rise in its first five years or so, which keeps the risings few.
  Of the 10 risings at 25, 7 are 1938's colonial bonds (the Dutch East Indies, French West and
  Equatorial Africa, the Belgian Congo) and 3 puppets made in play (Italy and French West Africa
  under Nationalist Spain, Poland under China; seed 1777).
- **Decisions checked (ADR-803).** ADR-31 (loyalty rises with autonomy; revolts need a push): kept,
  the push is a losing overlord as before, now with a great subject; held by `puppets.test.ts`
  "no revolt or release in the first months of 1938". ADR-184 (a war of independence is the two
  realms'): kept, the rising still declares `alone`, and leaving the alliance is what lets it;
  held by `realmWars.test.ts` and `rebelWars.test.ts`. R26-B1 / PLAN 7.191 (the rebel leaves the
  wars beside its overlord first): unchanged, held by the checker's revolt probes.
- **Consequences.** The checker (`tests/helpers/diploInvariants.ts`) has a rule `rise`: a puppet
  rises only at a month's start, with a voice and loyalty under 20 the hour before, and is then at
  war with its old overlord; every puppet so placed at a month's start rises, is freed or ends. It
  was red on two patched rules (a rising at loyalty under 60; none at all) and green on its seeds.
  SPEC § puppets, step 5. The tick cost is one division a puppet a month.
  Seed 99's pin after one year: a7946f81 → 614c24dd.

### ADR-806 · 2026-11-03 · accepted — The relations graph: what it draws and from what (ROADMAP R1, the user's feature)

- **Context.** The user asked for a visual graph of every war, alliance, guarantee, puppet bond and
  truce (2026-11-03). The map modes colour the land by one relation at a time, around one selected
  nation; nothing shows the whole web at once.
- **Decision.**
  - A panel of its own ("Relations", a bottom-bar button beside Statistics and History, closed by
    the others as they are). It reads only the statistics message (`nations`, `wars`); it computes
    no relation of its own, so it can never disagree with the nation panel.
  - Nodes: each living nation with a tie, its flag in a disc sized by the square root of its land
    share; nations with no tie are left out, and counted in the footer. Each war is a small hub (⚔)
    with an edge to each member, red for the attackers and orange for the defenders: a war of 7 on
    3 is 10 lines, not 21, and a nation in two wars touches two hubs.
  - Edges: an alliance is a star from its leader (`alliance.members[0]`) to each member; a
    guarantee is directed, guarantor → target; a puppet bond is directed, overlord → puppet; a
    truce joins its two nations, dashed. Each kind has its colour and can be switched off.
  - The layout is a force layout with no random numbers: a new node starts at its neighbours'
    centre (else at a place hashed from its id), and each update starts from the last positions,
    so the same world draws the same graph and a change moves it a little.
  - A click on a node selects that nation (as the ranking does); a click on an edge says what it is
    in the footer ("Germany guarantees Poland"), which works on touch too.
  - The code lives in `src/ui/` (`relationGraph.ts`, `relationLayout.ts`, `RelationsPanel.tsx`):
    it is the page's alone, and a file in `src/shared/` would change the checkpoints' key and the
    sweep's inputs for nothing.
- **Consequences.** A unit test compares the graph built from the worker's own statistics message
  with the relations read from the world directly (`wars.list`, `overlord`, `allianceOf`,
  `guarantees`, `truces`), on three seeds and three days: no relation missing on either side.
  No sim change; seed 99's pin is unchanged.

### ADR-805 · 2026-11-03 · accepted (the user's decision) — after the release: the loop's machinery retired; our own goals over AoC's; a roadmap, CI and a changelog; the relations graph first

- **Context.** `release-2026-11-03` met the DONE CONDITION (critic run 28 full and clean, check:review, soak, sweep,
  bench). The loop's machinery was built to reach that line:
  - the parity score was 48.1 % with 0 rows verified, and could not move: a row is verified only with a dated
    observation of AoC itself, and `reference/NOTES.md` was never provided;
  - PROGRESS.md (1.9 MB) and DECISIONS.md (2.0 MB) are searched, never read;
  - SPEC.md (290 KB) had become a design log;
  - the gate, `critic:due` and `plan:archive` read PLAN's phase ticks, and every phase is done;
  - the game has its own direction (semantic zoom, countryballs, heroes, the nuclear AI, the drawn diplomacy). The
    critic's "what AoC does better" lines and design objections no longer lead to work.
  - 12 GB of probe output sat untracked in `.cache/` and `critic/`.
- **Decision.** All of these, one commit each:
  1. **Cleanup.** The probe output in `.cache/` (kept: `data`, `checkpoints`, `gate`, `sweep`, `soak`, `runs`) and
     `critic/`'s screenshots, builds and saved states are deleted. Tracked `critic/` keeps the last report and the
     files it and its scripts cite; earlier runs leave the tree (git history keeps them).
  2. **Parity retired.** `docs/PARITY.md` is frozen at 48.1 % as a record. `npm run parity`, its stage in the gate
     and `check:full`, and its tests are removed. The tests go with the feature they test; nothing is weakened to
     pass.
  3. **The plan retired.** PLAN.md and `docs/PLAN_DONE.md` are frozen as a record. `ROADMAP.md` holds what is to do.
     `critic:due`, `plan:archive` and the gate's phase-review trigger are removed. The whole unit and e2e suites run
     in `check:full` and `check:review`, before a release.
  4. **The logs archived by month** under `docs/history/`; PROGRESS.md and DECISIONS.md keep the current month.
  5. **PROMPT.md, CLAUDE.md and CRITIC_PROMPT.md rewritten** for work after the release:
     - "continue" is the next unchecked ROADMAP item;
     - kept: the hard rules, the gate, ADR-803's rule check and checker, ADR-804's batch → critic → release tag;
     - dropped: the DONE CONDITION and its string, the phases, step 10's opening list.
     The critic scores against our own goals (fun to watch, readable, stable, fast, rules that agree), with AoC a
     source of ideas only. The JSON keeps its shape.
  6. **CI:** a nightly GitHub Actions run (typecheck, lint, unit, the ten-year tests, a soak, the war-and-peace
     checker on new seeds, a small sweep), a weekly full sweep. No e2e or bench there: no GPU.
  7. **CHANGELOG.md**, one entry a release tag.
  8. **SPEC.md** becomes a description of the game as it is: §1–§2 and a contents list now, the rest a ROADMAP item.
  9. **Checkers for every system** (economy, navy, air, nukes, bonds), as `diploInvariants` checks war and peace:
     ROADMAP items.
  10. **The relations graph** (the user's feature, 2026-11-03): a view of every war, alliance, guarantee, puppet bond
      and truce, the first item of the next batch.
- **Consequences.** The gate is shorter (no parity stage). A release still needs `check:review`, the soak, the
  sweep (borders moving), the bench and a clean full critic run. No sim change; seed 99's pin is unchanged.

### ADR-804 · 2026-11-02 · accepted (the user's decision) — release before new features; focused critic runs; the checker over the options; less to read each iteration

- **Context.** Across critic runs 18–26 every report had 0 or 1 blocking issue, almost always in the newest feature:
  R19 the map-mode menu, R20 the formation panel, R22 the countryballs' helmet, R24 random diplomacy. Runs 21 and 23
  were clean. After run 23 only the T0 frame rate (7.181) was left, then random diplomacy, the heroes and the camera
  follow came before a release. A critic run takes about 1 h 45 m (runs 25, 26) and re-scores all 14 dimensions,
  even on a round that fixes one. ADR-803's checker ran only the default options. An iteration's read list (SPEC
  290 KB, BLOCKERS 187 KB, DECISIONS 2.0 MB, PARITY 190 KB) was over 4 MB.
- **Decision.**
  - PROMPT step 2a, after a clean full report:
    - the next iteration runs the DONE CONDITION's other checks. When they hold, it tags `release-<YYYY-MM-DD>`
      and pushes the tag;
    - a feature the user asks for while PLAN 7.5 is open goes in a batch after 7.5, unless the user says otherwise;
    - after the release a batch is built whole, with one critic run on it. Each feature adds its rules to a checker,
      as `diploInvariants` does for war and peace.
  - `CRITIC_PROMPT.md`: the critic decides from git whether its run is **focused**. It is focused when the last
    report has a blocking issue or a score under its bar, every commit since is a task that report filed or changes
    nothing under `src/`, `data/` or `public/`, and the last three runs were not all focused. A focused run re-runs
    the last report's cases, and scores afresh the dimensions that report had under its bar or blocked on, plus
    those the changed files touch. It carries the other scores, marked "carried". The JSON gets `mode`. The DONE
    CONDITION needs a full run.
  - `tests/unit/diploInvariantsOptions.test.ts`: the checker with the heroes on (8821, random diplomacy) and on
    the random world of 60 (seed 7). Both are green on HEAD (44 s and 24 s); the heroes with scenario diplomacy on
    7019 are green too (41 s).
  - The read list (CLAUDE.md, PROMPT step 1):
    - SPEC §1, §2 and the sections the task touches;
    - BLOCKERS' open entries and watch list, with the 108 resolved sections (and the two waits on done PLAN
      7.90–7.92) moved to `docs/BLOCKERS_DONE.md`, which is searched (BLOCKERS.md 187 → 57 KB);
    - DECISIONS' last day of ADRs, the rest searched;
    - PARITY's rows the task touches.
- **Consequences.**
  - A fix round costs a focused run, likely shorter. The cost is less free exploration of the dimensions it
    carries; every fourth run at most is full anyway.
  - The user's feature requests near a release wait for it, unless the user puts them first.
  - No sim change; seed 99's pin is unchanged.

### ADR-803 · 2026-11-02 · accepted (the user's decision) — the critic loop: the rules of war and peace checked together; the last report's probes before a run; no check:review

- **Context.** Critic runs 24–26 each scored diplomacy 6 with one blocking issue, and each was made by the fix before:
  - R24-B1 came from the random diplomacy option (7.182), added after run 23 was clean;
  - R25-B1 came from 7.188's leave rule;
  - R26-B1 came from 7.189's `Beside` refusal, which was run 25's own "Fix" line and went against ADR-780.

  No test checked the rules together, so each regression cost a lap of about 2–4 hours (fix, `check:review` about an
  hour, the critic). Before each of these runs, `check:review` found nothing the critic then blocked on.
- **Decision.**
  - `tests/helpers/diploInvariants.ts` checks four rules on a 1938 run:
    - no land held at peace;
    - no exit from a war, and no war over, without a row (a peace, `WarEnded`, `WarLeft`, a death);
    - no war inside a realm or alliance, and no nation at war with one it fights beside;
    - a bonded puppet's or ally's Force war, or a puppet's revolt, never refused for `Beside`.

    It checks them every day of half a year. On days 30, 90 and 150, on copies of the world, it also checks pairs
    that fight beside each other, bonded pairs and random pairs going to war by `declareWar` and by `forceWar`, and
    puppets revolting. `tests/unit/diploInvariants{Scenario,Random}.test.ts` cover 7019 and 2207 (scenario), 8821
    and 3739 (random); `tools/diag/diploInvariants.ts` runs one case.
  - PROMPT step 2a: no `npm run check:review` before a critic run (this replaces ADR-554's run). Instead, the last
    report's probes in `critic/scripts/` and the checker are re-run on HEAD. A probe that still shows its defect
    reopens its task, and the critic waits.
  - PROMPT, KEEPING ITERATIONS SHORT:
    - a sim rule change first lists the accepted ADRs and SPEC lines it could contradict, each with a test, or the
      conflict goes to the user. A critic's "Fix" line is checked the same way;
    - a war-and-peace finding the checker misses adds its rule to the checker.
- **Consequences.**
  - On HEAD 60d1ef05 the checker finds 0 broken on all four cases (33–47 s each; 81 s for both files under vitest).
  - On the commits the critic read it is red:
    - 82d428c1 (8821 random): `held: JAP on CHI, 1345 cells at peace` on day 0 (R24-B1);
    - e4386478 (7019 scenario, 8821 random): 23 and 26 exits with no row (R25-B1);
    - 33c84306 (7019 scenario): a bonded Force war and a revolt refused for `Beside` (R26-B1).
  - Nothing runs the whole unit and e2e suites before a critic run now. A break in a test outside the changed
    files' imports is found by `npm run check:full` at the DONE CONDITION, or by the critic.
  - No sim change; seed 99's pin is unchanged.

### ADR-802 · 2026-11-02 · accepted — PLAN 7.192: a war left and a revolt in the ticker; the bond and the shared war; the alliance greyed

- **Context.** Critic run 26 kept diplomacy at 6. Its non-blocking 1–3:
  - the ticker told neither a war left nor a revolt;
  - "Fights beside you" hid "Allied" and "Your overlord";
  - "Propose alliance" was live where the sim turns it down (one's own overlord, a nation in an alliance).
- **Decision.**
  - `WarLeft` and `PuppetRevolt` are ticker kinds, with cues: a war left the peace cue, a revolt the war cue. This
    amends ADR-800 for `WarLeft`. `GuaranteeLapsed` stays a history row only.
  - A bond's standing with a nation it fights beside carries `beside` and reads "<bond> · fights beside you".
  - `allyWhy` mirrors `proposeAlliance`. The menu and the Actions tab grey "Propose alliance", with its reason as
    the title.
  - The sim refuses a puppet's alliance with its own overlord.
- **Consequences.**
  - On 72 pairs at the 1938 start, `allyWhy` agrees with the sim on every one.
  - Unit tests are red on 33c84306, and an e2e test (`bondsMenu1938`) covers the menu and the ticker
    (`docs/evidence/7.192/at-run.md`).
  - Seed 99's pin is unchanged.

### ADR-801 · 2026-11-02 · accepted — PLAN 7.191 (R26-B1): a bond's break wins over `Beside`; a rebel leaves its overlord's wars

- **Context.** Critic run 26's blocking issue: ADR-799's `Refusal.Beside` was checked before the bonds and `forceWar`
  took it as hard. A puppet joins every war of its overlord, so a puppet's Force war on its overlord was refused on
  59–78 % of puppet-days and an ally's on its ally on 52–68 % of allied-pair days. God's revolt freed the rebel and its
  war was refused, so it stood free beside its old overlord. Both contradict ADR-780 and SPEC's war of independence.
- **Decision.**
  - `whyNotWarOn` names a bond first and `Beside` only for a partner with none.
  - `forceWar` with a bond to the defender or its overlord first leaves, with its puppets, every war one of them
    fights on its side (`leaveWarsBeside`, the same rows and land as `leaveBondedWars`: `WarLeft`, or `WarEnded`).
    It then breaks the bond and declares. The new war is the cost of the exit.
  - A partner with no bond (Poland on France) is refused as ADR-799 has it, before any truce is broken.
  - `puppetSystem`'s rebel leaves the wars it fought beside its overlord in, then declares its war of independence.
  - The menus' standing names the bond ("Allied", "Your overlord"), and Force war is live there. "Fights beside you"
    is left for a partner with no bond.
- **Consequences.**
  - On the critic's 4 seeds (7019, 2207, 5113, 9241), every 30 days to day 365: 0 Force wars refused for `Beside`
    (the critic measured 52–78 % on 33c84306), and no nation stood on one side with its enemy after.
    - Puppet on overlord: 1587 of 1598 declared.
    - Ally on ally: 1512 of 1548 declared.
    - On 5113, the rest were refused for `Overrun`. Source: `tools/diag/bondExit.ts`, `docs/evidence/7.191/at-run.md`.
  - A rebel freed with a truce or an alliance with its overlord is still refused, as before PLAN 7.189. The revolt
    breaks neither.
  - Poland on France: refused, the old war on (as ADR-799). Germany on Italy (COBEL): Germany leaves the alliance and
    the Polish war and fights Italy.
  - ADR-799's tests of the bonded cases now read the bond's break (Albania freed, fighting Italy, out of the Japanese
    war; Germany out of the alliance).
  - Seed 99's pin is unchanged (a7946f81).

### ADR-800 · 2026-11-02 · accepted — PLAN 7.190: the pledges in the nation panel; a lapse and a war left are rows

- **Context.** Critic run 25 kept diplomacy at 6 with R25-B1 (7.189) and its non-blocking 1 and 9: guarantees were
  shown nowhere, so a pledge, its binding (ADR-797) and its lapse were invisible; a war a nation left had no row.
- **Decision.** The statistics message carries each nation's `guarantees` (the nations it guarantees) and `guarantors`;
  the panel's overview lists them as "Guarantees" and "Guaranteed by", nation chips. `GuaranteeLapsed` (a guarantor, b
  target) is logged after a declaration that puts the two on opposite sides; `WarLeft` (a the nation, b the enemy's
  leader) when a bond takes a nation out of a war that goes on (`leaveBondedWars`; one that ends so stays
  `WarEnded`). Both are history rows, not the ticker's (as an alliance's changes; the declaration is the ticker's).
  A pledge of a nation that dies goes with it, told by the death.
- **Consequences.** On 3739 day 0 the 8 guarantees of the start in both panels (an e2e test, red on e4386478); 1 of 1
  lapse with its row on 1522–1531 to day 60 (`tools/diag/pledgeRows.ts`, `docs/evidence/7.190/at-run.md`). Seed 99's
  pin unchanged.

### ADR-799 · 2026-11-02 · accepted — PLAN 7.189 (R25-B1): a war on one's partner in a war is refused; 7.188's leave rule goes

- **Context.** Critic run 25's blocking issue: PLAN 7.188 (ADR-797) took an attacker that stood on one side with a
  defender in an older war out of that war. A player whose peace was refused declared on its partner (Poland on France)
  and was out of the war at once, the land held both ways back, no peace, no truce, no row; God's Force war of Germany
  on Italy the same (3 of 3 seeds each).
- **Decision.** `whyNotWar` refuses a war between two that fight on one side in a war (`Refusal.Beside`, before the
  bonds, so `forceWar` breaks nothing of it); a nation called into a war against one it fights beside stays out, as
  one with a bond does, and fights on in the old. The leave in `declareWar` is gone (`leaveBondedWars` as before
  7.188). The menus read the standing "Fights beside you" and grey the war, the refusal its title.
- **Consequences.** On 7019, 2531, 8467, Poland on France (day 45) and Germany on Italy (day 61): 0 of 6 leave
  (e4386478: 6 of 6, the land to 0; `tools/diag/partnerExit.ts`, `docs/evidence/7.189/at-run.md`). 7.188's freed
  Albania: its war on Italy, beside it against Japan, is refused, and it stays Italy's puppet on one side of each
  war (its test reads the refusal for the leave; no nation on one side with its enemy, as before). The forceWar
  test's overrun case moved to a world with no war of Germany's (Italy is beside it in the Polish war). Seed 99's
  pin unchanged (a7946f81).

### ADR-798 · 2026-11-02 · accepted (option a, the user's decision of 2026-11-02) — The ten-year runs' fleet guard after PLAN 7.188: seed 1 stands 24 of 197 after one year, floor 25 (ADR-633)

- **Context** (`npm run check:review` before critic run 25, PLAN 7.5): `tests/sweep/aiSweep1` red twice, "fleets
  of the start that stand after one year: expected 24 to be greater than or equal to 25". On the review of 82d428c1:
  54, 56, 64 on seeds 1–3; on 5d7b214b: 24, 70, 71.
- **Measured** (`tools/diag/fleetYear.ts`, HEAD against ac449e8d, seed 1): standing 81 / 78 / 62 / 35 / 24 on days
  30, 60, 90, 120, 365 (before 81 / 78 / 75 / 74 / 54). The wars declared are the same to day 158. 7.188 keeps
  Czechoslovakia out of the Soviet war on Romania; it ends on day 64 (was 69), Romania a Soviet puppet both times.
  Before, the United States' war on Romania (declared day 59) ended with it on day 69; now it goes on, the United
  States lands (score 0 → 30 on days 95–130), and 27 of its 36 fleets at home sail on days 90–120. `makePuppet`
  takes the new puppet out of the wars against its overlord's side only, as before 7.188.
- **Options.**
  - (a) *Recommended.* The floor is a stated share: a tenth of the start's fleets stand after one year (20 of 197).
    The guard asks that the daily test (a fleet no rule should have touched is a line, unchanged) has fleets to ask;
    24 fleets for 365 days still do, and a war that sails a great power's navy is the rules' work. ADR-633 amended.
  - (b) Keep 25, and a rule: a nation made a puppet leaves the wars its overlord is not in (its diplomacy its
    overlord's). A sim change, the pin moves, every history after it with it; its own AT.
  - (c) Keep 25, and a PLAN task to read the puppet's war first (a puppet at war for months beside no overlord);
    the critic waits on that task.
- **Consequences.** (a) taken: `tests/helpers/aiSweep.ts` asks `Math.ceil(fleets.start / 10)` (20 of 197); seed 1's
  24 passes. No sim change, the pin unchanged. Critic run 25 after the review.

### ADR-797 · 2026-11-02 · accepted — PLAN 7.188: a pledge binds as a bond; nobody fights beside its enemy; the pin moves

- **Context.** Critic run 24 scored diplomacy 6 (R24-B1, fixed in 7.187, and its non-blocking 1, 6, 9). (9) The
  Soviet Union declared on Romania on days 4–11 of 3 of 3 seeds and called Czechoslovakia, Romania's ally, in
  against itself while it guaranteed it, the pledge kept. (1) Albania, freed by its force war on Italy, fought
  Italy and stood with it against Japan. (6) The nation menu offered "Propose alliance" (greyed) to an enemy.
- **Decision.** In `declareWar`: a nation called against one it guarantees, or one that guarantees it, stays out
  as one with a bond does; a pledge between the two sides that is left (only the leaders' can be) lapses; and an
  attacker on one side with a defender in an older war leaves that war (`leaveWarsWhere`, the way of
  `leaveBondedWars`: its puppets of that side with it, the land held back). The menu shows no "Propose alliance"
  at war (to an ally, greyed as before); the Actions tab's is greyed at war.
- **Consequences.** On 1517, 3739, 8821 and 1511–1521 (not 1517 twice) to day 30, no guarantor at war with its own
  (`tools/diag/pledgeWars.ts`, `docs/evidence/7.188/at-run.md`); the Soviet Union still goes to war on Romania on
  the same days, without Czechoslovakia. The default world changes: seed 99's pin dc41c283 → a7946f81.

### ADR-796 · 2026-11-02 · accepted (option a, the user's decision of 2026-11-02) — PLAN 7.186: the crossing by sea moved nothing; the AT missed
**Context.** The rule (uncommitted): a land hero with no way over land to its army's nearest fights goes to the nearest
on another land by sea, by a port of its land where its nation's transports wait (`orderMove`'s `byPort`, as a
player's order). AT, 1491–1500 × 3 (`docs/evidence/7.186/at-run.md`): 93 of 170 lives at or above the top-decile
regular (0.547, bar 2/3); Britain and the United States 13 of 42 (bar 1/2). HEAD on the same seeds: 113 of 195
(0.579), 20 of 55 (0.36): the crossing no better, a little worse. These seeds are harder than 7.185's (HEAD 0.579 here,
0.640 on 1481–1490). Sea: `with` 45 of 70, `ofFleet` 54 of 61. Not read: how many heroes went aboard.
**Options.** (a) Drop the crossing; close 7.186 not done, and the heroes' AI with it (7.184e's sea rule and 7.185's
`joinFights` stay; no further task) (recommended); (b) a task to read first whether a hero ever goes aboard, and why
not, before another rule; (c) commit the crossing (neutral within noise), close not done.
**Decided (a).** The crossing dropped; 7.186 closed not done, and with it the heroes' AI: a sea hero sails with its
nation's largest fleet (7.184e), a land hero joins its army's nearest fight (7.185). The sweep:quick smoke of those
rules (heroes on and off) is reported in PROGRESS.

### ADR-795 · 2026-11-02 · accepted (option a, the user's decision of 2026-11-02) — PLAN 7.185: the re-scoped AT missed by 3 points; the heroes overseas
**Context.** ADR-794 (a)'s AT on 1481–1490 × 3 (`docs/evidence/7.185/at-run.md`), with `joinFights` and its fallback to
the fights' own cells (uncommitted; the unit test red without): 110 of 172 hero lives at or above their nation's
top-decile regular, 0.640 against 2/3. By nation (pass/miss): ENG 10/20, USA 2/9, FRA 23/8, GER 12/7, ITA 24/4, JAP
22/8, SOV 17/6; without Britain and the United States 98 of 131 (0.75). Their armies fight overseas: a hero is ordered
over land only, and many of its orders are refused (Britain's TOG II on 1487: 904 refused, its army fighting on no land
of its). Sea: `with` ≥ 0.5 on 57 of 70, `ofFleet` on 49 of 59 (83 %; 7.184e 89 %, other seeds). Where a nation has few
regulars (3–7) the top decile is its best one.
**Options.** (a) Commit the rule; close 7.185 not done (0.640); a numbered task for a land hero whose army fights
overseas (by the lift, as a division of its nation is), AT the same bar on unseen seeds (recommended); (b) commit the
rule and count the AT only where the hero's army fights on the hero's own land: ticked (0.75 on the lives so counted);
(c) keep 7.185 open for the lift now; (d) drop the rule, close not done.
**Decided (a).** The rule committed (`joinFights`, `HERO_TRIES`, the fallback to the fights' cells) with its unit test;
7.185 closed not done; PLAN 7.186 for the heroes overseas, which carries the sweep:quick smoke. The pin of seed 99 is
unchanged (no hero without the option).

### ADR-794 · 2026-11-02 · accepted (option a, the user's decision of 2026-11-02) — PLAN 7.185: the AT missed; the bar is above the regulars
**Context.** 7.185's read (`docs/evidence/7.185/at-run.md`, `tools/diag/heroLandWhy.ts`): on its army's fighting days a
land hero fought on 17 %, stood on 38 % (most a week or more) and marched on 45 %; 41 % of the days out of a fight it
was over 80 cells from the nearest. The rule (uncommitted): `joinFights`, the hero ordered onto the enemy formation
nearest to its army's nearest fight, 3 tried. AT on unseen 1471–1480 × 3: land `ofArmy` 0.161 (7.184e's seeds) →
0.201, ≥ 0.5 on 1 of 70: missed. Sea `with` ≥ 0.5 on 58 of 70 (7.184e 50 of 70), `ofFleet` 50 of 58 (86 %; 7.184e 57
of 64, 89 %). Two causes (`tools/diag/heroCeiling.ts`, 1471/1474/1476 × 1): (1) the bar is above what the regulars
reach: of each nation's ordinary land formations alive the whole year, the best is in 0.29–0.72 of its army's fighting
days, the top decile 0.05–0.56, the median 0.00–0.43; the hero is at or above its nation's top decile in 13 of 30 hero
lives; (2) refused orders: where every target of the hero is refused it stands (1471 Japan's O-I: 698 refused, 0 ok,
a year still, with its army fighting on its land 311 days; 1474 Soviet T-42 372 refused, 1476 Italy's P100 282).
**Options.** (a) Re-scope the bar to the regulars: each land hero's `ofArmy` at least its nation's top-decile ordinary
formation's, on ≥ 2/3 of the hero lives, unseen seeds; keep `joinFights`; within 7.185 a rule for the refusals (a hero
whose targets are refused tries the fights its way reaches) (recommended); (b) keep 0.5 and work on the refusals
(the best regular reaches 0.5 in few nations: likely a miss again); (c) keep `joinFights`, close 7.185 not done; (d)
drop it, close not done.
**Decided (a).** The AT, counted by `tools/diag/heroCeiling.ts`: a hero life is counted with 30 or more of its army's
fighting days, of a nation with 3 or more ordinary land formations alive 90 % of those days; it passes at or above the
top-decile one's share; ≥ 2/3 of the counted lives pass, on unseen seeds 1481–1490 × 3. For the refusals: refused at
every enemy target, the hero goes to the cells of the fights themselves (over its own side's land); on 1471/1474/1476 ×
1 that brought the lives at or above the top decile from 13 of 30 to 19 of 29.

### ADR-793 · 2026-11-02 · accepted (option a, the user's decision of 2026-11-02) — PLAN 7.184e: the AT missed; which of the heroes' rules to keep
**Context.** 7.184e's rules (in the working tree, not committed): a land hero, out of the operational AI's allotment,
ordered each plan onto the attack cell of its nation's most threatened own sector (up to 3 tried for a way); a sea
hero, every day at war, sailed after its nation's largest other fleet (where it fights, sails or stands), after the
day's naval plans. Unit tests red without each. The AT's run (`docs/evidence/7.184e/at-run.md`, 1461–1470 × 3, and
HEAD on 1461–1465): land `ofArmy` 0.158 (HEAD) → 0.148, ≥ 0.5 on 0 of 34 either way (1 of 69 on ten seeds): the land
rule moves nothing; sea `with` 0.603 → 0.721 (≥ 0.5 on 21 → 25 of 35), `ofFleet` 0.662 → 0.794 (23 → 28): better, not
every hero.
**Options.** (a) Keep the sea rule, drop the land rule; 7.184e closed not done; a numbered task to find why a land hero
is in so few of its army's battles (it marches on the front's enemy cell and is rarely engaged), AT `ofArmy` ≥ 0.5 on
unseen seeds (recommended); (b) keep both (the land rule is neutral) and the task; (c) drop both, close not done.
**Decided (a).** The sea rule committed (`naval.ts`: `heroFleets`, `sailWith`, its unit test); the land rule dropped;
7.184e closed not done; PLAN 7.185 for the land hero's cause. The pin of seed 99 is unchanged (no hero without the
option).

### ADR-792 · 2026-11-02 · accepted (option a, the user's decision of 2026-11-02) — PLAN 7.184e: the AT's 30 % is out of reach at sea
**Context.** 7.184e's AT: each AI hero of a nation at war in battle on ≥ 30 % of its days at war (1461–1470 × 3
years). HEAD's read before any rule (`docs/evidence/7.184e/head-read.md`, `tools/diag/heroBattle.ts`, 1461–1465): land
heroes 0.000–0.207, sea heroes 0.000–0.123. The ceiling (the days any formation of the hero's nation in its domain is
in battle): sea 0.003–0.172 on all 35 — a navy fights on few of its days at war, so a sea hero with its largest fleet,
or with every fleet, cannot reach 0.30; land 0.261–0.903, under 0.30 for 2 of 35 (an army that never meets its enemy).
**Options.** (a) The bar against the ceiling: a land hero in battle on ≥ 50 % of the days its nation's army is (where
that army fights on ≥ 10 % of its days at war); a sea hero with its nation's largest fleet (same sea zone or within
`SORTIE_KM`) on ≥ 50 % of its days at war, and in ≥ 50 % of the sea battles of that fleet (recommended: what the task
asks the AI to do, read where it can be done); (b) keep 30 % for land heroes only (where the army's ceiling is ≥ 30 %),
drop the sea clause's figure for the fleet's company; (c) close 7.184e not done, the heroes moved by the AI as any.
**Until then.** No rule: 7.184e waits with a BLOCKERS entry.

### ADR-791 · 2026-11-01 · accepted — PLAN 7.184c: a nation's heroes in its Overview
**Decision.** `NationStat.heroes` (`HeroStat`: formation or 0, name key, sea, health, days until back), built by the
worker's stats from the roster for a nation with heroes, absent otherwise. The Overview's first block, "Heroes": a
row a hero, its name and a health bar (green over 50 %, yellow over 25 %, red) with its share, or "returns in N days"
while it is gone ("waits to return" when its hour has passed and it has no place, or its nation is dead). A living
hero's row is a button: its formation's panel opens and the camera follows it (`PlayerControl.openHero`, as a click
on it on the map, PLAN 7.183), whichever nation is played; a gone hero's row is disabled.
**Why.** The user's request (7.184): the heroes are seen and found from their nation.
**Consequences.** At the world's zoom the camera has no room to move (the view is clamped to the map): the follow
centres the hero from a nearer zoom only.

### ADR-790 · 2026-11-01 · accepted (option a, the user's decision of 2026-11-02) — PLAN 7.184b3: bench G's T0 with heroes on, 309 fps against a bar of 311
**Context.** 7.184b's AT: bench G with `heroes=on` keeps T0 over 311 fps (0.9 × fbca2cc4's 345, ADR-784) and p95 under
6.9 ms. Bench G's GPU setting, heroes off and on alternately on the same build, three pairs each (`docs/evidence/7.184b/`
`b3-bench.txt`): with the hero counters painted each frame, off 318.1, 312.1, 311.9 and on 299.2, 301.6, 294.9 (−5 %);
with each drawn once and copied (`heroPictures`), off 317.3, 314.1, 318.2 and on 307.0, 308.7, 311.9 (−2.3 %, mean
309.2). p95 4.8 ms on (bar 6.9). The world without heroes reads 316 on this machine now, 0.92 × the 345 the bar came from.
**Options.** (a) Tick 7.184b3: the bar read as heroes on ≥ 0.97 × heroes off on the same build and machine (0.977 now)
— the bar measures the heroes' cost, not the machine's day (recommended); (b) keep 311: find the last 2 % (14 more
formations in the world, the counters' extra pass) as a numbered task; (c) close 7.184b3 not done.
**Until then.** 7.184b3 stays open with a BLOCKERS entry; the drawing is committed (its own AT holds).

### ADR-789 · 2026-11-01 · accepted — PLAN 7.184b: how a hero is drawn
**Decision.** (b1) `?heroes=on` is read from the URL now (`gameUrl.ts`), the way the e2e of the drawing opens a
world with heroes; the new-game form and the settings panel stay PLAN 7.184d's. A hero's name on its tag and panel
is its name alone ("Yamato"), not its kind and number: there is one of it (`MapView.formationName`, by
`TemplateInfo.hero`).
**Why.** The drawing's AT needs heroes on a page; the URL is the game's own way to pass a new-game option.
(b2) At T2 and T3 a hero's sprite (its element, its figure; its turret and wake with it; its stand-in) is drawn
`HERO_SCALE` (2) × its kind's size, in both looks: a bit of the instance's `aState` (`HERO_BIT`, 16, above the hurt
level's two bits), which the ball shader already read and the classic shader now declares; each multiplies its
size after the clamp to the least and most px. Its tag's box and the tests' `elementBallPx` and `shipHullPx` go with it.
**Why.** Through most of T2 an element is at its least size (5 px, a tank 8, a ship its class's): a hero's size in
cells doubled would draw the same as its kind's there. No new attribute or wider stride: the state buffer is bound
for both programs.
(b3) At T0 a hero is a counter of its own (`HeroCounter`, `CounterLayer.draw`'s `heroes`): not in its nation's
clusters, never folded, `HERO_SCALE` × a counter about its place, its name where a counter has its strength (a hero's
men are its crew: "6" told nothing), drawn above the others; one that would cover another hero's steps down below it
(Japan's two, at Yokosuka and Tokyo). At T1 its marker is `HERO_SCALE` × the others' (box, ball, chip, pips, number,
badges), never in a stack, drawn above the others. A land hero's symbol is armour (`symbolOf`: a `hero_` type counts
as a tank; it had the rifle cross). A hero's counter is drawn once into a picture at its device scale and copied
each frame (`heroPictures`, as ADR-784's balls): painted anew, the 14 cost bench G's T0 5 % of its frames, cached 2.3 %
(ADR-790).
**Why.** A hero folded into its nation's counter, or the lead of a stack, would not be seen at all.
**Consequences.** `heroFormations()` on the view lists them (tests, and the parts after). A hero's ball is large
enough to show its prop (a barrel, a hull) where its kind's is not. A hero's T1 marker covers its neighbours'.

### ADR-788 · 2026-11-01 · accepted — PLAN 7.184a3: the heroes' figures; a hero's tank carries its damage
**Decision.** Every sea hero: `hard` 1,100 (a battleship of 2,000 hit points sunk in about an hour of its fire),
`hpPerUnit` 25,000; every land hero: `soft` and `hard` 3,000, `hpPerUnit` 700; their other figures as ADR-787's.
A land hero's tank takes its losses as a wound that carries (`applyLoss`), not by the draw on whole tanks of PLAN
7.23a (`combat.ts`), which ended a hero of one tank on any hit.
**Why.** The AT's cases (`tests/helpers/heroFight.ts`, seed 99, AI off): the Bismarck against one battle squadron
sinks 9 of 16 and is left at 0.68, against three it is sunk on the first day; the Maus attacked by one armoured
division puts it to flight with 35 % of its men lost and is left at 0.74, by three it is lost on the second day. One
element fires at one target an hour (sea: torpedoes, which no armour stops, are most of the fire it takes), so the
hero's weight is in its hit points and its single shot. Before (ADR-787's first figures) the Bismarck was sunk by
one squadron in a day and the Maus did ~5 % of a division's men in six days.
**Consequences.** The same figures for every hero of a domain: no hero is stronger than another. A Maus attacking
a stack meets its front formation first: it beats three divisions one behind another, one at a time.

### ADR-787 · 2026-11-01 · accepted (the user's request) — PLAN 7.184a1: heroes' data stand last; a hero is a formation of one element
**Decision.** The 14 heroes are unit types and one-element templates in `data/units/heroes.json` and
`data/templates/heroes.json`, read after every other file of their kind (`UNITS`, `TEMPLATES_1938`), so that the
indices an element and a formation are saved with stay those of every save before. `hero: true` on the unit type
makes `TemplateRule.hero`: the sim refuses such a template to `queueFormation`, `spawnFormation`, `spawnFleet` and
`spawnWing` (`NoSuch`), and the page leaves it out of the Actions tab's production, God's placing and the editor's
lists (`TemplateInfo.hero`). The roster is `data/scenarios/1938/heroes.json` (validated: a hero template of its
domain, a living nation, one of each domain a nation, a sea hero at its nation's naval base). With `heroes: 'on'`
(`GameOptions`), the Sim raises them after `applyGameOptions` (`addHeroes1938`): a sea hero at the water a fleet of
its port finds (`placeFleets`), a land hero at its capital. `World.heroRoster` (nation, template, start place) and
`World.heroes` (formation → row) are state, saved while not empty, so the hash of a world without heroes is the one
before. The economic AI lays up, disbands, folds and refills no hero (`world.heroes` guards; their upkeep is 0 too).
**Why.** The user's request. A unit of one element keeps the hero one thing on the map and in combat; ids and
indices after everything keep the option-off world and every old save bit for bit.
**Consequences.** A hero's men (`strength`) are its crew while it lives: losses are its element's `wound`, so its
health is `1 − wound` (healing, the Overview's bar). A hero's tank takes supply attrition and breaks down as any tank
with no supply. A puppet integrated by its overlord hands its formations over, a hero too. The figures are first
guesses; PLAN 7.184a3 sets them against a battle squadron and an armoured division.

### ADR-786 · 2026-11-01 · accepted (the user's request) — PLAN 7.183: the camera follows any formation clicked
**Decision.** A click on a formation the player cannot order (another nation's, or any with no nation played) opens
its panel as before and now has the camera follow it where it is drawn (`MapView.pickedPoint`, `followPicked`; the
same `shownAt` as the selection's follow), land or sea. The follow ends with a pan, or when the point is gone: its
panel closed (Escape, its button, a click on ground) or the formation gone. A click that is an order (the player's
selection marched onto an enemy's formation) keeps the selection's follow.
**Why.** The user asked for it: before, only the played nation's own selection was followed.
**Consequences.** A click on a stack of T1 markers brings the stack to the middle, so the next click to open its next
formation (ADR of PLAN 7.4f20) is where the stack now is: `stackPick1938` clicks the stack where it is drawn once
the camera has settled (its check, each member opened in turn and the lead again, unchanged).

### ADR-785 · 2026-11-01 · accepted (the user's request and decision) — PLAN 7.182: the start's alliances, guarantees and wars drawn by the seed; puppets kept
**Decision.** A new-game option "Alliances and wars" (`GameOptions.diplomacy`, `?diplo=random`, `opt-diplomacy`; i18n
key `settings.diplomacy`), offered where the scenario starts with alliances or wars (`ScenarioInfo.diplomacy`: the
1938 world; not the random or toy world, which start with none). Random: `randomDiplomacy` (src/sim/gameOptions.ts)
lets the scenario's alliances, guarantees and wars go without a trace (no alliance into `past`, so the history log
shows none dissolved) and draws as many of each from the seed. The shape is the scenario's: 7 alliances of its sizes
and unity, named "Defensive Pact", of independent nations grown from a first one through land neighbours (any
unaligned nation when none borders them), led by the largest by land; 8 guarantees, each guarantor of the larger
half of independent nations by land; 2 wars, each declared by `declareWar` (puppets, allies and guarantors called,
bonds kept out) by an independent nation at peace on an independent land neighbour at peace. The default path is
untouched (the pinned hash of seed 99 stands).
**Why.** The user asked for a start option to randomize 1938's alliances and wars. Puppets (40, mostly empires'
colonies and dominions) stay the scenario's: asked whether to reshuffle, free or keep them, the user chose keep.
A guarantor drawn from any pair gave pledges such as Guatemala's to the CCP; the larger half keeps a pledge of weight.
**Consequences.** The counts follow the scenario; a random count is a later option if wanted. A war declared at the
start calls the attacker's realm and allies as any war: Britain's draws its empire in. Each drawn war is a
`WarDeclared` row of the history log on the first day (the scenario's own wars have none): the player is told of
wars that no history book gives; the drawn alliances have no row.

### ADR-784 · 2026-11-01 · accepted — PLAN 7.181: the overlay's countryballs drawn once and copied
- **Context.** PLAN 7.5's DONE-condition bench on fbc9fbc3: GPU T0 135 fps, p95 21 ms, against fbca2cc4's 348 fps,
  p95 4.3 ms (budget 60, so in budget). The same code in the classic look: 346. A probe of T0 as bench G sets it
  (each part of `draw` timed) put the CPU of the two looks within 0.3 ms; the long frames were on the GPU's raster
  of the 2D overlay. With the planes' balls left out, classic's frames. Each ball drew a clip, a flag, a radial
  gradient and outlines; the gradient was most of it (left out: p95 11.3 → 5.4 ms). One gradient a context, set by a
  transform, and a pattern fill for the clip, did not help (11.8).
- **Decision.** `Ball2dCache` and `drawBall2dCached` (`ball2d.ts`): a ball is drawn once by `drawBall2d` into its own
  canvas, keyed by its flag's image (a new image draws anew), tint, look, prop, ring, radius, device scale and its
  centre's place off the device pixel to a quarter pixel; then copied onto the device's pixels unscaled. The T0
  counters and the planes in flight use it; a vee's balls are drawn after its planes with the shadow off (the shadow
  was on for the copy). A cache starts again past 4096 balls (a plane's ball takes a new size at each zoom). Under a
  turn or skew, or with no canvas (node), drawn as before. The T1 markers are unchanged (not in the bench's T0).
- **What it changes on the screen.** A ball's centre within 1/8 px of where it was; a ball fading (opacity under 1)
  fades as one picture, not part over part. A first cache at a radius step of 1/8, drawn scaled to fractional places,
  blurred the planes' 1.3 px balls into their outlines (`countryballs1938`'s flag reads 28 of 62, bar 50); the
  quarter-pixel phases read 50 of 62, as HEAD.
- **AT** (`docs/evidence/7.181/`): bench G fix, fbca2cc4, fix, back to back: T0 322.7, 345.5, 323.4 fps (≥ 0.9 ×:
  311), p95 4.6, 4.6, 4.6 ms; T2 174.8, 182.6, 179.1 (≥ 164).

### ADR-783 · 2026-11-01 · accepted (the user's decision) — PLAN 7.180: a plane in the ball look is its silhouette with a small ball on it
- **Context.** Critic run 22 (map visuals 6): at T2 the planes were the largest balls on the screen and read as units.
  At 250 m/px an infantry ball is 4.5 px across (radius 2.25); a plane's ball was 0.5 of its 13–19 px span (radius
  6.5–9.5) with grey oval wings. ADR-777 has every level a ball (the user's choice), planes too.
- **Options put to the user:** (a) Classic's silhouette in the nation's colour at its span, a flag ball no larger than
  an infantry ball on it; (b) the same shrunk until the whole plane is under an infantry ball's area (~8 px span:
  the filed bar, which even Classic's plane, ~38 px² against ~16, fails); (c) today's winged ball, smaller.
  **Chosen: (a)** (2026-11-01).
- **Decision.** In the ball look `vee` draws the plane's silhouette (as Classic, in its nation's colour) and a ball of
  its flag on it at PLANE_BALL (0.17) of a fighter's span at the plane's zoom: a bomber's plane is larger, its ball a
  fighter's. At every zoom, so nothing pops at T2/T3. `ball2d` loses its wings prop (no other user).
- **AT, re-scoped with the choice:** each plane's ball no larger than an infantry ball; both wings in the nation's
  colour; a ball of its flag; the plane's colour out of its ball at least the ball's area (the plane, not the ball,
  is most of it). The filed "width ≥ 2 × height" does not fit a plane's outline, as long nose to tail as tip to tip.
- **Also:** `countryballs1938`'s eye check read once at a wall-clock moment, and a blink (by wall time) shut 3–4 of
  13 balls' eyes on 4 of 7 runs with this change, 0 of 7 without: it now reads the balls twice, 0.5 s apart, and a
  ball's eyes count white in either read (a blink is 0.18 s in 3–6 s). 13 of 13 on 4 of 4 runs.

### ADR-782 · 2026-11-01 · accepted (the user's decision, option a) — PLAN 7.179: the flag whole below the helmet's brim; the AT's bar is the top stripe, not a mean colour
**Decision.** An infantry ball's flag is drawn whole below the helmet's brim (`HELMET_FLAG_TOP`, `flagUv`; the
shader blends it in with the props' fade, so a small ball with no helmet keeps its whole flag; `ball2d` squashes it
the same way for the T1 markers and T0 counters). PLAN 7.179's AT is corrected from "the mean colour of German and
Polish infantry balls ≥ 100 apart" to "a band just below the brim is the flag's top colour" (Germany's black,
Poland's white), on ≥ 80 % of each nation's balls at 10 and 600 m/px, and no black on a Polish band.
**Why.** The filed bar borrowed the critic's figure of 52, which was the mean of the red pixels alone (German red
against Polish red, which no fix touches). The whole disc below the brim, as the test measures it, reads 81 apart at
10 m/px and 68 at 600 m/px on `4a977fdb`, and 57 and 51 with the fix: both balls gain their top stripe, and a
black-white-red ball and a white-red one share two of three colours. The bar went the wrong way under the right fix.
The critic's own discriminator was the dark share (`c22_cb2_pixels.py`): the band says it per nation. On
`4a977fdb` the German band shows its black on 0 of 8 balls at 10 m/px and 0 of 15 at 600 m/px (it is white); with
the fix 8 of 8 and 15 of 15; Poland 3 of 3 and 12 of 12 white both times, no black. Seed 7019 finds German infantry in contact on
day 1 now, not the critic's day 4–5 (commits since have moved its history).
**Consequences.** The bar is changed after the run read it, so it is the user's to accept (as ADR-525): (a) accept
the band bar, 7.179 stays ticked; (b) keep the mean-colour bar, 7.179 closed not done, the fix kept. The rim in the
nation's map colour (the report's other option) is not taken: it would change the ball's outline, the user's look.
