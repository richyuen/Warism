# PROGRESS (append-only)

> The log before the last release tag is in `docs/history/`: `PROGRESS-<YYYY-MM>.md` (October) and
> `PROGRESS-<release tag>.md` from November on (ADR-805, ADR-918). Search them; they are not read. The last
> entry before this file: `release-2026-11-11`, next the user's design decision, then Batch 17 (R65).

## 2026-11-11 — The next design step decided (ADR-958, the user's decision)

- Batch 18 filed: R66 armies on the replay's fronts (the script decides; armies fight it out where harmless), R67 Cold
  War blocs, R68 a start from any date of the replay, R69 the replay past 1953. After Batch 17.

## 2026-11-11 — The release made shorter (ADR-959, the user's decision)

- `historyTrack1938h`'s seeds a file each: 4 m 05 s for the six (22 m). `bench -- G --gpu-only`: 31 s (10 m+). The
  soak's checks in the sweep (a save and load every 10 years, the twins compared 30 days on; red when broken, both
  ways checked); the release's soak dropped (it runs nightly). The critic carries plain 1938's bulk sets when its
  hashes and the paths they take are unchanged. PROMPT RELEASES step 3, SPEC §10.4 and §10.6, CRITIC_PROMPT.
- R69 to 1962 for now.

## 2026-11-11 — R65a: the "Next" line moves on at Max (ADR-960)

- The stats carry the next 8 named events; the line shows the first not yet past. The critic's probe at Max: present
  in 99.7 % of 1,092 samples (75.5 % before), never past.
- Evidence: `tests/e2e/trackView1938h.spec.ts` (≥ 95 % present; red before, 0.77), `tests/unit/trackShown.test.ts`. Gate.

## 2026-11-11 — R65b: the God tab says it ends the replay (ADR-961)

- A note at the God tab's head while the track runs; the bar's and the tab's words "Any God Mode act ends the replay of
  history." Evidence: `tests/e2e/trackView1938h.spec.ts` (in view, gone at the end). Gate.

## 2026-11-11 — R65c: run 63's small findings (ADR-962); R65 done

- A transfer told by its note is not told again as land handed over or a nation destroyed (Manchukuo's triple); the
  God Mode bar's note red; the track's line 11 px on a phone (8.8); "Building the world…" over the map until the first
  stats at a start (2 s grey before, plain 1938 too).
- Evidence: `tests/unit/historyTransferTold1938h.test.ts`, `tests/e2e/worldBuilding1938.spec.ts`. Gate.
- Batch 17 done; next Batch 18 (R66: armies on the replay's fronts).

## 2026-11-11 — Critic run 64 (focused, on `a90c7f57`): no blocking issue, all 14 dimensions at 8

- Filed: Batch 19, R70a-c, before Batch 18 (R64-N3 and R64-N1 are regressions of R65c's own fixes: land rows of other
  events hidden; the phone's line cut to ~8 letters). R64-N2 a known `slowClick` on a new seed, not taken.

## 2026-11-11 — R70a: a told transfer hides only its own rows (ADR-963)

- `transferTold` matches the land row's giver, receiver and hour; 8 May 1945's "Czechoslovakia/Yugoslavia took land
  from Hungary" shown again (`c64_transfer.ts`). Evidence: `tests/unit/historyTransferTold1938h.test.ts` (cb35c27a;
  its tick and this entry a commit after, the script that wrote them stopped on the tick's text). Gate.

## 2026-11-11 — R70b: the track's line on a phone, short and on two rows (ADR-964)

- "12 Mar 1938: The Anschluss" whole at 390 × 844 and 844 × 390 (was "Next, 12 March 1938: The An…"), 11 px.
- Evidence: `tests/e2e/trackView1938h.spec.ts` (whole, ≥ 11 px), the critic's `c64_h_phone.mjs`. Gate.

## 2026-11-11 — R70c: run 64's small findings (ADR-965); R70 done

- A forced paused start says "Resume" while the world is built (12f5c03a); the stats carry 16 named events ahead: 0
  blank of 1,096 samples at Max. Slovakia's "annexed"/"destroyed" pair left: History is every game's whole log.
- Evidence: `tests/e2e/worldBuilding1938.spec.ts`, the critic's `c63_h_blank.mjs`. Gate. Batch 19 done.

## 2026-11-11 — Critic run 65 stopped; deferred to after Batch 18 (ADR-966, the user's decision)

- Run 65 (focused, after Batch 19) stopped unfinished at the user's word; its processes stopped, its files in
  `.cache/critic-c65-aborted/`. The next critic run after Batch 18. Next: R66, armies on the replay's fronts.

## 2026-11-11 — R66a: the armies at the replay's stages measured (ADR-967); R66 split

- `tools/diag/trackFronts.ts` and `tests/helpers/trackFronts.ts`: own seed, 62 stages 1942 to mid-1945: both sides
  near at 10, neither at 36, none engaged. Cause: a held enemy is no foe to the operational AI, so no front faces it.
- R66 split into b (armies on the held fronts), c (the stages' rings), d (fighting before a stage), e (1946-53).

## 2026-11-11 — R66b/c: the set-down measured; two replay bars wait on the user

- An `occupy` and a `withdraw` set the formations they leave behind the line down on their own land (R66c): on seed
  1938 the smaller side's men at the large Eastern stages 618k → 3.85M. Three manning rules tried with it dropped
  (their effect within the census's noise on three seeds).
- It turns `historyMatch1938h` (1941-12-01 strays) and `chinaFront1938h` red; HEAD passes the first on seed 1938 alone
  (seeds 1-5 all over the bar on HEAD) and the second by 4 %, China's army held by its budget. Kept as
  `docs/patches/R66c-set-down.patch`; the bars are the user's decision (BLOCKERS).

## 2026-11-11 — R66c: a stage's cut-off formations set down behind its line (ADR-968)

- The user re-scoped the two replay bars (strays under 1 %, warned on seeds 1-5; China's army 40 %). Under a hold an
  `occupy` or a `withdraw` sets the formations it leaves behind down on their own land: the large Eastern stages'
  smaller side 618k → 2.9M men near (seed 1938). The nine replay tests green; the unit suite green (two timing tests
  red under its load, green alone); the replay's tick 4 % under plain 1938's.

## 2026-11-11 — R66b: the census tells fronts from handovers

- `tools/diag/trackFronts.ts` marks a stage a front when its taker is at war with a holder of its land at its hour
  (`StageArmies.front`): of the 33 large stages 21 are fronts (Torch, Case Anton, El Alamein against a neutral Egypt,
  Libya's and Austria's handovers are not); both sides near at 8, 10, 10 of the 21 on seeds 1938, 1, 2. Empty: Japan's
  conquests of 1942 and Ichigo's last two, the German attacker at Case Blue and Stalingrad.

## 2026-11-11 — R66b: the census measured before a stage's date (ADR-970)

- It measured an hour after a stage's own `withdraw`. Restated: R66c's Eastern gain on seed 1938 1.22M → 3.24M (not
  618k → 2.88M); large land fronts with both sides near 10 of 21 (not 8). The bar stays 14.

## 2026-11-11 — R66b: a planner's own front across a frozen hold (ADR-971)

- Germany's plan had no Eastern sector when a partner planned first; each planner now makes its own sectors while the
  track steers, its own front facing its held foes across frozen holds only (not the Phoney War). Land fronts with
  both sides near 11 of 19 (seed 1938); Paris 14 June 1940; the nine replay tests green; the pin unchanged.

## 2026-11-11 — R66b done: the Pacific's armies of 1941-42 (ADR-972)

- Twelve `forces` in the timeline: Malaya's and Burma's defenders, Japan's armies at Singora, Miri, Lingayen, Borneo,
  Thailand, Palembang, Java and Lae. Large land fronts with both sides near 16 of 20 (bar 14); the nine replay tests
  green; the pin unchanged; the replay's tick 17 % under plain 1938's.

## 2026-11-11 — R66c: allies set down too (ADR-973)

- The Moscow stage left 56 Italian formations in Soviet land; an `occupy` now sets down every held foe's formation on
  its land, onto its own or an ally's land. 2 left on 1 March 1942; the replay's tests as before.

## 2026-11-11 — R66d: the window of fighting before a stage (ADR-975)

- Seven days before a stage its area's hold is lifted for its taker's side; land only to it, only of the stage's.
  Both sides engaged at 8 of 20 large land fronts (seed 1938); losses by cohort moderate (Kursk 45k / 119k). The
  census fixed (the band at the opening, losses by formation). The nine replay tests green; the tick 2 % under plain.

## 2026-11-11 — R66d done: arrivals kept for their stage (ADR-976)

- `kept` on `forces`/`redeploy`: the AI leaves them until the window opens; arrivals on enemy land take a beachhead;
  planners see foes across an open window. Malaya, Burma, the Ichigo arrivals placed where they can fight. Both sides
  engaged at 10 of 19 large land fronts (seeds 1, 2: 12, 10), the user's bar 9. Nine replay tests green; tick 2.75 ms
  (plain 2.52).

## 2026-11-11 — R66d: no window for a taker far outnumbered (ADR-977)

- Moscow's Soviets were destroyed in their window (305k of 305k); a window now opens only while its taker's side has a
  third of its foes' men there. Moscow 11-13 % lost; 11 of 20 fronts fought on seed 1938. Corrections to ADR-976.

## 2026-11-12 — R66e done: the 1945-53 stages (ADR-978); R66 done

- Windows for `transfer`s; Communist field armies and the People's Volunteers as kept arrivals; kept arrivals not
  disbanded before their stage (Liaoshen's 109k lost to the budget now 3k). 1945-53: both engaged at the hour at 2 of
  10 (seeds 1, 2: 4), most fighting in their windows; reasons for the rest. Nine replay tests green.

## 2026-11-12 — R67a: the world after the track measured; R67 split (ADR-979)

- `tools/diag/afterTrack.ts`: 265-309 wars in 20 years after 1953, great powers at war in 14-17 of them; the replay
  hands over no NATO and no Soviet bloc, the Soviet Union nearly broke, and it attacks its own satellites. R67 split
  into b (blocs handed over), c (lasting blocs), d (deterrence), e (proxies).

## 2026-11-12 — R67b: NATO and the Eastern Bloc handed over (ADR-980)

- The timeline forms the Eastern Bloc (1947-50) and NATO (1949, 1952); both stand at the track's end with their
  members (checked by `historyTrack1938h`). Nine replay tests green.

## 2026-11-12 — R67c-d: two blocs, lasting and deterred, in the track's games (ADR-981)

- After the track the two strongest nuclear-led alliances keep their great powers and never go to war with each
  other: 0 days of the leaders at war in 20 years, NATO and the Eastern Bloc whole, on three seeds. In every game they
  broke the sweep (5 of 10); the user kept them to the track's games, R67f for every game later.

## 2026-11-12 — R68 split; R68a the replay's yearly starts (ADR-983)

- The user: a start each 1 January, built at deploy, never committed; a year on the card, no day; the replay or free.
  `npm run saves` (tools/data/replaySaves.ts): 16 saves 1938-53, ~1 MB each, 7 min; the Pages workflow runs it into
  `dist`. A year's save loaded into a fresh world plays on to the unbroken run's hash (unit test).
- R68b: `?scenario=1938h&year=Y&mode=replay|free` loads year Y's start with the game's second seed; `free` leaves the
  track by `leaveTrack` (logged, `TrackEnd.free`, its own History sentence). Unit test of the command; e2e of both
  modes and a year not built (`tests/e2e/replayYear1938h.spec.ts`, the start served by the test).
- R68c, R68 done: the 1938h card's "Start on" (1938 and the built years) and "Replay on" / "Play free"; 1938 needs no
  save (free: the track left at once). e2e of the card; the title and settings specs unchanged and green.
- The user: a slider and one card. The title lists "World, 1938" and the random world; the 1938 card has the year
  slider and "Replay history" / "Play free". A start's world is checked against `years.json`'s hash. The blocs gated
  on the track's end, as ADR-981 said (nine replay tests green, pin unchanged).

## 2026-11-12 — R69 split; R69a the track to 1962 (ADR-984)

- Research for 1953-62 (`docs/research/1953-62.md`). The end on 31 December 1962; 26 nations born 1953-62 added
  dormant. 1938-53 unchanged: the 12 maps' scores identical, nine replay tests green, pin unchanged.
- R69b (ADR-985): births and transfers name land by countries and provinces; 1953-56 in the timeline (Laos, Cambodia,
  the two Vietnams, Egypt, Sudan, Morocco, Tunisia released, Austria free, West Germany in NATO, Suez); a 13th map.
- R69c (ADR-986): 1957-60 in the timeline: the Saar, Ghana, Malaya, the UAR, Tarfaya, Guinea, the African states of
  1960, Somalia, Cyprus, the Congo, the Sino-Soviet split; a 14th map.
- R69d (ADR-987): 1961-62 in the timeline to the track's end: ten states born, Syria again, Goa, the Southern
  Cameroons, Albania's break, the Sino-Indian war; a 15th map.
- R69e (ADR-988): from the 1962 handover the blocs' leaders never at war in 20 years and both blocs whole on three
  seeds. Found: West Germany holds an arsenal at the track's end (R69f).
- R69f, R69 done (ADR-989): the timeline's `bomb` events (USA 1945, the Soviet Union 1949, Britain 1952, France 1960)
  grant the bomb; while the track steers no other nation goes for it. At the end of 1962 the arsenals are history's
  on seeds 1938 and 1-5.

## 2026-11-12 — R67e: aid to the other side; R67f closed (ADR-990)

- The user: proxies are aid; R67f closed (the bloc rules in the track's games only). After the track a bloc's leader
  aids nations at war with the other bloc's members, with gold and volunteers: the US 26-34 nations, the Soviet Union
  47-59 in 20 years on three seeds; the leaders never at war; both blocs whole.

## 2026-11-12 — R71: the replay to 1975 (ADR-991, ADR-992)

- Planned with the user: no new units; regime changes, rebels as nations, later techs, 1963-75 in three periods.
- R71a (ADR-992): a `regime` event (aggression and command efficiency, told); ten coups and revolutions of 1952-62
  and the Soviet guarantee of Cuba. The maps unchanged; the blocs' leaders still never at war after the track.
- R71b (ADR-993): the end at 31 December 1975; 49 nations dormant (the states of 1963-75, Libya, 15 rebel movements).
  The replay check reads the blocs as handed over, before the free AI's first day.
- R71c (ADR-994): 14 techs of 1955-70 as stat upgrades; by 1975 the great powers know all, most new states none.
- R71d (ADR-995): 1963-67 in the replay: the period's states, Malaysia, Tanzania, Rhodesia; the Viet Cong, the Pathet
  Lao, the Simba and Biafra as nations; Vietnam, the Konfrontasi, 1965, the Six-Day War; 18 coups. Maps of 1964 and
  1967 99.4 % right.
- R71e (ADR-996): 1968-71 in the replay: the Gulf states and the small states, Bangladesh, Biafra's end; the Khmer
  Rouge, the Kurds, FROLINAT and Dhofar as nations; 19 coups. Libya independent from 1951 (a gap since R62). The map
  of 1971 99.4 % right.
- R71f (ADR-997): 1972-75 in the replay: Saigon, Phnom Penh and Laos; Yom Kippur and Sinai; Cyprus; Portugal's
  empire and Angola's war; Western Sahara and East Timor; China's bomb (built whatever its income while the track
  steers). The map of the track's end 99.5 % right.
- R71g, R71 done (ADR-998): 20 years after the 1975 handover on three seeds, the blocs whole and their leaders never
  at war; the aid flowing (the US 30-51 nations, the Soviet Union 45-62). The replay runs 1938-1975.

- ADR-999 (the user's decision): the deploy caches the replay's starts on a hash of the sim's inputs; a push that
  changes none of them deploys in about 2 minutes, not 20.
- ADR-1000 (the user's decision): R72, a faster tick for the replay's deploy, added before the critic.
- R72a (ADR-1001): `npm run saves` from an esbuild bundle (`tools/data/saves.ts`), not under tsx's `keepNames`: the 38
  years' hashes the same, to 1941 −31 % (swapped pairs), the whole build 378 s locally. R72 split (a, b, c) from the
  profile of the build: `Track.held` and tsx's `__name` a quarter, `findBattles` 37 % inclusive.
- R72b: `Track.held` and `frozen` from the holds standing at the tick, found once a tick (`standing`), no closure a
  call; `tests/unit/trackHeld.test.ts` against the old loop. Hashes the same; the build −1.7 % (1952-54 −12 to −16 %):
  without tsx's `__name` the old loop was cheap. Mends R62f2's rule (ADR-1001's profile); no ADR (ADR-914).
- R72c: `findBattles` asks the war and the hold once a nation pair a call, not each pair of formations, and leaves a
  pair clearly out of reach before the `sqrt`. Hashes the same; the build −3.4 % (372.5 → 359.7 s, swapped pairs).
  Mends PLAN 7.1d's pairing (no rule changed); no ADR (ADR-914).
- R72 done (ADR-1002): `npm run saves` to 1975 in 0.63 of its time at `fa16420b` (570.8 → 360.7 s, swapped pairs on
  separate P-cores), every year's hash the same, the pin unchanged. The runner's step 9.4-12.3 min after the parts, 9.8
  before: its noise larger than the change. Next: the critic of Batches 18 and 19.
- Critic run 65 (focused, `5ee3e035`): every dimension at its bar (mapVisuals 8, diplomacyWarDepth 7, emergentDynamics
  8, godMode 8, editorScenarios 7, statsHistory 8, uiUxPolish 8, performance 8, stability 8, semanticZoom 8, naval 8,
  tanks 8, aircraft 8, aiNukes 8); 1 blocking (B1, R68b's refused start not told). R73 filed before the release
  (ADR-1003); the non-blocking findings after it.
- ADR-1004 (the user's decision): R74, all of run 65's non-blocking findings (R74a-h), before the critic.
- ADR-1005 (the user's decision): every critic run's non-blocking issues fixed before the release (PROMPT.md RELEASES step 2); the full run's too, then step 3's checks again, no critic run after them.
- R73 (B1 of run 65): a refused start from a year has its own failure (`?failed=start&year=Y`) and notice on the 1938
  card naming the year; the saved game's card and its Continue left alone. The critic's `c65_x_badyear.mjs` and
  `c65_x_badyearsave.mjs` pass on a build with the starts; specs `replayYear1938h.spec.ts`, `title.spec.ts`. Mends
  R68b (ADR-983); no ADR (ADR-914).
- R74a (R65-N7): a choice of pause made while the world is built holds; the boot's second forced pause taken out
  (`hud.apply()`). `c65_x_buildpause.mjs 1600 900 1` running after Resume; `worldBuilding1938.spec.ts` 5 of 5.
- R74b (R65-N6): the 1938 card shows the year chosen: its map (drawn by `npm run saves` beside its start), its living
  nations (`years.json`), "World, <year>", the year over the thumb. `c65_x_replaycard.mjs` 1960 / 1965 phone / 1975
  free with their maps and counts (103, 131, 157); `replayYear1938h.spec.ts` 4 of 4.
- ADR-1006 (the user's decision): R75, run 65's ideas from other games (a historical focus after the track; the great powers on the start card), before the release.
- R74c (R65-N5, ADR-1007): the 1944-75 names and capitals: Madrid and "Spain", Tuva and Newfoundland annexed,
  Bonn founded as West Germany's seat, "Sudan", British East Africa's last cells; no revival after the track for a
  nation history ended. The nine replay tests 10 of 10; `trackEndRevivals1938h.test.ts`.
- R74d (R65-N1, ADR-1008): post-war regimes with traits: Spain 1939, Italy 1946, Japan 1947 (replay tests 10 of 10). No JAP or ITA war in
  the first 30 days of six late free starts; no Japanese declaration in 10 years after the track on two seeds.
