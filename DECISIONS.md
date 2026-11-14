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

### ADR-1053 · 2026-11-14 · accepted — R80i: 1990-91 in the replay
- **Events** (`docs/research/1976-91.md`'s 1990-91 rows; 78): the Contras' end (Chamorro; `annex`); Namibia; Yemen
  united (`annex`, the research's FED); Iraq's war on Kuwait and its annexation, Desert Storm (the United States,
  Britain, France, Saudi Arabia, Egypt, Syria) and Kuwait born again on 1991-02-28; ECOMOG beside Liberia's
  government, the NPFL's Liberia but Monrovia, Doe's death; Germany united (`annex`, West Germany renamed Germany);
  the USC in Mogadishu, Somaliland apart; the RUF in Kailahun; Khost the mujahideen's; Eritrea the EPLF's and its war
  over; the Cubans out of Angola, Bicesse; Slovenia and Croatia born with their forces (`born`'s `forces`, ADR-1046),
  the Ten-Day War and Brioni, Croatia's war, Vukovar, the Krajina at Yugoslavia's side; the Warsaw Pact dissolved
  (`allianceEnd`, 1991-07-01); the Baltic three on the State Council's recognition (1991-09-06) and the other eleven
  successors on the union's end (1991-12-26, the track's date; the research's "Which of two dates": a declaration
  without the land's handover is not the land's change), Crimea Ukraine's, Transnistria, Nagorno-Karabakh and
  Chechnya apart; the Soviet Union renamed Russia (its arsenal its alone: answer 2); the CIS of the Alma-Ata Protocol
  as Russia's pact (`allianceJoin` after the end: a pact outside deterrence and aid, answer 3); the Kurds' north of
  Iraq (October, on its last day); Lebanon's Taif order, Haiti's coup, Gorbachev's resignation.
- **Left out:** the August coup (three days, no land), the Iraqi uprisings (crushed in a month), Comecon and South
  Africa's NPT accession (no rule they change), Georgia's April declaration (born with the union's end, as the rest).
- **Measured:** see ROADMAP R80i; nothing before 1990 moved.

### ADR-1052 · 2026-11-14 · accepted — R80h: 1986-89 in the replay
- **Events** (`docs/research/1976-91.md`'s 1986-89 rows; 45): Chad's Toyota War (Fada, then Faya-Largeau: the GUNT's
  north Chad's, the GUNT gone), the ceasefire with Libya on 1987-09-11 (Aouzou Libyan); the Soviet Union out of
  Afghanistan on 1989-02-15, the mujahideen and the government held after it; Vietnam out of Cambodia (Cambodia
  released, the Khmer Rouge and Cambodia held to Paris, 1991-10-23); al-Faw taken by Iran and retaken, the Iran-Iraq
  ceasefire (the old border); India's peacekeepers beside Sri Lanka against the Tigers (to 1990-03-24); Panama (a war
  held to 1990-01-31, a white peace and Endara's government: no occupation, as Grenada's); the NPFL born in Nimba; the
  Marshall Islands and Micronesia born (their cells Japan's since 1945 on the map: born from Japan's or the United
  States' land); the revolutions of 1989 as regimes, each member leaving the Eastern Bloc on the research's date
  (`allianceLeave`; East Germany's is the union, R80i); coups and changes in South Yemen, Uganda, the Philippines,
  Fiji, Burkina Faso, Tunisia, Pakistan (two), Burma, Paraguay, Sudan.
- **Measured:** see ROADMAP R80h; nothing before 1986 moved.

### ADR-1051 · 2026-11-14 · accepted — R80g: 1981-85 in the replay
- **Events** (`docs/research/1976-91.md`'s 1981-85 rows; 52): the FMLN (Chalatenango, Morazán), the Contras
  (Jinotega, Nueva Segovia), the SPLA (Jonglei, Upper Nile) and the Tigers (Jaffna, Kilinochchi, Mullaitivu) born at
  war with their governments, each front held to its history's end; the Falklands (occupied, retaken, a white peace);
  Sinai Egypt's in one step on 1982-04-25 (the research's choice); Khorramshahr and the rest of Khuzestan Iran's again;
  Israel into Lebanon (the south occupied, held), back to its security zone on 1985-06-10; Chad: Habré's regime in
  N'Djamena (FROLINAT's state), the GUNT born north of the 16th parallel with Libya (Chad's old tag, the identity
  GUNT), France beside Habré, held to 1987; Grenada (Bishop's fall, the United States' war, an interim government);
  the TRNC and Burkina Faso (renames); Belize, Antigua, St Kitts, Brunei; the Agacher Strip war; coups and returns to
  democracy in Egypt, Poland, Argentina, Nigeria (two), Uruguay, Brazil, Uganda.
- **Found:** the GUNT born by whole provinces left 68 cells off the map's 16th parallel; born by the parallel's ring.
  A state check read on its day's morning sees that day's peace not yet made: the Agacher peace of 30 December is
  read on the run's last world.
- **Measured:** see ROADMAP R80g; nothing before 1981 moved.

### ADR-1050 · 2026-11-14 · accepted — R80f: 1976-80 in the replay
- **Events** (`docs/research/1976-91.md`'s 1976-80 rows; 65): Angola (the MPLA and Cuba take Huambo, the FNLA annexed,
  South Africa out, UNITA held in Cuando Cubango to 1991-05-31); Vietnam one state (the NLF annexed); the Ogaden
  (Somalia's war, the Somali region taken and lost, Cuba beside Ethiopia, a white peace); the Egyptian-Libyan war;
  Uganda and Tanzania (Kagera taken and retaken, Tanzania in Uganda's south, Amin gone, a white peace); Vietnam into
  Cambodia (Cambodia born again of the Khmer Rouge's land as Vietnam's puppet, the Khmer Rouge on the Thai border,
  held to 1989-09-26); China into Vietnam (the border towns, a white peace on 1979-03-16); Iran's revolution, the Saur
  revolution, the Sandinistas, Zia, Thailand's, Mauritania's, Grenada's, South Korea's, Liberia's and Turkey's coups;
  the mujahideen born on the mountains and the Soviet army beside Afghanistan's government (held to 1989-02-15);
  Mauritania out of the Sahara, Morocco in its south; Zimbabwe (Southern Rhodesia renamed); Chad: FROLINAT's north held
  from the battle of N'Djamena, then the GUNT (FROLINAT annexing Chad's state, renamed Chad) with Libya's troops on
  1980-12-16; Iraq into Iran (Khuzestan's west occupied, held to 1988-08-20); nine island and small states born.
- **Found:** an occupation of all of Uganda took Kampala and ended its state, so the regime and the peace after it were
  passed over: Tanzania's occupation stops south of Kampala. FROLINAT's hold of 1968 ran out on 1979-03-23 and Chad's
  army annexed it: a hold from the battle of N'Djamena keeps the north to the GUNT's day.
- **Tools:** `historyMatch` takes `MATCH_FROM=<year>` (a yearly start; its track kept though its timeline differs);
  `tools/diag/provinces.ts` (a country's adm1 codes), `tools/diag/owners.ts` (who owns and holds a country at a start).
- **Measured:** see ROADMAP R80f; 1938-75 unchanged (no event before 1976 moved).

### ADR-1049 · 2026-11-14 · accepted — A stage's land: the taker's side keeps it, an owner of that side has it back
- **Found** (R80f's run of the replay checks): `historyTrack1938h` red on seed 1938 since R82b (ADR-1040), and the
  same two lines warned on seeds 1-5: "USA on VIC, 4 cells at peace" (Normandy, 1944-06) and "CCP on PRK, 4 cells at
  peace" (Korea, 1950-12); ROM on SOV (1944-08) on seeds 4-5. The gate runs only the pin of the sweep tests, so no
  commit since saw it; HEAD's own timeline gives the same lines.
- **Decision.** (1) The rule (`territory.ts`): a cell taken in a stage's window goes to its taker, as R82b says, but
  one whose owner fights on the taker's side is freed to its owner, as before R82b (North Korea's land, retaken by
  China's volunteers, was China's at peace with its owner). (2) The checker (`heldByTimeline`): a stage excuses land
  held by its nation or by one fighting beside it (the Americans on Normandy's Vichy cells for the British stage, which
  ADR-1040 meant).
- **Measured:** `historyTrack1938h` and seeds 1-5 to the 1991 end: no line, no warning; `historyMatch1938h` within its
  bars on every map. Track-only (`takeOpen` is false outside a track's window): plain games and the pin unchanged.

### ADR-1048 · 2026-11-14 · accepted — R80e: the techs of 1975-83, the last six bits
- **The rule** (ADR-1031's answer 4: no new unit, the period's techs as stat upgrades): six techs appended to
  `data/tech/postwar.json` (loaded last, so no older bit moves; a save keeps its techs), nation-wide modifiers of
  5-10 % as R71c's (ADR-994): microprocessors (1975; research, industry), precision-guided munitions (1975; air
  attack), fourth-generation jets (1978), composite armour (1980), attack helicopters (1983; land attack, the unit
  ADR-991 left out as a tech), cruise missiles (1983; naval attack). None nuclear, none needing a nuclear tech.
- **The cap:** 64 of the 64 bits (`MAX_TECHS`, a nation's `tech0`/`tech1`). A later tech needs the columns widened,
  a change of the save's layout (a format step); none is planned.
- **Measured** (`tools/diag/techsBy.ts`, seed 1938 from the 1975 start to the 1991 end): the six great powers, Italy,
  Japan and East Germany know all six; the Netherlands 3, India 2; 145 living nations none. Nothing is researched
  before its year: the pin (seed 99, 1938-39) and 1938-74 unchanged; 1975's two techs can be begun in 1975.

### ADR-1047 · 2026-11-14 · accepted — R80d: the replay to 1991, its new nations dormant
- **The end** moves to 31 December 1991 with no new event yet (1976-91 steered with nothing scheduled, as R71b did
  for 1963-75); the card says "the end of 1991". The replay tests to the end get an hour (`historyTrack1938h*`).
- **Nations** (44, dormant; `docs/research/1976-91.md`'s table and its rebels): the 30 states of 1976-91 (Seychelles
  to Tajikistan, the eleven Soviet successors beside Russia, which is the Soviet Union renamed), and 14 rebel movements,
  each a nation born on the land it holds (the mujahideen, the Contras, the FMLN, RENAMO, the SPLA, the LTTE, the NPFL,
  the RUF, the EPRDF, the USC, Transnistria, Nagorno-Karabakh, the Krajina, Chechnya; GUNT is FROLINAT's FRO, reused).
  Zimbabwe is RHO renamed and Eritrea's EPLF the ELF, both in already. Colours distinct from every other nation's; our
  own simplified flags; tags none of 1938's.
- **Measured:** 1938-75 unchanged (seeds 1938 and 1 on 30 December 1975, the old tree and this one: the same hashes of
  owner, controller, formations, the living and gold); the pin unchanged (1938h is not the pin's scenario).
  `npm run saves` to 1991: 7 min 13 s locally (6 min 17 s to 1975), 63 MB for 54 starts (41 MB).

### ADR-1046 · 2026-11-14 · accepted — R80c: a breakup's forces (`born` with `forces`); the unions by `annex`
- **Context.** ADR-1031: the Soviet Union's army, navy and air divided on 26 December 1991 by the land they stand on,
  its arsenal Russia's alone (answer 2); Germany and Yemen unite in 1990. A `born` moved land alone: the giver's
  formations on the new land stayed the giver's, a foreign army inside a new state.
- **Decision.** `born` takes `forces` (`handForces`): of the givers, each land formation on the new nation's land, each
  fleet whose nearest port (by its water) is on that land, with the formations aboard, and each wing at an airbase on
  it or on a carrier so handed, become the new nation's; a wing handed over drops its mission and sortie. Heroes are
  their roster nation's (ADR-812) and stay; warheads are not forces and stay (Russia is the Soviet Union renamed, so its
  arsenal is Russia's). The unions need nothing new: `annex` (`annexNation`) moves land, cores and every formation
  (ADR-112, ADR-269) and the annexed dies.
- **Stands on, checked (ADR-803):** ADR-926 (births), ADR-812 (heroes), ADR-1031. No timeline event uses `forces` yet,
  so 1938-75 and the pin are as before.
- **Results.** `breakup1938h.test.ts` (4). `tools/diag/breakup.ts`, the 1975 track's last day with GDR into FRG, SYE
  into YEM and MPL born from the Soviet Union on a box of Ukraine with `forces`, seeds 1-4: West Germany 37→53 land
  formations and 16→23 wings; the stand-in 0-3 land formations, 4 fleets (the Black Sea's), 4-5 wings; the Soviet 26
  warheads stay Soviet; every rule set of `worldInvariants` and no dead nation's formation, each hour to 30 days after
  the end: 0 broken lines. The Soviet army of 1975 stands mostly off Ukraine (0-3 of 218-275 formations there).

### ADR-1045 · 2026-11-14 · accepted — R80b: a bloc that ends (the track's `allianceEnd`)
- **Context.** ADR-1031's answer 3 (the user's): after 1991 NATO the one lasting bloc, Russia and the CIS a pact outside
  the deterrence rule. R67's blocs (ADR-981) are derived each month, the two strongest alliances led by a nation with an
  assured second strike, so a Soviet-led CIS would have been the second bloc again.
- **Decision.** A track event `allianceEnd` (`leader`): every member of the alliance `leader` leads leaves it, so it
  dissolves (`AllianceDissolved`); refused when `leader` leads none. Derived from the events applied (`Track.blocsEnded`,
  as `bombCleared`, not state): once one has been applied, `blocsOf` leaves out every alliance led by an ended leader
  and returns one bloc, the strongest of the rest. With one bloc there is no deterrence (`deterred` needs two), no aid
  (`blocAid` runs for two), and an alliance the ended leader founds calls its members as any alliance does (the
  defensive pact of ADR-1033 is a bloc's). A game that leaves the track before the event keeps its two blocs.
- **Stands on, checked (ADR-803):** ADR-981 (the blocs), ADR-990 (aid), ADR-1033 (a bloc a defensive pact), ADR-1031.
  Their tests green before and after (`blocs1938`, `blocAid1938h`, `blocDefensive1938h`, `rivalsApart1938`,
  `trackFocus1938h`, `trackRunner1938h`, `nukeRestraint1938`, `nukeUndeterred1938`: 30): the timeline has no
  `allianceEnd` yet, so 1938-75 and the pin are as before.
- **Checker (ADR-804):** `diploInvariants`' `bloc`: at most two blocs, one after an end, none led by an ended leader, no
  `BlocAid` with fewer than two.
- **Results.** `tools/diag/blocEnd.ts`, the event added on the 1975 end (the track's last day until R80d), seeds 1-4,
  10 years: at most one bloc (the United States', 14-15 members), the Soviet pact (7 members on seed 1) never a bloc,
  0 aid rows, 0 `bloc` lines; wars between NATO's members and the Soviet side 1, 0, 3, 3 (seed 1: France and the
  Caribbean against Cuba, Canada, Mexico, the Soviet Union and the Philippines, year 5). Its `held` lines (four, the
  same on every seed) are the track's end's, in a save of the day before: ROADMAP R80l.

### ADR-1044 · 2026-11-14 · accepted — R82i: a burst's ground under the units, its cap and flash over them
- **Context.** Critic run 68's AI nukes "not 9" (the user's choice to take it): on 7019's year-20 world at 938 m/px
  ground zero's mark (R81c) sat over the struck stack's marker at 10 s, its dot on the flag and its amber over the
  number; at 2 s the cloud's stem and skirt over it too. ADR-389 drew the whole burst last on the overlay, over the
  formations' tags, because a tag stood on the cloud's cap at T2.
- **Decision.** `NukeFx.draw` in two parts: 'ground' (the mark, the shockwave, the cloud's stem and skirt), drawn on the
  overlay before the unit markers, so the counters, markers and tags stand on it; 'air' (the flash, whitening the view,
  and the cloud's cap), drawn last as ADR-389. Past the flash (0.7 s) the cap stays over a blast radius above ground
  zero, so the struck stack's box is under nothing. `draw` with no part draws both (tests, probes).
- **Rejected.** The mark without its dot, or paler, where a counter stands (the counter still under the amber and the
  stem); the whole burst under the units (a tag on the cap again, ADR-389).
- **Results.** `burstCounter1938.spec.ts` (new): a burst put on the counter nearest the middle at 937 m/px (T1's
  marker) and 3,000 m/px (T0's counter), held at 2, 4, 8, 10 and 15 s: 0 of the counter's own pixels (631 and 364)
  differ from the frame without it; with ADR-389's order 513-988 of them differ (red). The critic's `c68_aimark.mjs` on
  its 7019 year-20 save at Max at HEAD: Germany's strike near Shizuishan (tick 185762), the United States' stack (x21,
  33.8k) read over the mark in its shots at about 5 and 11 s, the stem behind it; 0 page errors.

### ADR-1043 · 2026-11-14 · accepted — R82h: owned land named apart; a chart's lines at least ΔE 30 apart
- **Context.** Critic run 68's stats "not 9" (the user's choice to take it): the chart's "Land (km²)" (owned) beside the
  Ranking's "Land held (km²)" (held, R78e) read as one measure; France's (#3f5fbf) and the United States' (#2a4d8f)
  chart lines, ΔE 19, read as one blue (the map's neighbour rule needs only 15, for filled areas side by side).
- **Decision.** The chart's and the nation panel's measure is "Owned land (km²)"; the Ranking's stays "Land held
  (km²)". A chart's lines (`chartColours`, `src/shared/color.ts`), in their order, the first its nation's colour: a
  line within CHART_MIN_DE (30) of a line above it takes the first mix toward white (15 % steps to 90 %), else toward
  black, that clears every line above; with none, the mix furthest from its nearest, drawn dashed (six blues of one hue
  cannot all be 30 apart by lightness). The legend and the hover's swatches as the line.
- **Rejected.** A fixed chart palette (the nation's colour is how it is known on the map); dashes for every close
  pair (colour first, dashes the last resort).
- **Results.** 32019's year-20 world (`tools/diag/chartBlues.ts`), France selected: France #95a7dc, ΔE 37.5 from the
  United States; the United Kingdom #dc7373, 31.9 from the Soviet Union; every line ≥ 31.9 from every other; the
  names' first words differ; the shot looked at. Every six of 1938's nations in list order: each line ≥ 30 from those
  above or dashed, under 5 % dashed (`chartColours.test.ts`); `charts1938.spec.ts` (new case) green.

### ADR-1042 · 2026-11-14 · accepted (the user's decision: (a)) — R82f: a pile-on counted by realm; the AI judges the sides it would call
- **Context.** R82f (critic run 68's R68-N5): `c68_piles.ts 365 --plain` on 39139-39147 and 41139-41147, no war over
  4:1 by count of nations. HEAD (after R82d) has 3 on those ten (ITA vs POR 1:5, IRQ vs SAU 7:1, NSP vs FRA 1:9), not
  run 68's (each run's ten seeds read different wars; R82d moved the worlds). Read at their birth
  (`tools/diag/pileSides.ts`, each declaration in its hour with its sides and the declarer's utility terms) on those
  ten and ten unseen (43101-43119, odd): **16 declarations born over 4:1 by nations, on 11 of 20 seeds**. 11 of the 16
  are Italy (aggression 80), most with Germany, on a small member of the British-French alliance: "2:12" is Italy and
  Germany against Britain, France, the Netherlands, Switzerland, Luxembourg and seven of their colonies (Egypt, Sudan,
  British East Africa, French West and Equatorial Africa, Tunisia; each beside Italy's Africa, ADR-889's reach). One is
  an attacker's side: Iraq with Britain (its ally) and five British colonies on Saudi Arabia.
- **The conflict (PROMPT step 4).** By nations, 0 needs one of: (1) the defender's allies no longer called at any
  distance (ADR-887) or colonies beside the enemy no longer joining (ADR-889, the user's choice (a), 2026-11-08); or
  (2) the AI not declaring these wars, most of which are 1938's war (Italy and Germany against the West). R53l's own bar
  was this one, and the user accepted "Italy +1 ⚔ United Kingdom +10" (20887) as a front, ten colonies beside Italy's.
- **Counted by realm** (a puppet with its overlord; the war chip's leader and its allies), the 16 are **3**, each a
  nation alone on a member of a large alliance: Nationalist Spain on France 1:5 (41141; its utility 0.62: strength 0.01,
  France at war 0.30, a claim 0.30), Germany alone on Switzerland 1:5 (41145), Hungary on Austria 1:6 (43109). The AI
  weighs the target's allies at ALLY_WEIGHT 0.4 of their strength, and they join whole.
- **Options.**
  - (a) Recommended. The bar by realm (a colony counted with its ruler), and the AI judges a declaration by the sides
    `declareWar` would call (one function for both), refusing one whose side would face over 4 realms to 1. It touches
    only the lone attacker on a pact; ADR-887 and ADR-889 kept; the pin moves.
  - (b) The bar by nations: colonies beside the enemy stay out of a war their ruler is called to as an ally (ADR-889
    narrowed) and the defender's far allies join only within reach (ADR-887 narrowed). Fewer, smaller wars in 1938.
  - (c) The bar as it stands, and the AI refuses any war whose sides by nations would be over 4:1: Italy's and
    Germany's 1938 wars on the West mostly not declared (goal 1).
  - (d) R82f closed as answered: the piles are fronts, as R53l's (a) said.
- **The user's decision (2026-11-14): (a).** The bar by realm; the AI's declaration judged by the sides `declareWar`
  would call.
- **Built.** `callSides` (`src/sim/systems/war.ts`): `declareWar`'s calling, unchanged, with no change to the world
  (its own commit, the pin unchanged). The AI (`firstNotOutnumbered`, `outnumbered`, `src/sim/ai/strategic.ts`), once
  its roll says it declares: not on a target whose side would have over PILE_REALMS (4) realms for each of its own; its
  next best so judged, or none. Asked only then, and only where the target's alliances and guarantors could make five
  realms: asked of every candidate over the bar, seed 99's tick was 37 % slower (3.19 against 2.38 ms).
- **Stands on (ADR-803).** ADR-887, ADR-889 (who joins, within reach), ADR-797, ADR-808 (bonds, pledges), ADR-230,
  ADR-1033 (blocs), ADR-1041 (a colony's war costs): the calling unchanged; `warReach1938`, `alliances.test`,
  `historyWarJoined1938`, `blocDefensive1938h`, the three `diploInvariants*` suites green after (21 tests).
- **Results.** `pileSides.ts 365 --all` on the critic's ten and 43101-43119 (odd), the rule off against on: wars born
  over 4:1 by realm 5 → 0, at day 365 1 → 0 (by nations 15 → 13 born, 6 → 5 at day 365: the colonies, the bar
  re-scoped); declarations 586 → 579 (−1.2 %), wars at day 365 153 → 152. The checker's new `pile` line
  (`diploInvariants`: no war the sim declares sets over 4 realms against 1). Seed 99 unchanged to year 5 (no refusal):
  the pin stays `401d6856`. The tick, both at once on separate cores and swapped: 2.30 against 2.33 ms, 2.36 against
  2.28; the strategic AI 0.095 against 0.096 ms.

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
