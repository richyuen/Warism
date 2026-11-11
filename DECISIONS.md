# Decisions (ADR log)

Format: ID · date · status · decision · why · consequences. Deliberate deviations
from AoC are tagged **[AoC-DEVIATION]**.

---

> The ADRs before the last release tag are in `docs/history/`: `DECISIONS-<YYYY-MM>.md` (October) and
> `DECISIONS-<release tag>.md` from November on (ADR-805, ADR-918), in the order they had here. Search them by number (`grep -rn "ADR-623 " DECISIONS.md docs/history/`).


### ADR-953 · 2026-11-10 · accepted — The track's rows: the player's words, one an event (R64b, R62-N2)
- **Told by its note** (`TOLD_KINDS`, `toldByNote` in `src/sim/track.ts`): only an event the game tells no other way:
  a transfer, an occupation, a pocket or an evacuation (`withdraw`), an arrival (`forces`), a seat moved, a rename;
  226 notes of the 505 events (249 of those kinds, 23 a day's repeat). A war, peace, annexation, birth, release, join, leave, pact or strike is told by the
  game's own row ("Austria was annexed by Germany"), its name in the "Next" line before it ("Next, 12 March 1938:
  The Anschluss"). R62j1 (ADR-946) told every note, and so twice those.
- **The steering's notes** (`hold`, `objective`, `buff`, `redeploy`: "the timeline's stages", "Rotterdam") are never
  rows nor the "Next" line: they are the builder's.
- **Once a day:** of a day's told notes, one that begins as another, or that another begins as, is told once (a pocket
  and its stage, "The Vistula-Oder; Budapest besieged" and "…: the Germans fall back"). India's rename now reads
  "British India becomes India".
- **Measured:** `tests/unit/trackTold1938h.test.ts` (no steering note, no "timeline" or "stage", no same-day pair,
  the critic's three doubles gone); `tests/e2e/trackView1938h.spec.ts` (the Anschluss told by the game's row, the
  first day's occupation by its note; `docs/evidence/R62j/` shot again).

### ADR-952 · 2026-11-10 · accepted — What ends the replay said before; its end in the ticker (R64a, R62-N1)
- **Said before:** while the track runs, the scenario's form ("Taking a nation, a God Mode act or an editor edit ends
  the replay"), a red note under Take control (and its tooltip), and a line on the God Mode bar and at the editor's head
  ("Any act here ends the replay of history"). Not a confirm: the act is one click by design, and a confirm on every
  God tool would stand in the way of a game that has left the track; the notes go when it ends.
- **Told after:** `TrackEnded` is a ticker kind (its sentence by why, as in History; placed at the world's middle; the
  "return" cue, the world free).
- **Measured:** `tests/e2e/trackView1938h.spec.ts` ("what ends the replay…"): the four notes, Take control ends it,
  the ticker's row, the notes and the "Next" line gone. Screenshots: `docs/evidence/R64/`.

### ADR-951 · 2026-11-10 · accepted — The track's objectives taken as threatened (R63)
- **The cause** (`.cache/probe/r63a.ts`, the own seed, 6-22 June 1940): Germany's front sectors facing Paris (3.6-3.8°E,
  48.4-49.0°N, 8 cells out) had no threat and got no formation. The operational AI's allotment (PLAN 7.79b, threatened
  first, ADR-634) gives the threatened sectors every formation within their reach, the rest of the front what is
  left; with the Canadian and French remnants by Lille and in Burgundy to chase, nothing was left, and an objective's
  weight multiplied a pool of none. Not the Commonwealth's armies drawing the Germans south: their sectors were where
  the enemy stood.
- **The rule** (`src/sim/ai/operational.ts`): a sector within one of the track's objectives that has begun is taken as
  threatened (at least THREAT_UNIT), weighed by the objective as before. The timeline names that land to be taken,
  defended or not. `objectiveWeight` is 1 in every other world, so no other game changes (seed 99's pin unchanged).
- **Measured:** Paris taken by the fighting on 10-14 June on all 6 seeds (the own seed 14 June, as history had it;
  before 23 June on 3 of them), 739-932 French cells taken by 22 June (543-700 before). R62g1's bar restored on the own
  seed ("before 22 June", ADR-949's re-scope undone). `historyMatch1938h` green to its last bar (the Axis 7,433 Soviet
  cells on 2 December 1941, the Soviet army 3.14M men on 1 November 1942); `historyTrack1938h` green, no warning on
  seeds 1-5; `chinaFront1938h`, `freeWorld1938h` green. Tick time: 2.10 against plain 1938's 2.42 ms a tick (2.143/2.061 and 2.332/2.498, swapped pairs), plain 1938's hash unchanged.
- Not a rule of every game: the empty land an army leaves behind while it chases remnants stays a question for the
  critic and the user, not changed here.

### ADR-950 · 2026-11-10 · accepted (the user's decision) — The historical track's bar is its own seed; other seeds warn
- **The user, 2026-11-10:** "let's do the middle ground, as I do see your point about the fragility" (every game of
  1938h plays seed 1938 until the track ends; the other seeds only show steering that holds by luck).
- **Decision.** `historyTrack1938h`: the scenario's own seed is the bar (nothing passed over, no line broken); seeds
  1-5 run in `npm run check:full` and print what the checker finds as `WARNING historyTrack` lines, failing only if the
  track does not reach its end. Each such line at a release's check:review becomes a ROADMAP item (PROMPT "RELEASES"
  3). `historyMatch1938h`'s bars were the own seed's already. R63's AT so: Paris on the own seed, the others a warning.
- **Consequences.** A rule change elsewhere that breaks the track on another seed no longer stops the gate; it shows at
  the next release. The own seed still stops it.

### ADR-949 · 2026-11-10 · accepted — No landings of the AI's own while the track steers; Paris by the armistice (R62l)
- **The user's decision** (2026-11-10, option b of ADR-947's blocker): keep the rule, re-scope the Paris bar.
- **The rule** (`src/sim/ai/invasion.ts`, `named`): while the historical track steers, `planLanding` and `planNormandy`
  pick a target only within an objective of the lander's that has begun (SPEC §7.7, "the invasion AI picks the named
  landings"); the ferry to a nation's own or an ally's front is as before. Seed 4: no Italian landing in Palestine,
  Israel born on its date.
- **The bar re-scoped** (`historyMatch1938h`, R62g1's): Paris German by the armistice (22 June 1940, read at the next
  midnight), from "taken by the fighting before 22 June"; the robust measure kept (≥ 500 French cells taken by the
  fighting on 22 June: 562 on the own seed). With the rule the Commonwealth's and the colonies' armies, which before
  were lost in landings on Germany's coast in 1939-40, ferry to France, and the front stops short of Paris on some
  seeds (own seed 23 June).
- **Measured:** `historyTrack1938h` green on all 6 seeds (seed 4's mark taken out); `historyMatch1938h` green to its
  last bar (the Axis 7,937 Soviet cells on 2 December 1941, the Soviet army 2.91M men on 1 November 1942);
  `chinaFront1938h`, `freeWorld1938h` green. Tick time: 15 years of the track against plain 1938 (seed 99), swapped
  pairs: 2.00 against 2.41 ms a tick (2.038/2.324, 1.962/2.504), plain 1938's hash unchanged; bar within 5 %. Seed 99's pin unchanged (the rule acts only while a track steers).
- **Left:** the operational AI does not take an undefended objective it does not border (the front 7 cells short of
  an empty Paris for two weeks): ROADMAP R63, a rule of every game, not the track's.
- R62k and R62l done; R62 done with its items.

### ADR-948 · 2026-11-10 · accepted — The historical track on the title screen (R62m)
- **The user's decision** (2026-11-10, "add the scenario to the game"): `1938h` is listed, its `hidden` out of its
  scenario file. Hidden since R62a until the track replayed its years (a "Historical" world that was plain 1938 would
  have been a feature faked); it now runs from 1938 to the Korean armistice. R62k's seed 4 (R62l) does not hold it back:
  the scenario's own seed, the one every game plays, is green.
- **The list:** 1938, then 1938 — Historical, then the random world (the registry's order). Its card: its own preview,
  its description, no seed field; Start opens `?scenario=1938h` with a seed for after it.
- **Measured:** `tests/unit/scenario1938h.test.ts` (listed second); `tests/e2e/scenario1938h.spec.ts` (the card, Start,
  the line under the date in the game); `tests/e2e/title.spec.ts`'s list of three (the random world third).
  Screenshots: `docs/evidence/R62m/`.

### ADR-947 · 2026-11-10 · accepted — The track's checker; seed 4's landing in Palestine (R62k)
- **The checker** (`tests/helpers/historyTrack.ts`), hour by hour from 1938 to the track's end on any seed:
  - *skip:* no event passed over but by rule, one that no longer applies on that seed (a party dead or not born, a
    war already joined, nothing to do: `BY_RULE`); on the scenario's own seed none at all;
  - *course:* no war declared and no peace made while the track runs but in an hour of a timeline event or with a
    party's death in that hour (the fighting's own);
  - *exit, realm, held:* `diploInvariants`' rules (ADR-803, its checks exported), `held` save a pair the timeline
    occupies at peace (an `occupy` by the holder of the owner's land: zones, armistice lines, Iceland, Iran).
- **Measured** (`tests/sweep/historyTrack1938h.test.ts`, 4-5 minutes a seed): green on the scenario's own seed and on
  seeds 1, 2, 3 and 5; a war set off by hand (Sweden on Switzerland) is found. On seeds 1 and 2 the Republic's
  annexation (event 18, 1 April 1939) is passed over by rule: the Nationalists had taken Spain in the fighting.
- **Seed 4 red:** on 29 August 1941 two Italian divisions land on Palestine's coast by a landing of the AI's own
  (`planLanding`: the nearest enemy port, no objective weighed), take Jerusalem, annex Palestine and hold it to 1948;
  Israel's birth (14 May 1948) is passed over (`NoCoreLand`). SPEC §7.7 says the invasion AI picks the named
  landings; `planNormandy` only weighs them (× OBJECTIVE_WEIGHT) and `planLanding` ignores them.
- **Tried, not taken:** while steered, a landing only within an objective of the lander's (`planLanding` and
  `planNormandy`). Seed 4 then green, but the Commonwealth's and the French colonies' armies, which before landed on
  Germany's coasts in 1939-40 (30-odd landings, lost), ferry to France by Nice instead; the German front stalls 7 cells
  from an empty Paris from 6 June, and Paris falls after 22 June (R62g1's bar, `historyMatch1938h`) on 3 of 6 seeds
  (own seed 23 June; before, 12-17 June on all 6). Bisected: the `planLanding` guard alone does both; Germany's
  invasion turns are the same. Retuned and not enough: Dunkirk's evacuation, Paris's objective to the armistice, a
  60 km objective on the city, no ferry to an ally's front while steered (own seed 19 June, seeds 2 and 4 still late).
  Left as R62l, a BLOCKERS entry; the rule not committed.
- **Tick time:** 15 years of the track against plain 1938 (seed 99), at once on separate P-cores and swapped: 1.87
  against 2.39 ms a tick (1.905/2.308, 1.832/2.465), the track's world 22 % cheaper (fewer wars of the AI's own). Bar:
  within 5 %.
- R62k open: its AT (green on all 6) waits on R62l.

### ADR-946 · 2026-11-10 · accepted — The player's view of the track (R62j1)
- **The line under the date:** while the track runs, the stats carry its next event that has a name (`trackNext`: its
  `note` and hour) and the bar draws "Next, 19 May 1938: Xuzhou" under the date, in a smaller type, of a fixed width
  (the bar is centred), a long name cut short and whole in its tooltip. It goes when the track ends.
- **The events by their names:** an event applied that has a `note` (429 of 505) logs a `TrackEvent` row (its number,
  the nation it names first, its place: its ring's middle, its point, else that nation's capital); the ticker and the
  History tell it by the note ("The Anschluss"), beside the sim's own rows of what it did ("Austria was annexed by
  Germany"): the name is history's, the row the game's.
- **Measured** (`tests/e2e/trackView1938h.spec.ts`, desktop 1400×800 and phone 390×844): the line names the Anschluss
  and its date, then the next after it; the ticker's row; the line gone after a God Mode act. Screenshots at world
  zoom: `docs/evidence/R62j/`.
- **R62j done** with its slices.

### ADR-945 · 2026-11-10 · accepted — The track ends at the first intervention (R62j0)
- **R62j split:** j0 the intervention's end (the sim and the History's row); j1 the player's view (the line under the
  date, the events' rows in the ticker by their historical names, the screenshots).
- **The rule:** the first command applied while the track runs ends it in that hour (`TrackEnd.intervention`), before
  the hour's events, and the world's streams are drawn again from the seed for after. Every command is an
  intervention: each is a God Mode act, an editor edit or the taking of a nation, and a player's own orders come only
  after a nation is taken. A command refused changed nothing and ends nothing. The app sends no command of its own
  (the taking of a nation is the player's click). The History's row: "History's course ended at your first
  intervention".
- **Measured** (`tests/unit/trackIntervention1938h.test.ts`): 13 kinds listed (taking a nation, rename, recolour,
  gold, a nation's AI, its nukes, a world setting, a formation set down, God's warhead, a forced war, a nation
  collapsed, the editor's paint, a city placed), each given 6 hours, 1, 30 and 365 days in: the track ends that hour
  by intervention, the seed is the one for after, no event fires to past the next one's hour; a refused command ends
  nothing.

### ADR-944 · 2026-11-10 · accepted — The world free after the track (R62i5)
- **Measured** (`tests/sweep/freeWorld1938h.test.ts`): the track's world stepped to 26 July 1953 and saved, then
  loaded with ten seeds for after it (`Track.afterSeed`, as a game of each seed sets it): the track ends on 27 July and
  the AI's first war of its own follows within 0-15 days on all ten (bar: within 5 years on most).
- **The burst after the end is the AI's opening, not a pent-up one:** wars declared by quarter over two years, three
  seeds each: from 1953 15-19 in the first quarter and 52-62 in all; an ordinary 1938 game from its start 12-13 and
  49-54. The same shape; the first quarter up to 40 % busier in a world of more nations. No rule changed.
- **A probe's trap:** `runMatch` runs to each map's date before its `until`, and the last map is the track's end; a
  save meant for before the end is stepped to its hour instead (the test's own run, and the early reading of ADR-939
  reseeded by hand after the end).
- **R62i done** with its slices i0-i5.

### ADR-943 · 2026-11-10 · accepted — The track's names and flags (R62i4)
- **`rename`**, a timeline kind: from its hour the nation bears the identity `as`, a tag whose `nation.<as>` name and
  flag it shows (`World.identities`, state, a section of its own only while there is one: older saves load, the pin
  unmoved). The worker names it by the identity after a God Mode name; the flags message carries the identities and
  the flag store flies the identity's flag. A rename is not a new nation: its wars, pacts and land stay.
- **The renames:** Siam Thailand (1939), the Italian Republic (1946), India (1947), Jordan (1949), the People's
  Republic of China (1 October 1949), the Republic of China on Taiwan (7 December 1949: the two Chinas named apart).
- **Flags:** `data/scenarios/1938h/flags.json`, the track's own nations' (Slovakia, Croatia, Vichy, the Social
  Republic, the two Germanies, the two Koreas, Israel, Pakistan, Indonesia, Vietnam) and its identities'; the flag
  store reads it after 1938's. Our own simplified designs. East Germany's arms are those of 1959, for a flag of its own
  (from 1949 to 1959 it flew the Federal Republic's). The cross-checks: a scenario's flags name its nations or the
  identities its timeline gives, and each identity has its flag.
- **Measured:** each nation of the track has a flag of its own (the store's pixels its spec's), a name and an
  adjective, as each identity has; no two nations share a colour; a rename kept in a save (the same hash after); the
  worker names a renamed nation by its identity; no event passed over to 1953.

### ADR-942 · 2026-11-10 · accepted — The Korean War to the armistice; Japan sovereign (R62i3)
- **The war:** North Korea's invasion (25 June 1950), held to the armistice; the United Nations' contingents by
  `join` (the United States, Britain with Canada, Australia, New Zealand and South Africa and without its other
  puppets, France and the Netherlands without their colonies, Turkey, Greece, Belgium, Luxembourg, the Philippines,
  Thailand, Colombia, Ethiopia); China's volunteers (19 October 1950). The fronts by stages of occupation: Seoul, the
  Pusan perimeter, Inchon (the North Korean army in the south lost), the Yalu, the Chinese offensives (Seoul lost
  again), Seoul retaken, the line of June 1951. The armistice (27 July 1953, the track's last day, hour 0): North
  Korea and China leave the war, and the line is drawn by `transfer` (a `leave` gives the occupations back).
- **Others:** Hungary sovereign (the Paris treaties, 15 September 1947: the Red Army's occupation had stood since
  1945); Somalia's trusteeship; Japan sovereign (28 April 1952, Okinawa American still); Eritrea federated with
  Ethiopia. Libya's independence (1951) has no nation of the scenario to be: it stays Italy's, held by Britain.
- **Measured** (`historyMatch1938h.test.ts`, to 29 July 1953): owners on 27 July 1953 99.78 % of land (bar 90 %),
  98.9 % of the moved land right, stray 0.13 %; control 98.8 % right, stray 0.13 %; on 28 July no war, the track
  ended, both Koreas living; no event passed over.

### ADR-941 · 2026-11-10 · accepted — The Chinese civil war (R62i2)
- **The events:** the Red Army out of Manchuria and Kwantung China's (May 1946), the Communists holding the north of
  it; the united front left and the civil war declared (26 June 1946), held between its stages; five stages, each the
  Nationalist armies in its ring taken and its land the Communists' (Liaoshen, Huaihai and Pingjin, the Yangtze, the
  northwest with Xinjiang joining, the south and southwest to Chengdu); Hainan (1 May 1950), then the Republic leaves
  the war (its fighting over; no peace was signed, so after 1953 the AI may take it up again or not); Tibet annexed
  (1951); the Sino-Soviet treaty (the People's Republic in the Soviet pact); Iceland's foreign troops gone.
- **Two kinds:** `guarantee` with `end` withdraws a pledge (the Soviet Union's of the Republic, 2 October 1949: a
  guarantor joins wars against its target once the AI is free, and it was the scenario's of 1938); `capital` makes
  the nation's own city nearest a place its seat (Beijing on 1 October 1949, Taipei on 7 December; a capital held by
  an enemy at war moves again at once, as any captured one).
- **Transfers, not occupation:** a stage takes the land outright, so no nation stands at war with all its land held
  (which capitulates it, annexed: Manchukuo's and Hungary's lesson).
- **Measured** (`historyMatch1938h.test.ts`, to 1 June 1951): owners on 1 January 1950 99.77 % of land (bar 90 %),
  98.7 % of the moved land right, stray 0.13 %; control 98.4 % right; the seats at Beijing and Taipei; no war between
  the two Chinas and no pledge to the Republic on 1 June 1950; no event passed over. Unit tests of both kinds.

### ADR-940 · 2026-11-10 · accepted — 1946-49 on the historical track (R62i1)
- **The events:** southern Sakhalin and the Kurils Soviet; Syria, Transjordan, Lebanon and the Philippines released;
  the Soviet and British armies out of Iran; India released and Pakistan born from it (the west with Kashmir as the
  ceasefire of 1949 left it, then East Bengal); Burma and Ceylon released; Israel born from Palestine, the West Bank
  Transjordan's and Gaza Egypt's as the armistice left them, the Arab states' war (Egypt, Transjordan, Syria, Iraq,
  Lebanon) held on those lines and left by each on its armistice's date; the two Koreas born from Japan's Korea on
  either side of the 38th parallel; the Federal Republic born from the three western zones (the Saar French), the
  Democratic Republic from the Soviet one; Indonesia born from the Indies (New Guinea Dutch still).
- **Lines, not fighting:** a state born takes its land as history drew it; its wars (Israel's, Kashmir's) are held on
  those lines. The Indonesian and Indochinese wars of independence are not played: the first ends in a transfer, the
  second lies past 1953's end in its outcome (1954).
- **Measured** (`historyMatch1938h.test.ts`, run to 2 January 1950): the new states living, Palestine dead, the Indies
  Dutch New Guinea; no war on 1 January 1950; no event passed over. The run's timeout raised to an hour (it took 3
  minutes).

### ADR-939 · 2026-11-10 · accepted — R62i in slices; the war's loose ends (R62i0)
- **R62i split** as R62g and R62h were: i0 the war's loose ends; i1 1946-49 (the Philippines, India and Pakistan,
  Burma, Ceylon, Israel and its war, Indonesia, the two Germanies, the two Koreas); i2 the Chinese civil war to the
  People's Republic and the Republic on Taiwan, the map of 1 January 1950; i3 the Korean War to the armistice, Japan's
  sovereignty, the map of 27 July 1953; i4 the new nations' names, colours and flags (Slovakia, Croatia, Vichy and the
  Social Republic too), renames as state; i5 the world free after the last event (10 seeds loaded from 1953). The bars
  are R62i's, each in its slice.
- **Measured what the maps do not** (October 1945): no war left; the Axis pact alive under Italy with Japan, Hungary,
  Romania, Bulgaria and Thailand in it; Germany's 2 ships Soviet by the annex; no warheads anywhere.
- **The Axis pact:** each member leaves on the day it changes sides (Italy 8 September 1943, Romania, Bulgaria,
  Hungary, Thailand on 16 August 1945); with Japan alone in it, it dissolves.
- **`withdraw` with `fleets`:** the nation's ships and air wings go too, wherever they are (a ring holds land cells
  only). Germany's and Japan's surrenders take theirs.
- **Measured** (`historyMatch1938h.test.ts`): on 26 October 1945 no Axis pact; Japan with no ships or wings on 3
  September; the Soviet ships and wings the same on 9 May as on 7 May 1945. A unit test of `fleets`.

### ADR-938 · 2026-11-10 · accepted — The Pacific's end and Japan's surrender (R62h3)
- **`nuke`**, a timeline kind: a fission warhead of the nation's bursts at its place on its hour (`detonate`, its
  effects a launch's), with no stockpile, bomber or toggle asked. The AI strikes nothing while the track steers
  (`world.steered`, R62e), so the timeline's are the only strikes: Hiroshima (6 August 1945, hour 8) and Nagasaki (9
  August, hour 11), the United States'.
- **The events:** Okinawa; the Soviet Union at war with Japan (8 August, the front held to the surrender); Manchukuo
  and Mengjiang dissolved into China on 18 August, their armies gone, before the Red Army holds Manchuria, Inner
  Mongolia's north and Korea to the 38th parallel (20 August: a nation at war with its land all held capitulates and
  is annexed, and the Soviet Union took Manchukuo so); the Kwantung Army taken; southern Sakhalin, the Kurils.
- **The surrender (2 September):** Japan's forces disarmed (`withdraw` `captured`, Asia and the Pacific); Japan leaves
  its wars against Britain, the Soviet Union and China (the other foes stood in those wars: a `leave` against each
  was passed over), which gives back the land each side held of the other; Malaya, Sarawak and the Netherlands Indies
  born again (Japan had annexed them at their fall) and their overlords' puppets again; Indochina its own; Japan and
  Okinawa held by the United States, Manchuria, Kwantung, northern Korea, southern Sakhalin and the Kurils by the Soviet
  Union; Korea's south by the United States (8 September); Taiwan China's (25 October). The China front held to the
  surrender. Korea, the Indies' independence and the occupations' end are R62i's.
- **Measured** (`historyMatch1938h.test.ts`), 26 October 1945: owners 99.85 %, 97.2 % right, stray 0.08 %; control
  99.73 %, 97.2 % right, stray 0.13 %; two warheads burst, the scripted ones; Japan at war with no one; no event passed
  over.

### ADR-937 · 2026-11-10 · accepted — D-Day to Germany's surrender (R62h2)
- **The West:** the fronts against Germany held from D-Day to 9 May 1945 and moved by the timeline: the Normandy
  beachhead, Paris (25 August), Belgium and Luxembourg born again from Germany's land, Vichy's last colonies France's
  puppets, France freed (15 September, the Provisional Government taking Vichy's land), Alsace and Lorraine.
- **Italy:** to the Gothic line; the north freed on 25 April (the Social Republic ends); Istria and Trieste Italian
  until the treaty.
- **The East:** two stages (31 August 1944: Bagration, Lvov-Sandomierz, Romania; 31 January 1945: the Vistula-Oder,
  Budapest besieged); Romania's and Bulgaria's coups (`leave`, then `join` beside the Soviet Union, a hold on their new
  fronts); Finland's armistice and Petsamo; Bessarabia Soviet again; Greece and Albania born again; Memel and
  Königsberg Soviet; Northern Transylvania back to Romania; Hungary's armistice (20 January 1945) then Hungary held by
  the Red Army at peace: at war, its land all held, it capitulated and was annexed by the Soviet Union.
- **The surrender (5–8 May):** Denmark released; the Netherlands (with Suriname, Curaçao and Aruba), Norway (with
  Svalbard), Poland between the Curzon line and the Oder-Neisse, Czechoslovakia and Yugoslavia born again; Austria born
  and held in four zones; Carpatho-Ukraine Soviet in fact; Slovakia annexed by Czechoslovakia; the Wehrmacht taken (a
  `withdraw` with `captured`: `annex` hands the target's formations and puppets to the annexer, and the Soviet army
  rose by 0.7M with them); Germany's zones by `transfer` to the four powers, what is left (between the zones and the
  Oder) annexed by the Soviet Union. A zone is a transfer for now; R62i decides the occupation's form.
- **Asia:** Ichigo's later stages (Changsha, Guilin), Sansapor, Guam, Leyte, Manila (the Commonwealth restored, Japan
  holding the north of Luzon and Mindanao), Mandalay and Rangoon (Burma born again, Britain's puppet). Saipan,
  Tinian and Iwo Jima have no land cell at the map's size: no event.
- **Measured** (`historyMatch1938h.test.ts`), 1 June 1945: owners 99.84 %, 96.9 % right, stray 0.09 %; control 99.51 %,
  95.7 % right, stray 0.28 %; Germany, Vichy, the Social Republic, Slovakia and Croatia dead and the restored states
  living; no event passed over.

### ADR-936 · 2026-11-10 · accepted — November 1942 to June 1944 (R62h1)
- **The Eastern Front** by stages both ways, each a line on its date: the Soviet Union takes back what is east of it
  (the Germans there falling back) and the Axis takes what is west (the Soviet armies there taken): 31 December 1942
  (Uranus and Little Saturn; the Sixth Army and the Romanians at Stalingrad taken that day, a month before their
  surrender), 31 March 1943 (the Caucasus left, Kharkov retaken by the Germans; the Kuban bridgehead held), 31 August
  1943 (Kursk to Taganrog, east only), 31 December 1943 (Smolensk, the Dnieper, Kiev), 31 May 1944 (Leningrad freed,
  Ukraine, Odessa, the Crimea). Soviet arrivals every other month.
- **Africa and France:** El Alamein (Egypt cleared), Torch (Morocco and Algeria held by the Allies, then Algeria
  France's and Morocco and West Africa its puppets), Case Anton (all of Vichy's France held by Germany, Italy's zone
  and Corsica Italy's), France back at war (held against Germany to D-Day), Tunisia held by the Axis at peace then
  taken with its army (13 May 1943, Tunisia France's puppet), Libya held by Britain. Italy held against the Allies
  between the stages.
- **Italy:** Sicily; the armistice (`leave` against Britain, the United States and the Soviet Union); Germany taking
  Italy's Balkans, Greece, the Adriatic coast and Italy's zone of France; the Italian Social Republic born north of
  the Gustav line and Germany's puppet; the Kingdom at war with Germany (held); Rome on 4 June 1944. The armistice's
  `leave` gives back the land each side held of the other, so Libya, Eritrea and Somalia are held by Britain again
  the hour after; Sicily is the Kingdom's (as from February 1944).
- **The Pacific and China:** Buna and Gona, the Aleutians, Lae and Salamaua retaken; Hollandia; Ichigo's first stage
  (Henan). The China hold now runs to Japan's surrender, Ichigo by stages.
- **Measured** (`historyMatch1938h.test.ts`), 5 June 1944: owners 99.81 %, 97.4 % right, stray 0.08 %; control
  99.40 %, the land moved 95.5 % right (43,173 cells), stray 0.29 %; no event passed over.

### ADR-935 · 2026-11-10 · accepted — 1942, the fronts held between their stages (R62h0)
- **The events:** the Moscow counter-offensive (the Soviet Union taking back its land east of the January 1942 line,
  the Germans there falling back; Kerch), the Axis lines of 24 July (Kharkov, Sevastopol, Case Blue to the Don), 25
  August (to Stalingrad and the Caucasus) and 31 October 1942 (Stalingrad, Nalchik), each with its pockets; Japan's
  conquests by stages (Rabaul, British Borneo, Malaya and Singapore, the Indies, the Philippines, Burma, the
  Aleutians, northern New Guinea), the armies in each taken or, from Burma, back to India; the Afrika Korps and Rommel
  to El Alamein (Egypt's west held at peace: Egypt is not at war).
- **Holds, the fronts between their stages:** run without them, Germany's army fell from 1.26M to 77k by October 1942
  and Italy's from 644k to 87k against a Soviet army rebuilt to 2.5M, Britain's landings took 2,959 German cells and
  the Allies' Japanese islands. The fronts move by the stages alone, so the fighting between them only spent the
  armies. Held now: the Eastern Front (Germany, Italy, Romania, Hungary against the Soviet Union, from 1 December 1941
  to 9 May 1945), Germany against Britain and against the United States on land to D-Day, Japan against the United
  States and Britain from 22 July 1942, Japan against India and Burma to Imphal. Ships and aircraft fight on.
- **The Soviet army:** with arrivals (30 rifle divisions a month, 30 behind Stalingrad from August) it rose to 2.5M
  and fell to 1.58M by November: more divisions than its books carry are disbanded (the economic AI's step 1). With
  "the war economy and Lend-Lease" (+100 % income from 15 December 1941) it is 3.47M on 1 November 1942.
- **Measured** (`historyMatch1938h.test.ts`), 1 November 1942: owners 99.81 %, 97.9 % right, stray 0.08 %; control
  99.41 %, the land moved 95.3 % right (51,189 cells), stray 0.21 %; the Soviet army 3.47M; no event passed over.
  `withdraw` is applied however many it finds (an empty pocket is no event passed over).

### ADR-934 · 2026-11-10 · accepted — the Pacific opening (R62g4); R62g done
- **The events:** Japan's war on the United States (Pearl Harbor, 7 December 1941, its puppets and the Philippines
  with the sides), Britain and its Empire (Ireland and Egypt neutral) and the Netherlands Indies joining on 8
  December; Germany and Italy's own war on the United States on 11 December (a war of its own: `join` refuses a
  nation already at war with one of the other side, and Germany is at war with Britain), Romania, Hungary and
  Bulgaria joining it; Thailand into the Axis alliance (21 December); Guam, Kuching, Hong Kong, northern Malaya, northern
  Luzon and Davao by stages on their dates, objectives Singapore, Manila and Hong Kong for the fighting between.
- **Measured** (`historyMatch1938h.test.ts`): at the end of 11 December 1941 fifteen pairs at war or at peace as
  history had them (Japan with the United States, Britain, Australia, the Indies, China and the Philippines; Germany
  and Italy with the United States; Japan not with the Soviet Union; Ireland, Denmark and Thailand out); no event
  passed over to 1 January 1942. The Pacific's land is measured from R62h's first map.
- **R62g** (1940-41) is done with its five slices (ADR-930-934).

### ADR-933 · 2026-11-10 · accepted — Barbarossa by its stages (R62g3)
- **Measured first:** on 21 June 1941 Germany had 1.55M men, 1.2M of them in France, and the Soviet Union 930k, flat
  since December 1940 with a pool of 4.9M and 6,142 gold unspent. With 75 % of the army moved east (`redeploy`, 1
  March), the western districts' arrivals (50 rifle divisions on 1 June), the mobilisation's (15 a month), +100-300 %
  attack and the campaign's objectives (Minsk, Smolensk, Leningrad, Kiev, Kharkov, the Crimea, Rostov, Moscow), the
  Axis held 1-2,789 Soviet cells of 170,606 on 1 December; with the Soviet arrivals Germany's army fell to 733k. The
  fighting does not make Barbarossa, as it did not make the fall of France without a lever (ADR-931).
- **So by stages, as China (ADR-930):** the Axis lines of 10 July, 20 August, 30 September and 1 December 1941, each
  on its date an `occupy` of the Soviet land west of it, the Soviet formations there taken first (`withdraw` with
  `captured`, new: the men lost, the great pockets). The fighting fills the time between. Finland's front is held
  from its entry (the Soviets had overrun northern Finland by September without it) and its advance a stage (Karelia
  and East Karelia to the Svir, 1 September). Bessarabia back to Romania (26 July). Japan in all of Indochina from
  July 1941.
- **The bar:** the item's (control ≥ 75 % of land, the land moved in control ≥ 75 % right, stray < 2 %) passes on the
  failed invasion too (78.4 %), so the test also reads the Axis's Soviet cells after the last stage (≥ 6,000). The
  1 December map's line is drawn on its own, not from the stages' lines.
- **Measured** (`historyMatch1938h.test.ts`), 1 December 1941: owners 99.84 %, 97.5 % right, stray 0.06 %; control
  99.45 %, the land moved 94.9 % right (40,558 cells), stray 0.22 %; 7,599 Soviet cells held by the Axis; no event
  passed over.
- **Left, for R62h:** the Soviet army is 498k on 1 December (history about 4M): the Moscow counter-offensive and 1942
  will need the Soviet Union's mobilisation as arrivals, and the stages' pattern for the fronts the fighting cannot
  move.

### ADR-932 · 2026-11-10 · accepted — 1940-41 from the Baltics to Iran (R62g2)
- **The events:** the Baltic states annexed (3-6 August 1940); the Second Vienna Award and Southern Dobruja; Japan in
  northern (September 1940) and southern Indochina (July 1941), occupations at peace of Vichy's colony; Hungary,
  Romania (leaving the Little Entente first), Slovakia and Bulgaria into the Axis alliance (the start's Anti-Comintern
  one, which already holds Germany, Italy and Japan); Italy on Greece; Yugoslavia and Greece invaded (German arrivals
  in Bulgaria and Styria, objectives Belgrade, Salonika, Athens), Croatia born and Germany's puppet, the partitions
  (Slovenia, Dalmatia, Montenegro, Kosovo, Bačka, Macedonia, Thrace, Salonika), Serbia annexed by Germany and Greece by
  Italy at their capitulations (ADR-931's convention), Crete to Germany on 1 June; the Anglo-Iraqi war and its
  armistice; Ethiopia restored (5 May 1941) and Eritrea and Somalia held by Britain; Syria and Lebanon invaded and,
  at the armistice of Acre, Free France's; Iran invaded and its zones held at peace.
- **Holds:** Italy against the Sudan and Kenya to May 1943 (Italy had taken 2,084 Sudanese cells by January 1941,
  history only Kassala); Germany against Britain on land from 25 June 1940 to Rommel's offensive of 21 January 1942
  (Britain's invasion AI landed in northern Norway, 765 German cells by June 1941, and Germany on Svalbard; the
  evacuations tried for it found no army to move and were dropped). North Africa is Italy against Britain until then.
- **New:** `withdraw` (a nation's land formations in a ring leave, their men back to its pool), `occupy` by an owner
  of its own land (its control taken back), `born` of a dead nation (a revival: Ethiopia).
- **Measured** (`historyMatch1938h.test.ts`), 1 June 1941: owners 99.83 %, the land moved 97.4 % right (26,159
  cells), stray 0.06 %; control 99.65 %, 96.7 % right (30,291), stray 0.19 %; no event passed over to October 1941.
  Left: Indian divisions hold 354 cells of Italy's Somalia and Eritrea that the map gives Britain (a puppet's
  conquest; the map names one holder); the Tonkin rings (176); the demarcation line (149).

### ADR-931 · 2026-11-10 · accepted — the West in 1940 (R62g1)
- **The convention for a nation overrun:** annexed at its capitulation, its land the conqueror's (as Poland's in
  1939), its colonies released first (the Indies, the Congo) or handed to the Allies (the Dutch Americas, Svalbard);
  brought back by the timeline when it was freed (R62h-i, `reviveNation` or `born`). Luxembourg (10 May), the
  Netherlands (15 May), Belgium (28 May), Norway (10 June). Denmark a protectorate (Germany's puppet, Iceland released
  first, then held by Britain at peace), kept out of Germany's wars by `without`.
- **France:** Alsace-Lorraine to Germany; the French State born on metropolitan France and Algeria; Germany holding
  the occupied zone at peace (`occupy`, held across the month's start); the colonies but Equatorial Africa Vichy's
  puppets and out of the war by `leave` (new: nations leave their wars against a foe, the land each side held going
  back as at a white peace). France itself, left with its scraps overseas, leaves the war: Free France's war resumes
  in 1944 (R62h). Italy joins on 10 June; the Baltic states occupied (17 June, annexed in August, R62g2) and
  Bessarabia ceded (28 June), moved here from R62g2 to stand on the 1 July map.
- **Why Germany could not take France, measured:** on 9 May 1940, 927k of Germany's 1.4M men stood idle in Poland,
  where the Polish campaign left them: the operational AI does not move armies between fronts, and through the Phoney
  War's hold Germany had no foe to plan against. Keeping held foes in the plans moved nothing (812k still in Poland)
  and was reverted. With 500k in the West, Germany held no French cell by 21 June at any buff to +300 %, France
  holding 150-660 German ones.
- **`redeploy`** (new): of a nation's land formations in a ring, a share marched to places by player's orders (the AI
  leaves each alone until it arrives): 85 % of the army in Poland to the Rhine on 15 November 1939, 1.23M in the West
  by 9 May. With it and "the armour massed" (+200 % attack, 10 May-25 June) and objectives (Rotterdam, Brussels,
  Dunkirk, Paris from 25 May), Germany holds 648 French cells on 22 June and Paris from 14 June.
- **Paris is chaotic:** of five settings near this one, two leave Paris French on 22 June while the land taken stays
  638-697 cells. The test reads both: Paris before the armistice's hour (the item's bar; a later rule may flip it
  without a defect), and ≥ 500 French cells held on 22 June (the robust one).
- **Measured** (`historyMatch1938h.test.ts`), 1 July 1940: owners 99.90 % of land, the land moved 98.0 % right
  (20,191 cells), stray 0.04 %; control 99.78 %, 97.3 % right, stray 0.12 %; no event passed over. Left: Italy takes
  Kassala's corner of Sudan (113 cells), as Italy did in July 1940; the demarcation line's split departments (149).

### ADR-930 · 2026-11-10 · accepted — what 1938-39 left, and control measured (R62g0)
- **China by stages, not by fighting.** The front with Nationalist China is held from the start (ADR-929's hold of
  November 1938 moved to 1 January 1938), and Japan's gains are `occupy` rings on their dates: North China and
  Shanghai-Nanjing at the start (taken in 1937), Xuzhou (19 May 1938), Canton (21 October), Wuhan (25 October).
  ADR-929's Japanese and Chinese arrivals and the Wuhan and Canton objectives are gone: before the hold, China took
  1,090 cells of Manchukuo in 1938 (control, which the owners' maps did not see), and the arrivals only moved which
  army melted. Japan holds 15.2 % of China from November 1938, unmoved a year on; without the holds 37.4 %, China's
  army 15k and the Communists dead.
- **A hold holds puppets** (`Track.held` reads `overlord`): a side's nations and theirs. Land only: ships and aircraft
  fight on (combat.ts is land combat; naval and air combat are not gated).
- **The Phoney War** as a hold of Germany against France and Britain (with their empires) from 3 September 1939 to 10
  May 1940. Measured without it: Germany held 1,525 French cells and Australia 331 German ones by 9 May 1940; with it,
  one cell. Not a hold by place: Norway's fighting (from 9 April) is Germany against Norway, and the Anglo-German land
  fighting there held to 10 May is the one cost, smaller than a ring on every hold (R62g0's item had asked for one).
- **The Winter War ends:** a white peace on 13 March 1940 and Karelia (the Isthmus, Viipuri, north of Ladoga) ceded.
- **Control measured.** A map's `occupied` (who held what on the date, where not its owner; admin codes and rings,
  each map's own) gives `historyMatch` the same three columns for control. 1 October 1939, Japan's occupation drawn
  from provinces (Beijing, Tianjin, Hebei, Shandong, Shanghai, Jiangsu) and six rings of its own: whole 99.91 %, the
  land whose holder moved 95.3 % right, stray 0.05 %. The bars (`historyMatch1938h.test.ts`): ≥ 90 % right and < 0.5 %
  stray for control; the owners' bars as before.
- **Seen, for R62g3:** with no fighting China's army falls 771k to 402k in a year and the Soviet Union's 1.55M to 0.93M
  in March-May 1940: armies the books do not carry, disbanded (the economic AI's step 1, a rule of every world).
  Barbarossa will need the Soviet Union's and Germany's armies of June 1941.

### ADR-929 · 2026-11-10 · accepted — the China front held (R62f2)
- **Why the armies melt** (a probe of the economic AI's refills, step 3a, on the empty timeline): Japan's refills are
  bounded by gold, its treasury spent on new orders to under the reserve of three months' income (340 against
  2,481), and China's by its books, the army's upkeep over its war share of income and the balance below need. So
  neither refills while its pool grows. A rule of every world; not changed here.
- **The lever, `hold`** (`timeline.json`, `Track.held`, `World.holds`): from its hour to its date two sides stay at war
  and do not fight: no pairing in combat (`combat.ts`), no land taken across (`territory.ts`), no foe in the
  operational AI's plans (`foesOf`). False in every world without a track and in a track without holds: the pin
  unmoved. The track does not end the war (the wars of its timeline end by its events), and land may still change
  by the timeline's own events.
- **1938-39:** the Communists' base held against Japan, Manchukuo and Mengjiang from the start to 1945; Japanese
  arrivals of 4 square divisions every two months to October 1938; the front with Nationalist China held from 1
  November 1938 (after Wuhan and Canton) to the Ichigo offensive (17 April 1944); Chinese arrivals of 10 light
  divisions every quarter from November 1938.
- **Measured** (`tests/sweep/chinaFront1938h.test.ts`, one save at 1 November 1938, a year each way): held, Japan
  holds 1.1 % of China as at the start, China's army 203k to 459k, the Communists and Manchukuo living; without the
  hold, 18.3 %, China's army 88k, the Communists dead. R62f's run: 100.00 / 99.99 / 99.98 % of land, stray 0.00 %,
  no event passed over.
- **Left:** Japan holds 1 % of China in November 1938 where history had about a fifth (the coast, the Yangtze to Wuhan,
  Canton): its arrivals and objectives took the cities but not the land between. The maps measure owners, not
  occupation, so the bar does not see it; more arrivals (6-8 a time) reached 9-12 % by May and 19-28 % by November
  only by destroying China's army before the hold. A front's occupation, measured, is R62k's (the checker).

### ADR-928 · 2026-11-10 · accepted (its re-scope the user's decision, 2026-11-10) — 1938-39 on the track, measured (R62f)
- **The period** (`data/scenarios/1938h/timeline.json`, 32 events, our own summary of public history): the
  Anschluss; the Sudetenland (1 October 1938), Zaolzie, the First Vienna Award; Slovakia born and Germany's puppet,
  Carpatho-Ukraine to Hungary, the Protectorate (Czechoslovakia annexed), Memel; the end of the Spanish war (the
  Republic annexed, 1 April 1939); Albania annexed; Nomonhan (Mongolia and Manchukuo alone, a white peace on 16
  September); Danzig; Germany and Slovakia on Poland, Britain (Ireland and Egypt neutral, `without`) and France joining,
  the Soviet Union's war on Poland, the partition on the line of 28 September, Poland's remnant annexed; Vilnius to
  Lithuania; the Baltic bases as Soviet guarantees; the Winter War. Objectives: Wuhan and Canton (Japan), Warsaw
  (Germany), Lwów and Viipuri (the Soviet Union). The pact of August 1939 and the Anti-Comintern joins have no event:
  no land or war of theirs, and an alliance would call members into wars the timeline names itself.
- **Two kinds for the fighting** (SPEC §7.7, "historical arrivals of forces and phase buffs"): `buff` (God Mode's
  `grantBuff`, named "History's course", until a date) and `forces` (formations of a template set down at a place, God
  Mode's spawn). Neither is used in 1938-39 (see below). `without` on `war` and `join`: puppets left neutral.
- **The measure.** The timeline's `maps` (the land on 1 October 1938, 1 April and 1 October 1939: admin-0 and admin-1
  codes, rings only where a border cuts a province, drawn on their own and not from the events' rings) laid over the
  start's owners; `tools/diag/historyMatch.ts` gives three columns a date: all land owned as on the map; the land the
  map moved since the start, the share moved so; the land the world moved and the map did not. The whole-land share
  alone says little (an empty timeline scores 98.8 %): the moved and stray columns carry it.
- **Measured:** 100.00 / 98.81 / 98.79 % of all land; moved 97.6 / 98.1 / 97.1 % right; stray 0 / 1.19 / 1.19 %, all
  China's conquest of Manchukuo and Mengjiang; events 15 and 21 (Nomonhan) passed over, Manchukuo dead. R62f's bar is
  not met (BLOCKERS); the item stays open and its cause is R62f2.
- **The re-scope, the user's decision** ("Lets go with your proposal", 2026-11-10): R62f's bar is the period's own
  events and land; the Nomonhan events and the China front's stray land are R62f2's (the China front's item), so the
  1938-39 data counts as done while the front is worked on. 1938h stays hidden: listed with events to 1939 only, it
  would be steered to 1953 with nothing to end its wars.
- **Not taken:** buffs or arrivals for Japan in this period: each tried flipped the front from Japan's collapse to
  China's (the Communists dead by 1939), worse for 1940-45 than the stray land; keeping an overrun nation alive while
  steered: it only hides the front in the owners column.

### ADR-927 · 2026-11-10 · accepted — The track's steering: the world's diplomacy off, objectives weighting plans (R62e)
- **Off while the track runs** (`World.steered`): the strategic AI whole (its wars, stalemate peaces, threat pacts,
  coalitions, rivals apart: it does nothing else); every peace of the war rules (capitulation, the longest war, no
  front, suing; the score and exhaustion are still reckoned); alliances breaking up; the puppets' month (drift,
  release, revolt, integration); revolts and kin unions, collapse, and so revival; the AI's nuclear decision. Not off:
  the fighting and what it does by itself, a nation with no land left is eliminated and what it occupied goes to its
  occupier (`NationEliminated`, `LandCeded`). The spec's list named "stalemate peace"; every rule-made peace is off
  because a capitulation or a frontless war's end is a peace history did not have on that day: the timeline's peace
  ends each war.
- **Objectives.** An `objective` (nation, at, km, until) weighs from its event to `until`: the operational AI's
  allotment (`allot`) weights the sectors within it OBJECTIVE_WEIGHT (6) times, threatened or not; the invasion AI's
  landing worth of a city within it the same. `World.objectiveWeight` is 1 in every other world, and the factor 1
  leaves the products bit-identical, so plain 1938 is unmoved. Objectives are derived from the timeline and the
  track's next event: no state of their own.
- **Consequences.** `trackSteering1938h.test.ts` (Germany on Poland, Warsaw within 300 km, from one save at t120 over 6
  days: 1.30M of 2.61M allotted near it with the objective, 0.58M of 2.60M without, 2.26×); a probe of 1938h, seeds
  1938 and 99, 2 years: no WarDeclared, PeaceSigned, alliance, puppet, revolt, union or nuclear row (plain 1938, seed
  1938: 48 wars, 43 peaces, 18 alliance joins, 12 puppets); the eliminations of the fighting (2 and 3) remain.

### ADR-926 · 2026-11-10 · accepted — Births, the track's last day and the second seed (R62d)
- **Birth.** A `born` event (nation, from, ring) brings an unborn nation of the scenario to life: the land of its ring
  as a transfer gives it (`LandCeded` rows), cores on the provinces whose centre it holds (their core nation becomes
  it), its seat the city of its own nearest its table's capital (none: `relocateCapital`), START_GOLD, the techs of the
  nation that gave most land (the nuclear aside, as a rebel's), the scenario's revivals; then `NationBorn`. One born
  already is passed over (`Alive`). Until its event, an unborn nation has no core, land or revival: no rule brings it.
- **The end.** `TimelineFile.end` (1953-07-27): after that day's first hour's events the track ends (`TrackEnded`,
  `TrackEnd.date`); a save of another timeline ends it the same way (`timelineChanged`); R62j adds the intervention.
- **The second seed.** `GameOptions.after` (`?after=`), rolled by the new-game form's Start (or by the game when the
  URL has none, then kept by the autosave's options), is kept in the track's section. At the end `world.seed` becomes
  it and `world.rng` is made anew from it, so every stream, hashed (`hash32(world.seed, …)`) or drawn, is derived from
  it. With none (0) the seed stays. Until the end, two games of the scenario differ in the track's section alone.
- **Readers outside the sim.** Continue loads the autosave's bytes (its track and seed with them). The settings show
  the world's seed: after the end, the second. A new game of the scenario always starts its own seed; the URL's
  `seed` and options other than `after` are ignored (ADR-923's R62a).
- **Consequences.** `trackBirth1938h.test.ts`; a probe (5 seeds × a year: no unborn nation alive on any day);
  `scenario1938h.spec.ts` (Start's URL carries `after`).

### ADR-925 · 2026-11-10 · accepted — The track's land: rings at the hour, a cession as land handed over (R62c)
- **Decision.** A `transfer` (to, from, ring) gives the land cells whose centre is inside the lon/lat ring and whose
  owner is one of `from` to `to`, owned and held (`setOwner`, `setController`), as `defect` hands land over: a
  `LandCeded` row for each nation that gave some, a capital in it moved (`relocateCapital`). An `occupy` (by, of,
  ring) sets the holder of those cells only. Rasterised at the event's hour by `forEachCellInRing`, the rule of
  `ownership.json`'s regions (one rule for the start's borders and history's), not baked: a ring is a few points and
  the map's size is the game's. Not through the editor's paint and its undo stack: an event is no edit. A ring that
  takes nothing is passed over (`TrackSkipped`, NoEffect).
- **Consequences.** `trackTerritory1938h.test.ts`. An occupation at peace stands (a probe: 127 of 127 cells held three
  days on); what ends one is the timeline's peace or transfer (R62f-i).

### ADR-924 · 2026-11-10 · accepted — The track's runner: its kinds, by tag, and a save of another timeline (R62b)
- **Context.** ADR-919 (amended) had every event go through `applyCommand`. Of R62b's kinds, a war of the timeline's
  sides has no command: `declareWar` and `forceWar` call in allies and guarantors and drop members by reach and bonds,
  so the sides would be the sim's, not history's; `forcePeace` settles on the score (no white peace); no command gives
  a guarantee; none adds a nation to a war that goes on.
- **Decision.** The kinds a command stands for go through `applyCommand` (annex, puppet, release, alliance join or
  leave; a join to a leader with no alliance makes one). A war of given sides (each leader's puppets with it), a join,
  a white peace (score set to 0, then the sim's `makePeace`: each keeps its own, a truce) and a guarantee are done in
  `src/sim/track.ts` with the war's and the alliances' own parts, with the rows a declaration has (`WarDeclared`,
  `WarJoined` with `JoinedBy.track`, `GuaranteeLapsed`). No command kind is added for the track: the player's API does
  not grow. Events name nations by tag, wars by two of their nations, an alliance by its leader, resolved at the
  event's hour. Each event due by the hour runs in file order right after the hour's commands (`step`), not when
  commands are applied while paused. One refused is passed over: `TrackSkipped` (its first nation, its number, why).
- **A save of another timeline.** The section `world.track` keeps the timeline's hash (canonical, key-sorted: not the
  file's bytes or line ends). A save whose hash is another's is loaded and the track ends at the next hour with a
  `TrackEnded` row (`TrackEnd.timelineChanged`); it does not throw. The timeline will change with R62f-i, each a push
  that deploys: a throw would leave every player's Continue unloadable; ending the track keeps the game, and says why.
- **Its records.** The timeline is validated with every data file by `data-schemas.test.ts` (not by `npm run data --
  --check`, which bakes; R62b's wording amended): date order, after the start, tags of the base's and its own tables.
  The track's own nations are `unborn` (state) until R62d: not in the dead list sent to the UI, so not offered to revive.
- **Consequences.** `trackRunner1938h.test.ts`, the data-schemas case. Plain 1938 has no track: its pin unmoved.

### ADR-923 · 2026-11-10 · accepted — 1938h hidden until its first period (R62a)
- **Context.** R62a's AT asked the title screen to list "1938 — Historical". With no timeline yet, the world it opens
  is plain 1938 under another name, and a push to `main` deploys.
- **Decision.** `hidden` in its `scenario.json` until R62f replays 1938-39; it opens by `?scenario=1938h` only.
  `scenario1938h.test.ts` asserts it hidden; R62f removes both.
- **Consequences.** R62a's AT amended (ROADMAP); no player meets a "Historical" world that is not one (PROMPT rule 6).

### ADR-922 · 2026-11-10 · accepted — History marks the rows that follow one of their hour (R60e)
- **Context.** Critic run 61, R61-N5: on 32019's 2 December 1957 History read "United States made peace with Free San
  Salvador", "Free San Salvador was annexed by United States", "Free San Salvador was destroyed": one hour (t174600),
  logged in that order and shown cause first (ADR-865), but in a list read newest first the peace stood above, "made
  after the nation was gone". Run 51 asked cause first (a release above its "left its war" rows); run 61 read it
  backwards. Both readings come from one list with two directions: newest first by hour, cause first within it.
- **Decision.** ADR-865's order stays. A row that follows the row above in its hour and names a nation the rows it
  follows name (`followsAbove`, `src/shared/history.ts`) is drawn under it: "↳" in the dates' column, its title "The same
  hour, following the row above". Rows of one hour naming no nation in common head their own group. The CSV and JSON are
  unchanged.
- **Not taken.** Reversing each hour (run 51's finding again); merging a peace with its annexation into one row as the
  ticker does (`tickerRows`): the type filter and the exports count each event.
- **Consequences.** `historyHourOrder` (the critic's hour: war, joined; peace, annexed, destroyed), `history1938` (the
  guarantors' rows under Germany's declaration, in the page).

### ADR-921 · 2026-11-10 · accepted — Those a voyage left at the port board first at the next (R59b)
- **Context.** Critic run 60, R60-N2: on 31127 (setup 15101, one group of 25,200 men) 272 reached Cardiff at t423 while
  the group was out, and was told "next voyage, about 4 days". The group came back at t510; 270 and 271, which reached
  the port after it, boarded first by id (two of about 12,200 each fill it), and 272 was left again, sailing at t626,
  8.5 days after its figure.
- **Decision.** At the sail hour a landing's divisions at its port board in `boardOrder`: those its voyages left first
  (`Landing.left`: the tick each stood at the port while the landing was at sea, or stayed there with no room as it
  sailed), the first left first, then the rest, each by id. `noRoom` and R57b's "room for all" check (ADR-909) use the
  same order. A division aboard or out of the landing leaves `left`. Saved as an optional section `world.landingLeft`
  (landing, division, tick), absent while empty, so older saves load and seed 99's pin, with no player landing, holds.
- **Stands on (ADR-803).** ADR-909 (a next voyage's room check, first fit as at the sail hour: the same order on both)
  and R37a/R38e's `NextVoyage` telling (unchanged); R44a's ready hour and R56a's due (unchanged: which divisions are
  waited for is not touched, only the order of those present). Player landings only.
- **Checker (ADR-804).** `landingInvariants`' `leftAgain`: at a sail hour, one that stood at the port while its landing
  was at sea, ashore again while one that did not boarded with room it would fit. Red on 31127 before (t510, 272 for
  270 and 271), 0 after.
- **Consequences.** 272 boards at t510 and its landing is over by t567.

### ADR-920 · 2026-11-10 · accepted (the user's decision) — No critic run before the historical track is built; Batch 14 before it
- **Context.** The user asked for the historical track (ADR-919) while Batch 14 (R59, R60: runs 60 and 61's
  non-blocking findings) was open, and said no critic run is to come before the track is implemented, the order of
  the two batches left to the loop.
- **Decision.** Batch 14 is done first (small items, already filed), then Batch 15 (R62, the historical track).
  Batch 14's end skips its critic run (PROMPT.md "Releases" step 1); the next critic run comes after Batch 15's last
  item and covers both batches, then the release as PROMPT.md says.
- **Consequences.** One critic run and one release for Batches 14 and 15. A user-asked feature joining a batch ahead
  of its critic run is the exception this ADR names, not a new rule.

### ADR-919 · 2026-11-10 · accepted (the user's decision) — The historical track: 1938–1953 replayed as history went
- **Context.** SPEC §1 named "historical railroading" a non-goal: the 1938 start was plausible and history then
  diverged freely. The user asked for a deterministic replay of history, as accurate as the sim allows, and answered
  the design's questions (2026-11-10).
- **Decision (the user's).**
  1. **What:** the real history of 1938–1953 played out in the sim from the 1938 start, the same track every run
     (not a playback of a recorded game).
  2. **How hard:** events and steered AI. Wars, peaces and their terms, annexations, puppets, releases, alliances,
     guarantees, transfers of territory and new nations fire on their dates; the AI's own war and peace choices,
     pacts, coalitions and rival drift are off while the track runs, and its offensives are aimed at each war's
     historical objectives. The fighting is still the sim's: a front may reach its objective days or weeks off
     history.
  3. **Span:** to the Korean armistice (27 July 1953), through the occupation of Germany and Japan, the two
     Germanies, the partition of India, Israel, the Chinese civil war and Korea; then the world runs free under the
     usual rules.
  4. **Nuclear weapons:** Hiroshima and Nagasaki are scripted; the AI's own nuclear decision is off until the track
     ends.
  5. **Intervention ends the track:** the first God Mode act, editor edit or taking of a nation stops it; the
     world is free from then on, and the History says so.
  6. **Entry:** a listed scenario of its own, "1938 — Historical", beside 1938 and Random; plain 1938 is unchanged.
- **Decision (the loop's, within the above).**
  - The track is data: a dated timeline (`data/scenarios/1938h/timeline.json`, our own summary of public history,
    in DATA_SOURCES.md). Its runner, a system right after the hour's commands, applies each due event through
    `applyCommand`, **not** through the command log (amended 2026-11-10, the advisor's review: the log is saved, hashed
    input, and a replay that fed logged track events would apply them twice). A run is reproduced by the timeline and
    the track's saved state (next event, running, the second seed, the timeline's hash), the log staying the player's
    input alone, which is how an intervention is told (R62j). Territory by lon/lat rings, as the 1938 ownership is
    drawn (`ownership.json`).
  - `1938h` is a scenario id of its own built from 1938's files, its new nations appended after 1938's 103 so every
    id of plain 1938 holds and its pin does not move (R62a).
  - "Deterministic": the scenario's seed is fixed and not offered on its form; a run is the same each time.
  - **Reseed at the end (the user's, 2026-11-10):** when the track ends, on 27 July 1953 or early at the first
    intervention, the world takes a second seed and every RNG stream is derived again from it (§2.6), so the free
    world after the track differs from run to run while the track itself does not. The second seed is rolled by
    the new-game form at the start (random once a visit, as the seed is; `?after=` in the URL) and kept in the
    state, so the reseed is part of the run and replays and loads like the rest. Two runs that differ only in it are equal in every
    section but the track's own until the end (the second seed is in that section from the start).
  - **How the land is matched:** by the scenario's own data, never by the shared rules. Borders that changed by
    treaty (Munich, the partitions, Vichy, the post-war borders) are transfers on their date and match by
    construction; land that changed by fighting is reached by steering: each war phase's objectives, dates and the
    historical arrivals of forces (formations placed, buffs for a phase) in the timeline, tuned by period
    (R62c–f) against `historyMatch`. No rule of plain 1938 or the random world changes for the track (ADR-803).
    A period whose bar steering cannot reach is a BLOCKERS entry and a question to the user, not a rule change.
  - Built as Batch 15 (R62, lettered parts) after Batch 14 (ADR-920).
- **Consequences.** SPEC §1's non-goal is narrowed: plain 1938 and the random world still diverge freely; the
  historical scenario does not until the track ends. SPEC §7.7 holds the design. The seed-99 pin of plain 1938 must
  not move for the track's sake beyond a state section it adds (logged in its own commit if so). Its rules join a
  checker run on several seeds (ADR-804).

### ADR-918 · 2026-11-10 · accepted (the user's decision) — The logs rotated at each release tag; the watch list and the diag tools out of the files read
- **Context.** Ten days of November made DECISIONS.md 279 KB (136 ADRs) and PROGRESS.md 206 KB: the month was too
  long a unit for files each session is told to read. BLOCKERS.md's watch list (550 of its 655 lines, mostly from
  October) was read with its open entries. The user asked what the files loaded for context could lose.
- **Decision.**
  1. DECISIONS.md and PROGRESS.md hold what came after the last release tag. In the tag's commit the rest moves to
     `docs/history/DECISIONS-<tag>.md` and `PROGRESS-<tag>.md`, as the batch's items move to `ROADMAP-<tag>.md`
     (PROMPT.md "Releases" step 4). November up to `release-2026-11-10` moved now; October's monthly files stay.
  2. The watch list moved to `docs/BLOCKERS_WATCH.md`, searched, not read.
  3. The `tools/diag/` commands moved from CLAUDE.md to `docs/TOOLS.md`.
- **Consequences.** A session reads a few KB of state instead of ~500 KB; an older ADR or log entry is found by
  search (`grep -rn "ADR-623 " DECISIONS.md docs/history/`), as ADR-805 already asked.
