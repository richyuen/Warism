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

### ADR-976 · 2026-11-11 · accepted — R66d: the timeline's arrivals kept for their stage; R66d done
- **`kept`** (optional date on `forces` and `redeploy`): its formations carry a `kept` order (`PlayerOrderKind.kept`,
  the AI leaves them be, `playerHeld`) to the opening of that date's window of fighting (FIGHT_DAYS before), then are
  the AI's for the attack. Explicit, not inferred: keeping every arrival for the first stage of its nation whose area
  held it kept the Soviet reserves of 1941-42 standing for months (both engaged 8 → 7).
- **A beachhead:** a `forces` arrival on the land of a nation at war with it makes its cell its own (`FlipCause.landing`,
  as a landing's, PLAN 4.5b). Land is taken from a neighbouring cell held, so an arrival inside an enemy's land took
  none (Yueyang, in this run's Chinese land: 67k Japanese a week beside 28k Chinese, nothing fought).
- **Planners:** a foe across a hold is a foe to plan against while a stage's window is open between them
  (`World.holdsPlan`, `Track.pairOpen`; `foesOf`, the frozen front's own part); the fighting stays in the area.
- **The timeline:** the 25th Army lands at Kota Bharu (British, at war) not Singora (Thailand, neutral until 1942: the
  day-start repatriation sent it to Japan); the 15th Army crosses at Tavoy, and the 18th and 56th Divisions reach
  Moulmein on 8 May; the Ichigo moves by rail from Henan (stopped short of Chinese-held Wuhan) replaced by arrivals at
  Yueyang (8 June) and Hengyang (14 November); Chinese defenders at Changsha and Guilin. Each kept for its stage.
- **Measured** (seed 1938): both sides engaged at the stage's hour at 10 of 19 large land fronts (seeds 1, 2: 12, 10;
  Malaya, Burma and Changsha fight now); both near 15. In the Moscow window the Soviets, outnumbered, lost 305k of
  their opening cohort (50k before). The nine replay tests green: 1941 strays 0.44 %, Paris 14 June 1940, China 381k,
  the Soviet army 3.81M on 1 November 1942, no event passed over. The replay's tick 2.75 ms against plain 1938's 2.52
  (2.48 before: the fighting of the windows). Pin unchanged.
- **The bar** (the user: "as long as it's at least 9 after step 2"): ≥ 9 on seed 1938. Not fought still: Borneo, the
  Netherlands Indies, the Philippines, New Guinea, Stalingrad, Guilin, Libya, Uranus, Moscow, the Vistula at the hour.

### ADR-977 · 2026-11-11 · accepted — R66d: no window for a taker far outnumbered; corrections to ADR-976
- **The rule** (`FIGHT_OUTNUMBERED` = 1/3, `outnumbered` in `Track.openStages`): a stage's window is shut in an hour in
  which its taker's side has under a third of the men of the nations at war with the taker on land in its area. Read
  each hour from the state, it also stops a window's fighting once the taker has fallen that far behind.
- **Why:** before the Moscow counter-offensive the Soviets near Moscow, a fifth of the Germans there at the window's
  opening, lost their whole cohort in it on seed 1938 (305k of 305k) and on seed 2 (309k of 319k): the ill effect on
  the rest of the replay the user ruled out. Now 11-13 %. The ratios at the openings (`.cache/r66x_*.json`): Moscow
  0.19-0.26, the Philippines 0.07 (shut); Case Blue 0.37-0.83 and Libya 0.67-1.03 (open).
- **Measured:** both sides engaged at the stage's hour at 11 of the 20 large `occupy` land fronts (seeds 1, 2: 8, 9);
  the census now reads `transfer`s too (R66e), adding four of 1944-45 with no fighting (24 in all). The nine replay
  tests green (1941 strays 0.44 %, Paris 14 June, China 381k, the Soviet army 3.35M on 1 November 1942); pin unchanged.
  Unit case: Luxembourg to take the land by Trier fights nothing (red with the guard's check off).
- **Corrections to ADR-976:** Malaya is not among the fronts counted (its land at its window's opening 184 cells,
  under 200: Japan took most of it before, with no hold there); Libya is counted (one formation of each side engaged),
  as are Burma (1/1) and Changsha (1/3): the margin over 9 is of single formations. The Philippines' 43 % of the
  Japanese cohort lost on seed 1938 is outside any window (no hold there before July 1942). `kept` on `redeploy` has
  no data now (R66e uses it or removes it).

### ADR-978 · 2026-11-12 · accepted — R66e: the 1945-53 stages; R66 done
- **Windows for `transfer`s:** a `transfer` is a stage as an `occupy` is (`Track.openStages`): its `to` the taker of
  its `from`'s land, its window the same (FIGHT_DAYS, the area, land only to the taker's side and of its land, shut
  while far outnumbered). A transfer changes owners, so its land is never already given; it sets nobody down. Those
  between nations at peace have no foes and no window.
- **The armies** (`forces`, `kept`): the Communist Northeast Field Army at Harbin for Liaoshen (30 divisions), the
  armies for Huaihai and Pingjin at Jinzhou (30), the Second and Third Field Armies at Bengbu for the Yangtze (30), the
  First at Tianshui for the northwest (15), the Fourth at Yueyang for the south (30), the People's Volunteers over the
  Yalu on 19 October 1950 (30, kept for the offensives of 4 January 1951).
- **Kept to the stage:** a kept arrival is the AI's from its window's opening (`playerHeld`) but its order lasts to
  the stage, and the month-start budget disbands no formation on an order (`economic.ts`). Before, on seed 1938 the
  Communists, unable to pay for them, disbanded 15 of the Liaoshen arrivals on 1 November 1948 (lost 109k of 212k,
  the Nationalists 2k); now 3k. `kept` on `redeploy` removed (no data used it, ADR-977).
- **Measured** (`tools/diag/trackFronts.ts 1945-09-01 1953-08-01`): 10 large land fronts; both sides near at 7; both
  engaged at the stage's hour at 2 (seeds 1, 2: 4, 4; before, 2, 1, 0), both engaged through most of the window at
  Liaoshen, the Yangtze, the northwest, the south, the north of Korea and the Chinese offensives. The reasons not:
  Japan occupied and Korea south of the 38th parallel (1945) are surrenders, no army of Japan's there; Seoul retaken
  has no North Korean army near (the Inchon landing would give the taker men, not a defender); Huaihai's Communists
  stand outside the band at its window's opening (Jinzhou) and reach it late. 1942-45 unchanged above the bar: 12 of
  20 `occupy` fronts on seed 1938 (seeds 1, 2: 8, 9). The nine replay tests green (strays 0.52 % 1941, 0.12 % 1950,
  0.13 % 1953; no event passed over); pin unchanged.

### ADR-979 · 2026-11-12 · accepted — R67 split; the world after the track measured
- **The measure** (`tools/diag/afterTrack.ts`, saves the world at the track's end, `.cache/afterTrack_<seed>.sav.gz`):
  20 years after 27 July 1953 on seeds 1938, 1, 2: 279, 265 and 309 wars declared; great powers declaring on great
  powers 13, 19, 13; great powers at war at some year's end in 14, 15 and 17 of the 20 years (the United States and
  Britain, France and the United States among them). Year 1 holds 36-41 declarations, later years 5-20.
- **Why** (seed 1938): the track ends with two alliances, Britain's (Britain, France, Switzerland) and the Comintern
  (the Soviet Union, Mongolia, Tannu Tuva, Communist China); no NATO, no Soviet bloc: the people's democracies are
  neither puppets nor allies. The Soviet Union declares on Norway, Czechoslovakia, Poland and Finland in its first
  year (seed 1: Norway, Poland, Finland, Romania, Turkey, Hungary), the United States and Britain join against it, and
  its army falls from 1.92M men to 0.2M in four years (seed 1: 0.13M); Communist China's from 0.63M to 0.05M. Its
  treasury at the end is 99 gold (income 1,344 a month, expenses 1,303; the United States 422,037): the month-start
  budget disbands 57 formations in the first months (seed 1: 80).
- **Split** (ROADMAP): R67b the blocs handed over (NATO, the Soviet bloc, as the timeline's alliances); R67c lasting
  blocs (rivals apart does not part an alliance led by a nuclear power); R67d deterrence (no war between two sides
  each with a nuclear arsenal); R67e proxies, its AT once the rest is measured. N = 20 years. R67c and R67d rules of
  every game: plain 1938's sweep bands kept, and keyed to arsenals, the pin (one year, none) unchanged.
- **The cost of R66** (`--profile`, 1938h seed 1938, five years): the replay's tick 3.01 ms against plain's 2.48;
  year 5 (1942-43) 7.2 ms, combat 4.67 ms of it. From one save of 17 July 1942, 14 days: 11.6-12.0 ms a tick with the
  windows, 9.4-9.5 ms without: the armies now on the held fronts make the cost (combat's pairs, found and refused across
  a hold), the windows a quarter more.

### ADR-980 · 2026-11-12 · accepted — R67b: NATO and the Eastern Bloc in the timeline
- **The events:** on 22 September 1947 (the Cominform) the Soviet Union and Mongolia leave the Comintern's pact of 1938
  and the Eastern Bloc forms under the Soviet Union with Poland, Czechoslovakia, Hungary, Romania, Bulgaria and
  Mongolia; Albania joins on 22 February 1949 and East Germany on 29 September 1950 (Comecon), Communist China on
  14 February 1950 (the Sino-Soviet treaty, joined before to the Comintern's pact). On 4 April 1949 Britain leaves the
  Anglo-French pact (France left alone in it, it ends) and the North Atlantic Treaty forms under the United States
  with Britain, France, Belgium, the Netherlands, Luxembourg, Norway, Denmark, Italy, Portugal and Iceland (Canada a
  dominion of Britain's); Greece and Turkey join on 18 February 1952. Yugoslavia, out of the Cominform in 1948, in
  neither. Names `alliance.nato`, `alliance.eastern_bloc`.
- **AT:** `historyTrack1938h` checks both at the track's end, each under its leader with these members. The nine replay
  tests green, no event passed over; pin unchanged. A first try had France leave the Anglo-French pact too, refused
  (it had ended with Britain's leaving).

### ADR-981 · 2026-11-12 · accepted (the user's decisions) — R67c-d: two blocs, lasting and deterred, in the track's games
- **The rules** (`src/sim/ai/strategic.ts`): the blocs (`blocsOf`) are the two strongest alliances (their members'
  men) led by a nation with an assured second strike (`blocLeader`, `nuclear.ts`, as MAD reckons one: MAD_WARHEADS and
  means to deliver, no overlord). R67c: rivals apart parts no great power from them. R67d: the strategic AI weighs no
  war of a nation of one bloc on a side the other stands on (`deterred`: the target, the overlord that would lead its
  defence, a guarantor of either), on land or over the sea (`warTarget`). Only in a game of the historical track
  (`world.track`), once it has ended or been left; `BLOC_PROBE` switches each off for a measure.
- **Measured from the worlds at the track's end** (`tools/diag/afterTrack.ts`, `BLOCS=`; seeds 1938, 1, 2; days with
  the leaders of the blocs at the track's end on opposite sides of a war in 20 years / members still in at year 20):
  neither rule 1,191-3,652 days, the Soviet Union dead or out of its bloc on two seeds; lasting alone 438-998 days,
  the Soviet Union dead on all three; deterrence alone 0 days, the blocs 3-7 of 10 and 2-7 of 13; both 0 days, 10 of
  10 and 13 of 13, about 180 wars still declared on each seed.
- **The user's two decisions.** First, any two sides each with an assured strike deterred, and every alliance led by
  one lasting: the sweep (seeds 1571-1580, 50 years) 8 of 10 seeds within the limits against 10 of 10 (land moving in
  the last five years 1-37 % against 21-68 %, under 1 % on two; nukes used on 7 seeds against 10). The user: two blocs
  only. That, in every game: 5 of 10 (one nation over 40 % of the world's income on five); lasting alone 9, deterrence
  alone 7; both off 10 of 10 (the same as `2026-11-11-sweep-done63`). The user: the track's games only; a Cold War for
  every game a later item (R67f), needing a counterweight. This narrows ADR-585's rivals apart in those games only.
- **Tests:** `tests/unit/blocs1938.test.ts` (deterred: the other bloc's leader, member and guarantee; not a nation of
  neither; none with one bloc). Plain games' path is the old one (no track: no blocs); the pin unchanged.

### ADR-982 · 2026-11-12 · accepted (the user's decision) — R67e and R67f after R69
- Asked what "rivalry by proxies" should be (aid to the other side of a bloc's war on an outsider; the blocs pulling
  the unaligned in; or deferring), the user deferred R67e, and with it R67f (a Cold War for every game), to after R68
  (a start from any date) and R69 (the replay to 1962): 1953-62's own proxy conflicts come with R69's timeline and
  will show what is missing. R67 stays open until they are done.

### ADR-983 · 2026-11-12 · accepted (the user's decisions) — R68: yearly starts, built at deploy
- **Asked** how a world at a chosen date is made (saved worlds shipped; fast-forward; both) and where saves live. A
  saved world is about 1 MB gzipped; the replay runs about 26 s a simulated year in Node.
- **The user:** a saved world of 1 January of each year of the replay (16 to 1953, 25 with R69), built by the deploy
  workflow on each push to `main` and published with the site, never committed; the card picks a year, not a day
  (no fast-forward): a player lets the replay run to the exact point wanted. On the card, with the year, the choice
  of continuing the replay or playing free from it.
- **Then (the user, 2026-11-12, after R68c's first card):** a slider under the map, not a list; and one card, not
  "World, 1938" beside "World, 1938 — Historical". R68's "in place of" both cards: the historical one leaves the title's
  list, its replay the 1938 card's "Replay history"; "Play free" from 1938 is the plain 1938 game, from a later year the
  historical world left at once. Tests of the list (its count; the historical entry) changed with it.
- **The blocs' gate** (ADR-981 said "once it has ended or been left", the code read any track): `world.track?.ended`,
  so no bloc rule acts while the track steers (R69's nine more steered years). Nine replay tests and the pin unchanged.

### ADR-984 · 2026-11-12 · accepted — R69a: the track to 1962, its new nations dormant
- **Split** (ROADMAP R69a-e): 1938-53 kept first, then the new years by period, each with a map; the research behind
  them in `docs/research/1953-62.md` (sourced; who held each future state's land on 1 January 1953).
- **The end** moves to 31 December 1962 (`timeline.json` `end`), with no new event yet. Most of 1953-62's new states
  are in a colony nation of 1938 (AOF, AEF, INC, BCO, BEA...) and come of it by release (and rename) or by birth; 26
  nations added dormant for the births (LAO CAM GUI TOG DAH NGE UVO CIV MLI MRT CMR CHD CAF GAB SOM RWA BDI CYP SLE
  KUW JAM TRI TGK UGA ALG SAM), their flags our own simple layers.
- **Measured:** the 12 maps' scores the same to the hundredth as before (`historyMatch1938h`); the nine replay tests
  green, the track checks run to 1962 with no war off the timeline; the pin unchanged. Tests of 1953's end kept on
  27 July 1953: the armistice's day checks no war and both Koreas with the track running on; the free world from
  1953 is left there by `leaveTrack` (as a free start from a year), the world after 1962 R69e's. The card's words,
  SPEC's end and the yearly starts (to 1962) follow.

### ADR-985 · 2026-11-12 · accepted — R69b: 1953-56 in the replay; land named by the map's codes
- **Land by codes:** a `transfer` or `born` names its land by a ring, whole countries (admin-1 `adm0`) or provinces
  (`adm1`), any of them (the schema refuses none); the track holds the provinces' codes (`Track.codes`, derived, from
  the map's `Admin1Meta` when the Sim builds it). A transfer by codes is a handover: no window of fighting. The map's
  `MAR` is Morocco with the Spanish Sahara, so Spain's zone is named by its province (`MAR-1445`, Tangier-Tetouan).
- **The events** (from `docs/research/1953-62.md`): Laos and Cambodia born of Indochina's land; at Geneva North Vietnam
  born north of the 17th parallel and Indochina renamed South Vietnam (`SVN`; its seat goes to Saigon with Hanoi, so no
  `capital` event), released on the Republic's proclamation; the Amami Islands back to Japan; Egypt released at the
  Canal Zone agreement (a British puppet in this world since 1938); West Germany in NATO; Austria's zones end; Sudan,
  Morocco (`MOR`, with the Spanish zone) and Tunisia released. Suez: Israel's war on Egypt, Britain and France beside
  it, the Sinai and Port Said held; the ceasefire a `hold` to Israel's withdrawal (a peace ends the whole war and
  returns what it held: on 8 March 1957), Port Said given back on 22 December. Not modelled: the war in Indochina before
  Geneva (no Viet Minh state), the Algerian War (no Algerian state before 1962), Hungary (already in the Soviet bloc;
  its land does not change), French India and Port Arthur (no cells, or already the receiver's).
- **Measured:** a map of 1 December 1956 (the new states, Austria free, the Sinai and Port Said held) matched as the
  earlier maps; on that day the new states living, the released free, West Germany in NATO, Vienna Austria's.

### ADR-986 · 2026-11-12 · accepted — R69c: 1957-60 in the replay
- **The events** (from `docs/research/1953-62.md`): the Saar to West Germany (its province); Ghana (`GHA`, the Gold
  Coast renamed and released, British Togoland in its land already) and Malaya released; the United Arab Republic
  (Syria annexed by Egypt, told by its note; Egypt renamed `UAR`); Tarfaya to Morocco; Guinea born; in 1960 Cameroon,
  Togo, Somalia (the Italian trust territory and British Somaliland, the map's `SOM` and `SOL`), Dahomey, Niger, Upper
  Volta, Ivory Coast, Chad, the Central African Republic, Cyprus, Gabon, Mali and Mauritania born; Madagascar and
  Nigeria released; French Equatorial Africa's remainder the Congo (Brazzaville, `CGB`) and French West Africa's
  Senegal (`SEN`), both released; the Belgian Congo renamed (`CGL`; no overlord in this world); the Sino-Soviet split
  (China leaves the Soviet bloc, 16 July 1960). Five identities with names and flags of their own.
- **Not modelled:** the revolutions in Iraq (1958) and Cuba (1959) and the coups (no event kind changes a
  government); the interventions in Lebanon and Jordan and the Taiwan crisis (no land changed); Katanga and the Congo
  Crisis (no state for the secession); the Mali Federation's two months (Senegal and Mali from AOF directly); the
  Ifni War (Sidi Ifni stays Spanish).
- **Measured:** a map of 31 December 1960 matched as the earlier maps; on that day the 14 states born living, Syria in
  the UAR, the colonies released free of their overlords, China outside the Soviet bloc; the Eastern Bloc at the
  track's end without China.

### ADR-987 · 2026-11-12 · accepted — R69d: 1961-62 in the replay, to the track's end
- **The events** (from `docs/research/1953-62.md`): Sierra Leone, Kuwait, Tanganyika, Western Samoa, Rwanda and
  Burundi (of the Belgian Congo's land in this world), Algeria (of France's own land), Jamaica, Trinidad and Tobago
  and Uganda born; Syria born again of the UAR's land (a dead nation brought back); the Southern Cameroons (Nigeria's
  land in the map's `CMR`) to Cameroon; Goa, Daman and Diu to India by their provinces (its note names Operation Vijay; the annexation, not its day of
  war: a war on Portugal would call its NATO allies); Albania leaves the Soviet bloc. The Sino-Indian War: China's war
  on India, the Kameng sector held from Bomdila's fall, the ceasefire a white peace (China's withdrawal); Aksai Chin is
  China's on the map already.
- **Not modelled:** the Cuban Missile Crisis (no war), the Yemen civil war (no royalist state), the Bay of Pigs and
  the Kuwait and Bizerte crises (no land changed), West New Guinea (under the UN at the end of 1962; Indonesian in
  1963), the coups.
- **Measured:** a map of 30 December 1962 (the day before the track's end) matched as the earlier maps; that day the
  states born 1961-62 living, Albania outside the Soviet bloc, no war; the two scripted strikes still the only nuclear
  ones to the track's end; the Eastern Bloc at the end without China or Albania.

### ADR-988 · 2026-11-12 · accepted — R69e: the world after 1962 measured; R69 done
- **Measured** (`tools/diag/afterTrack.ts`, seeds 1938, 1, 2, 20 years from the track's end on 31 December 1962): the
  great powers USA, Britain, the Soviet Union, China, Japan, France; the blocs at the end the Eastern Bloc (8: the
  Soviet Union, Poland, Czechoslovakia, Hungary, Romania, Bulgaria, Mongolia, East Germany) and NATO (14, West Germany
  in it). No day in 20 years with their leaders on opposite sides of a war; both whole at year 20 (8 of 8, 14 of 14) on
  every seed; 276-317 wars declared (from 1953: about 180, the new nations more to fight), one or two between members
  of the two blocs (deterrence holds the sides the other bloc stands on, not every member's quarrel), great powers at
  war in at most one year. R67c-d's rules hold from the new handover.
- **Found:** West Germany holds an arsenal at the track's end (the nuclear powers USA, Britain, the Soviet Union,
  France and West Germany); history's had none. An item of its own (R69f), not this one's.
- The free world from 1953 (`freeWorld1938h`, left by `leaveTrack`) stays the test of the AI's own wars; from 1962 the
  measure above (wars declared every year on each seed).

### ADR-989 · 2026-11-12 · accepted — R69f: the bombs of the timeline
- **Found** (ADR-988): any nation of income enough researched the bomb while the track steered: France held 10
  warheads by 1950 (its test was in 1960) and West Germany built from 1953 (never, in history).
- **The rule:** a `bomb` event is a nation's test (the United States 16 July 1945, the Soviet Union 29 August 1949,
  Britain 3 October 1952, France 13 February 1960): it knows the bomb from then (a `NuclearPower` row) and may build.
  While the track steers, `goesForBomb` holds for none other (`Track.bombCleared`, from the events applied; derived,
  not state), so none researches it or builds; after the track, the usual rules. A clearance alone left France with
  none by 1962 (the research is years): the event grants the tech, as the test was.
- **Measured:** on seed 1938 and seeds 1-5, the arsenals at the track's end the United States', the Soviet Union's,
  Britain's and France's (a hard check on every seed: a rule, not luck). The maps of 1941-45 moved within their bars
  (control on 1 December 1941 96.3 % right against 96.4, its strays 0.43 % against 0.52; the others the same or
  better); 1950-62 unchanged.

### ADR-990 · 2026-11-12 · accepted (the user's decisions) — R67e: aid to the other side; R67f closed
- **Asked** what rivalry by proxies should be (aid to the other side; the blocs pulling in the unaligned; none), and
  whether R67f (the bloc rules in every game) goes on. **The user:** aid to the other side; R67f closed, the bloc
  rules staying in the track's games only.
- **The rule** (`blocAid`, `src/sim/ai/strategic.ts`): monthly, where the blocs are (the track's games after it), in
  each war, by id, a side of nations of neither bloc facing a member of one is aided by the other bloc's leader: its
  first free nation gets AID_SHARE (5 %) of the giver's income in gold, and while its side is losing (the war's score)
  a division of volunteers (`infantry_div`, its men and price the giver's) queued for it. At most AID_WARS (3) wars a
  giver a month; none to a nation the giver is at war with. A `BlocAid` row ("Cold War aid"). No state: it reads the
  wars each month.
- **Measured** (`tools/diag/afterTrack.ts`, seeds 1938, 1, 2, 20 years from the track's end; the handovers made again
  after ADR-989): the United States aided 26-34 nations (163-244 months), the Soviet Union 47-59 (247-292), most at war
  with NATO's colonial powers; the leaders never on opposite sides of a war; both blocs whole (8 of 8, 14 of 14);
  279-298 wars declared. Plain games' path unchanged (no track, no blocs, no aid; the pin).
- **Tests:** `tests/unit/blocAid1938h.test.ts` (the gold and its row; volunteers while losing; none to a foe, none
  with one bloc).

### ADR-991 · 2026-11-12 · accepted (the user's decisions) — R71: the replay to 1975, before the critic
- **The user:** stop before the critic of Batches 18-19 and extend the replay; asked whether new units are needed,
  then "let's try to 1975"; and that coups and revolutions of the earlier period get an item too.
- **Units:** none new. The roster (mechanised infantry, MBTs, jets, ballistic missiles, the navy) carries 1963-75;
  the tech tree ends in 1952, so later techs come as stat upgrades (R71c). Missile submarines and helicopters are
  left for a longer horizon.
- **What the period needs instead:** a regime change (R71a: a nation's government drives no rule today, so the event
  sets its aggression and alignment with it), its first uses 1953-62's coups and revolutions; rebels as nations born
  on the land they hold (R71b), so the insurgencies of the period (Vietnam, Laos, Cambodia, Biafra) are the
  existing births, wars and annexations.

