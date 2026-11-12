# Decisions (ADR log)

Format: ID · date · status · decision · why · consequences. Deliberate deviations
from AoC are tagged **[AoC-DEVIATION]**.

---

> The ADRs before the last release tag are in `docs/history/`: `DECISIONS-<YYYY-MM>.md` (October) and
> `DECISIONS-<release tag>.md` from November on (ADR-805, ADR-918), in the order they had here. Search them by number (`grep -rn "ADR-623 " DECISIONS.md docs/history/`).

### ADR-958 · 2026-11-11 · accepted (the user's decision) — After release-2026-11-11: armies on the replay's fronts, Cold War blocs, a start from any date, the replay past 1953
- **Context.** Critic run 63's design objections: the replay's battles of 1942–44 are moved by its stages with no
  armies there (SPEC §7.7, ADR-935), and the world after 1953 forgets the blocs at once (54 wars in two years on the own
  seed). The user's ideas (2026-11-11): do something about the empty fronts; extend the replay; model the Cold War in
  the sim; replace "World, 1938" and "World, 1938 — Historical" by a timeline slider, a start from any point of the
  replay, continuing it or free.
- **Decision** (the user: "that order looks good, and let's include 4"), in this order after Batch 17:
  1. **Armies on the replay's fronts (R66).** The script decides each front's outcome; the armies stand on the
     fronts at each stage and fight there. Where they can be made strong enough to win the stage's outcome by the
     fighting without ill effects on the rest of the replay (`historyMatch1938h`'s and `historyTrack1938h`'s bars
     kept), they should; otherwise the stage moves the line as now (the user's "middle ground").
  2. **Cold War blocs in the sim (R67):** lasting blocs under the strongest powers, war between their leaders held
     back by deterrence, rivalry by proxies; a rule of every game, not the track's.
  3. **A start from any date of the replay (R68):** the timeline slider in place of the two 1938 cards; continue the
     replay or free from there.
  4. **The replay past 1953 (R69).**
- Each is split into lettered parts with their ATs when it is started (ROADMAP's rule).

### ADR-959 · 2026-11-11 · accepted (the user's decision) — The release made shorter; the replay to 1962
- **Context.** release-2026-11-11 took about 5½ hours after the last item: the critic's full run about 1 h 50 m
  (about 720 bulk landing runs re-run because only the track's files had changed), `check:review` 2 h 20 m (its sweep
  stage 22 m, the historical track's six seeds one after another), the soak 30 m, the sweep 32 m, `bench -- G` over
  10 m (most of it the software rasteriser, reported, never judged). The user asked for trade-offs and took the four
  that lose little or nothing (2026-11-11: "Let's do your 1-4").
- **Decision.**
  1. `historyTrack1938h`'s five other seeds a file each (`tests/sweep/historyTrack1938hSeed1-5.test.ts`,
     `tests/helpers/historyTrackWarn.ts`), so they run side by side: the six together 4 m 05 s (22 m before).
  2. `npm run bench -- G --gpu-only` at a release: the GPU's budgets judged as before, the software rasteriser's last
     figures and pictures kept and marked with their date: 31 s with the build (over 10 m before).
  3. No soak of its own at a release: the sweep takes the soak's checks on its way (`tools/sweep/reload.ts`): every
     10 years, the first in year 1 to 10 by the seed, the world saved gzipped, loaded into a fresh sim of another
     seed and saved again to the same bytes; the loaded twin and the world 30 days side by side to one hash, the run
     going on with the loaded one; a NaN or an infinity looked for each year's end; any break fails the sweep. Ten
     seeds and 50 loads where the soak had one seed and 5. Checked: green on a 3-year run; red with the twin nudged a
     tick before the bytes' check, and again after it (the hashes 30 days on). The soak of its own still runs
     every night (`.github/workflows/nightly.yml`, green 2026-11-08 to 11).
  4. The critic carries a bulk set of plain 1938 runs when its two 20-year saves end at the last report's hashes and
     the diff touches nothing under `src/sim/systems/`, `src/sim/ai/`, `src/sim/nav/`, nor `tick.ts` or `sim.ts`
     (`CRITIC_PROMPT.md`).
- **Not taken** (they lose coverage): no full critic run, or one every other release; the e2e beside the critic (the
  CPU shared, timing specs and the critic's measures upset); only the changed e2e specs (the last release's
  `orderRowsTap1938` red was found only so).
- **Also decided:** R69's replay runs to 1962 for now (the user's "let's try 1962").

### ADR-960 · 2026-11-11 · accepted — The "Next" line moves on at Max (R65a, R63-N1)
- **Cause** (critic run 63, `c63_h_blank.mjs`): R64f hides the line while its event's hour is behind the shown hour,
  and the stats that name the next come once a second; at Max the line was blank from each event's hour to the next
  stats, 24.5 % of the samples.
- **Rule:** the stats carry the next named event and up to `TRACK_AHEAD` (8) after it (`TrackNext.ahead`,
  `src/worker/server.ts`); the line shows the first whose hour is not behind the shown one (`nextShown`,
  `src/app/trackShown.ts`); none only when all are past.
- **Measured:** the probe at Max for 120 s (1938 to July 1943): the line in 1,089 of 1,092 samples (99.7 %; 75.5 %
  before), never past, at most 2 blank in a row. `tests/e2e/trackView1938h.spec.ts` "at Max…" now asks ≥ 95 % present
  (red on the code before: 0.77); `tests/unit/trackShown.test.ts`.

### ADR-961 · 2026-11-11 · accepted — The God tab says it ends the replay (R65b, R63-N2)
- **Cause** (critic run 63, `c63_h_godtab.mjs`): the nation's God tab, about 40 controls, said nothing; the Take
  control note was scrolled out, and the bar's "Any act here ends the replay of history." stood under "Map tools", read
  as those tools' alone. One tick of "World AI" ended the replay.
- **Rule:** the God tab has the note at its head while the track runs (`god-tab-ends-track`), and the bar and the tab
  say "Any God Mode act ends the replay of history." (`track.anyGodAct`); the editor keeps "Any act here…".
- **Measured:** `tests/e2e/trackView1938h.spec.ts` ("what ends the replay…"): Germany's God tab's note in view at
  1400 × 800, gone with the replay's end.

### ADR-962 · 2026-11-11 · accepted — Run 63's small findings (R65c)
- **The bar's note red** (`.god-tools-hint.panel-warn`): `.god-tools-hint`'s grey, later in `style.css`, took the
  `panel-warn` red; now red as the panels'.
- **The track's line on a phone:** 0.72 em of the bar was 8.8 px at 390 × 844, 844 × 390 and 667 × 375; 11 px there
  (`max-width: 600px` or `max-height: 500px`), in the same 150 px (the bar does not move; a long name is cut sooner).
- **Manchukuo's triple** (18 August 1945: "Manchukuo was destroyed", "Mengjiang was destroyed", and the note
  "Manchukuo and Mengjiang dissolved: China in name"): a timeline transfer told by its note is not told again as the
  land handed over (its hour) or as a nation it took from destroyed (the hour after) (`transferTold`,
  `src/worker/historyRows.ts`; History and ticker). The note kept, not the game's rows: on the own seed it also
  covers "France freed: the Provisional Government" (Vichy), "The north freed: the Italian Social Republic ends",
  "Xinjiang joins" and "Tibet annexed", whose notes say more than "… was destroyed". The sim unchanged.
- **The grey world at a start:** not a file's alone. Plain 1938 shows the map with no nations for 2.0 s, a file 2.1 s
  (the world built in the worker; its stats are sent at once when it is). "Building the world…" stands over the map
  until the first stats (not in the toy world, which has none).
- **Measured:** `tests/unit/historyTransferTold1938h.test.ts` (red on the rows' code before);
  `tests/e2e/worldBuilding1938.spec.ts` (the notice in every sample with the map drawn and no stats, gone with them);
  the font and the colour by a probe at four sizes and a shot.

### ADR-963 · 2026-11-11 · accepted — A told transfer hides only its own rows (R70a, R64-N3)
- **Cause** (critic run 64, `c64_transfer.ts`): ADR-962's `transferTold` hid any `LandCeded` whose giver a told
  transfer took from, in its hour or the next: on 8 May 1945 "Carpatho-Ukraine, Soviet in fact" (Hungary's land to the
  Soviet Union, 00:00) hid "Czechoslovakia took land from Hungary" and "Yugoslavia took land from Hungary" (01:00).
- **Rule:** a land row is hidden only when its giver and receiver are the transfer's and it is of the transfer's own
  hour; a nation's end, in that hour or the next, as before.
- **Measured:** `c64_transfer.ts` shows both rows again; `tests/unit/historyTransferTold1938h.test.ts` gains the case
  (red on the code before).

### ADR-964 · 2026-11-11 · accepted — The track's line on a phone: short, on two rows (R70b, R64-N1)
- **Cause** (critic run 64, `c64_h_phone.mjs`): ADR-962's 11 px in the same 150 px held ~29 characters, 21 of them
  "Next, 12 March 1938: ": "The An…" (the notes' median is 46 characters; a phone has no hover for the tooltip).
- **Rule:** on a phone (`PHONE_QUERY`) the line reads "12 Mar 1938: The Anschluss" (`bar.trackNextShort`,
  `monthShort.*`) on two rows of a fixed height (the bar does not change its height with the note); the tooltip whole.
- **Measured:** the probe at 390 × 844 and 844 × 390: "12 Mar 1938: The Anschluss" whole (150 of 150 px); "1 Jan 1938:
  Japan's occupation: North China" whole on two rows; `tests/e2e/trackView1938h.spec.ts` asks the line whole at both
  sizes and ≥ 11 px on a phone; the bar's and the phone's layout specs green.

### ADR-965 · 2026-11-11 · accepted — Run 64's small findings (R70c)
- **A paused start:** `?paused=1` was applied after the world was built, the bar saying "Pause" (a game left running)
  until then; now as the HUD is made (`game.tsx`). `tests/e2e/worldBuilding1938.spec.ts` (27 samples said "Pause" on
  the code before, none now).
- **The "Next" line at Max:** `TRACK_AHEAD` 16 (8): April 1941 has more than 9 named events in a second at Max. The
  probe at Max for 120 s: 0 blank of 1,096 samples (3 before), never past.
- **Not changed: Slovakia "annexed" and "destroyed" in one hour** (8 May 1945). History is the whole log: every game's
  annexation is followed there by the nation's end, and `tests/unit/history.test.ts` has it so; the ticker tells such
  a death once (PLAN 3.12Rg2). A rule of every game's History, not the track's; left.

### ADR-966 · 2026-11-11 · accepted (the user's decision) — Batch 19's critic run deferred to after Batch 18
- The user, as the focused run after Batch 19 (run 65) began: "let's stop the critic and defer till after batch 18".
  Run 65 stopped unfinished, no report; its partial files moved to `.cache/critic-c65-aborted/` (not committed).
- The next critic run comes after Batch 18's last item and judges Batches 19 and 18 together (PROMPT RELEASES step 1
  for this pair of batches).
- Seen in passing by run 65 before it stopped, for that run to check: a title-screen start uses `paused=1`, so a
  Resume clicked while the world is built is undone when `hud.apply` forces the pause at the end of the build (as
  before R70c).

### ADR-967 · 2026-11-11 · accepted — R66 split; the measure of the armies at the stages (R66a)
- **The measure** (`tests/helpers/trackFronts.ts`, `stageArmies`; `tools/diag/trackFronts.ts`): at the hour of an
  `occupy` stage, before it applies, the land it gives (its ring's cells owned by an `of`, not held by `by`) and the
  land formations within `BAND_KM` (120) of that land, by side: the defenders those who hold it and the nations at war
  with `by`, the attackers `by` and the nations at war with a holder (by who holds it: a first count by `of` put the
  Germans with the Soviet attacker on "SOV of SOV").
- **Baseline** (own seed, 1942 to June 1945, 62 stages): both sides near at 10, the attacker alone at 7, the defender
  alone at 9, neither at 36; of the 33 stages of ≥ 200 cells, both at 7; no formation engaged at any stage (the holds).
  Stalingrad (31 October 1942): 151k Soviet, no German; D-Day: nobody; the Soviet stages of 1943-45: 1.9-2.9M Soviet
  men, 0-256k Axis.
- **Cause:** while a hold stands between two nations (R62f2), the operational AI does not count the other as a foe
  (`foesOf`): no front cell faces it, no sector is made or allotted there, and its armies stand elsewhere (run 63's
  census: 1.31M German men in the Low Countries in June 1944).
- **The split** (ROADMAP R66b-e): presence first, the holds kept (R66b); what the stages do to the armies in their
  rings (R66c); fighting in a window before a stage, the stage still deciding (R66d, the user's "middle ground",
  ADR-958); the 1946-53 stages (R66e).

### ADR-968 · 2026-11-11 · accepted — R66c: a stage's cut-off formations set down behind its line; two replay bars re-scoped (the user's decision)
- **The rule** (`src/sim/track.ts`, `setDownBehind`, `fallBackCell`): an `occupy` sets the land formations of those
  who held its land, held off from its taker (a hold), down on their own nearest land outside the land taken (4-steps
  over land, within FALL_BACK_CELLS at the 1938 size, at most SET_DOWN_PER_CELL = 2 a cell, the lowest cell of
  equals); a `withdraw` (not `captured`) of a nation held off from a foe that holds land beside the ring does the
  same, the pool only for one with no own land within reach (Italy out of Libya). With no hold, both are as before:
  where the two fight (1941), set down on the line they were beaten there and the line overrun.
- **Before:** they were left behind the line, out of supply, starving or deleted (China's formations caught in the
  Wuhan and Canton rings of 1938: 120k men starved in two months).
- **Measured** (`tools/diag/trackFronts.ts`, the large Eastern stages of 1942-45, the smaller side's men within 120 km):
  seed 1938 618k on HEAD → 2.88M; seeds 1 and 2 5.12M and 2.39M; both sides near at 8, 9, 9 of 15 (7 on HEAD's
  seed 1938). Tick over five years of the replay 2.42 ms against plain 1938's 2.51 (paired, swapped); HEAD's replay
  1.96, the difference the armies kept.
- **Tried and dropped** (an ablation on three seeds, each rule off in turn): held foes in a partner's foes while a
  stage is due, a sector with no threat and only held foes left out of the allotment, the land of the coming stages
  weighed in it. Each moved the census within its noise both ways.
- **The bars, re-scoped by the user** (BLOCKERS 2026-11-11, resolved): `historyMatch1938h`'s control strays under 1 %
  (0.5 % before): the rules it was set on read 0.53-0.85 % on seeds 1-5 and 0.17 % on seed 1938 on 1 December 1941,
  the spread of the Barbarossa fighting (China's 1938 set-downs alone moved seed 1938 to 0.55 %); 0.28 % now. The other
  seeds are warned of at the same line (`STRAY_BAR`, `tests/helpers/historyTrack.ts`: `strays` on each map with
  `occupied`). `chinaFront1938h`'s China army a year on at least 40 % of its start (half before): the monthly budget
  holds it at 379-402k from starts of 719-856k in every tree tried; without the hold 12-29k; 383k of 762k now.

### ADR-969 · 2026-11-11 · accepted — R66b's bar: both sides near at two thirds of the large land fronts (the user's decision)
- **The measure** (`StageArmies.front`, `landFront`): a stage is a front when its taker is at war with a holder of its
  land at its hour, a land front when that land is joined over land (4-neighbours, no crossing) to land the taker's
  side holds. Of the 33 large stages of 1942 to mid-1945, 21 are fronts (Torch, Case Anton, El Alamein against a
  neutral Egypt, the handovers of Libya and Austria are not), and all 21 land fronts: Japan holds part of each island
  before its 1942 stage (British Borneo before the Netherlands Indies, footholds on Luzon). The stages over the sea
  are small (Rabaul, Attu, Guam, Leyte, Hollandia, Sansapor).
- **The bar** (the user's choice of "land fronts, two thirds", asked when the island stages were thought to drop out;
  they do not): both sides near at 14 of the 21 on the own seed. After R66c: 8 (seeds 1 and 2: 10, 10). Replaces
  "≥ 20 of the 33 large stages" (ADR-967), which counted handovers.

### ADR-970 · 2026-11-11 · accepted — the census measured before a stage's date; ADR-967-969's figures restated
- **The fault:** `tools/diag/trackFronts.ts` measured at the hour of each `occupy`, an hour after the stage's own
  `withdraw` had taken its pockets or evacuated its defenders (Libya's, the Netherlands Indies'): their defenders
  counted 0. It now measures at the first hour of the stage's date, before any event of that date.
- **Restated** (seeds 1938, 1, 2; before R66c `9dff3d7f`, after it `6970dc24`): the large Eastern fronts' smaller side
  near 1.22M, 1.08M, 1.20M before R66c and 3.24M, 5.78M, 2.62M after (ADR-968 said 618k → 2.88M on seed 1938);
  of the large land fronts, both sides near at 9, 10, 11 before and 10, 11, 12 after (ADR-969 said 8, 10, 10 of 21).
  R66b's bar stands: 14 of the own seed's 21.
- **Not settled by it:** ADR-968's ablation used the old measure (its arm with no set-down had Germans deleted an hour
  before the count); the three rules it dropped are not shown to be noise, only not kept.

### ADR-971 · 2026-11-11 · accepted — R66b: a planner's own front across a frozen hold, not a partner's copy
- **The fault:** the operational AI cached a holder's front cells once a tick by the enemies' key alone, and the
  sectors once a side; a holder's own plan reads its held foes as enemies, a partner's (`foesOf`) does not. Whichever
  planner came first set them for all: on 1 July 1942 Germany's plan had 23 sectors, all in Africa, none against the
  Soviet Union, and the German attacker was missing at Case Blue and Stalingrad.
- **The rule** (`operational.ts`): while the track steers, each planner makes its own sectors; a planner with a
  frozen front (`World.frozenFront`, `Track.frozen`) has its own front cells cached apart, facing its held foes across
  frozen fronts only. A hold is frozen unless the timeline begins its war on its date (a `war` or `join` naming both
  sides that day: the Phoney War, Germany and the United States, the wars of 1945-50), or it stands from the first
  hour (China's war of 1937). With no track nothing changes (seed 99's pin unchanged).
- **Not kept:** the own front apart for every planner (the Phoney War then manned by its own rule: Germany was not on
  the French border in May 1940 and Paris fell on 20-23 June on six seeds, 11-15 on HEAD); judging a frozen hold by
  its war's start tick (Britain and France join the Polish war of 1 September, so the Phoney War read as frozen).
- **Measured:** large land fronts with both sides near 11 of 19 on seed 1938 (10 before), 11 and 11 on seeds 1 and 2;
  Germany's sectors on 1 July 1942 130 in the East. Paris on 14 June 1940 (seed 1938), 9-12 on seeds 2-5, the 23rd on
  seed 1 (15th on HEAD; the date is chaotic, ADR-931). The nine replay tests green (1941 strays 0.65 %, China 388k
  of 716k); the replay's tick 2.06 ms, plain 1938's 2.52.

### ADR-972 · 2026-11-11 · accepted — R66b done: the Pacific's armies of 1941-42 by `forces`
- **The cause:** Japan's whole army stood in northern China at every date; its conquests of 1942 came by stages alone,
  with no Japanese formation near them and few defenders (none in Burma, 8k in Malaya).
- **The data** (`timeline.json`, twelve `forces` at history's places and dates, as the Afrika Korps and the Germans
  in Norway): Malaya's garrison (a British, two Indian, an Australian division) and the Burma Corps on 1 December
  1941; the Japanese 25th Army at Singora (three divisions, 8 December), at Miri, the 14th Army at Lingayen (two), the
  16th Army in Borneo, the 15th Army from Thailand (two), at Palembang, on Java (two), at Lae. Two points moved inland
  (Singora to Hat Yai, Tarakan to inland Borneo): refused at sea on the map's grid. Each note says whose (R64c's rule;
  its test's list of nations widened to Japanese, British, Australian).
- **Measured:** of the large land fronts, both sides near at 16 of 20 on the own seed (bar 14, ADR-969), 14 and 16 on
  seeds 1 and 2; none engaged at a stage. Left: the Philippines, Burma, Ichigo's Changsha and Guilin (ROADMAP). The
  nine replay tests green, no warning (1941 strays 0.65 %, November 1942 0.27 %; Paris 14 June 1940; China 388k);
  the pin unchanged; the replay's tick 2.08 ms, plain 1938's 2.50.
- **Seen, not changed:** the AI ships two of the 25th Army's three divisions off towards the objectives of Manila and
  Borneo; R66d's fighting before a stage will want them kept to their stage.

### ADR-973 · 2026-11-11 · accepted — R66c: a stage sets down its taker's held foes' allies too, onto their side's land
- **The gap:** an `occupy` set down only the formations of the nations that held its land; their allies on it were
  left behind the line (1 March 1942: 56 Italian formations, 167k men, in Soviet land after the Moscow stage, the
  cells Germany's), and `fallBackCell` sought only a nation's own land (Italy has none in Russia).
- **The rule:** an `occupy` sets down every land formation on its land of a nation at war with its taker and held off
  from it; `fallBackCell` takes the nearest land of the nation's own or of an ally's in its war (`Wars.sameSide`).
- **Measured:** formations on a held foe's land on 1 March 1942 2 (58 before); the census and the nine replay tests
  as ADR-972 (16 of 20; 1941 strays 0.65 %; Paris 14 June; China 388k); a unit case (a Lithuanian ally in western
  Poland), red before.

### ADR-974 · 2026-11-11 · accepted — R66d: a short, guarded window of fighting before a stage (the user's decision)
- **Measured first** (`.cache/probe/r66d.ts`, from one save 30 days before, every hold lifted against none): Kursk the
  Soviets 1.83M → 1.00M and the Germans 1.18M → 0.20M near, the Germans gaining; Case Blue the Germans 804k → 228k,
  the Soviets gaining; in the first 5 days the Germans lost 65k at Kursk. Fronts with no hold (the Netherlands Indies,
  Lae) hardly fought: contact and the attack rule limit the fighting as well as the holds.
- **The user's choice** of four (a guarded short window; the same with a buff for the taker; battles shown only;
  R66 closed at presence): the hold lifted for about 5-7 days before each stage, inside its area only, land to the
  taker's side only and only of the stage's own land, no buff at first. R66d's AT rewritten to it (ROADMAP).
- **Read as written:** "both sides engaged at the stage's hour" on the large land fronts (ADR-969's 20 or 21), the
  only reading in which fighting is possible.

### ADR-975 · 2026-11-11 · accepted — R66d: the window of fighting before a stage
- **The rule** (`Track.fightOpen`, `Track.takeOpen`; `World.holdsAt`, `World.holdsLand`; combat and territory): for
  FIGHT_DAYS = 7 before an `occupy` stage not yet applied, a hold is lifted between a formation of its taker's side (the
  taker or an ally in its war) and one of a nation at war with the taker when both stand in its area (the ring's box
  grown by FIGHT_BAND_KM = 120); across it land goes only to the taker's side and only of the stage's land (ring cells
  owned by one of its `of`). Derived from the tick and the timeline, no state; with no track nothing changes (the pin).
- **The stage:** its land held already by its taker's side is fulfilled, not passed over (a Korean stage of 1951 taken
  whole in its window); its taker's held foes on any of its land, taken now or in the window, are set down (R66c).
- **The measure** (`tools/diag/trackFronts.ts`): each stage's land, size and front fixed at its window's opening, the
  band round that land; men lost counted on the opening's formations by id (one gone, all its men); both sides
  engaged sampled every 6 hours through the window. Before (the band round the land left), men walking out of a
  shrinking band were counted lost: Kursk 868k Soviet, 635k German, against 45k and 119k by the cohort.
- **Measured** (seed 1938): both sides engaged at the stage's hour at 8 of 20 large land fronts (seeds 1, 2: 7, 9);
  in the window Kursk 45k of 1.43M Soviet lost and 119k of 798k German, 195 of its 244 cells taken by the fighting;
  the Dnieper 37k and 136k, 406 of 2,067; Case Blue (the taker outnumbered) 180k German of 1.07M and 112k Soviet. With
  `TRACK_PROBE.fightOff` 0 engaged, 16 near (ADR-972). The nine replay tests green (1941 strays 0.47 %; Paris 11 June
  1940; China 378k; the Soviet army 3.58M on 1 November 1942); the replay's tick 2.48 ms, plain 1938's 2.52.
- **Short of R66d's 14** (the user's plan of the same day): the arrivals of the timeline kept at their stage next, then
  the bar set to what is measured, if at least 9.

