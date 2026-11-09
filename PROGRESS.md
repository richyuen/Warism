# PROGRESS (append-only)

> Earlier months are in `docs/history/PROGRESS-<YYYY-MM>.md` (ADR-805). Search them; they are not read.

## 2026-11-01 — PLAN 7.5: critic run 22 on 4a977fdb (blocking 1)

- `npm run check:review` green before the run (1 known red: `seaRow1938` Speed x1; 0 not known). Its first run was
  red twice on `enemyClickPanel1938`'s Japan–China case: Japan starts at war with China and Declare war is greyed
  out at war since PLAN 7.175b; the setup fixed in 4a977fdb (the click checks unchanged). Evidence PNGs the
  review's e2e re-rendered were restored, not committed.
- Scores: map **6** (was 7), diplomacy 7, emergent 7, God Mode 7, editor 7, stats 7, UI 7, performance 7,
  stability 7; zoom 8, naval 8, tanks 8, aircraft 8, nukes 8. Blocking 1: R22-B1, the infantry helmet hides the
  flag, so German, Austrian and Polish balls read alike. Non-blocking: a puppet freed by Force war stays in the
  overlord's war 7+ days; Breakthrough's refusal shown only in God's tab; own units in mixed stacks hard to select
  under ADR-773 (a design objection). Run 21's items re-checked fixed. No frame-rate cost of the balls.
- Filed PLAN 7.179 (R22-B1) and 7.180 (map visuals 6: the planes at T2, the report's other "Fix").
- **Next:** PLAN 7.179.

## 2026-11-01 — PLAN 7.179: the flag whole below the helmet's brim (critic R22-B1; done, ADR-782 proposed)

- **Cause:** the helmet covered y < −0.4 of a ball of 0.9 (28 % of the disc), and the flag was sampled over the
  whole disc: the top stripe that names a horizontal tricolour (Germany's black) was under the helmet, so German and
  Polish infantry both read white over red.
- **Built:** `HELMET_FLAG_TOP` (the brim's lower edge) and `flagUv`: under a helmet the flag's full height maps onto
  the disc below the brim, blended in with the props' fade (`vEyes`), so a small ball with no helmet keeps its whole
  flag. `ball2d` draws the flag the same way under its helmet (T1 markers, T0 counters).
- **AT (corrected, ADR-782 proposed as the user's decision):** the filed bar (mean colour ≥ 100 apart) read 81 → 57
  at 10 m/px and 68 → 51 at 600 m/px under the fix (the critic's 52 was red pixels alone), so the bar is the top
  stripe: e2e `countryballs1938` "under a helmet" (seed 7019, contact on day 1): the band below the brim is the flag's
  top colour on German 8 of 8 (10 m/px) and 15 of 15 (600 m/px), Polish 3 of 3 and 12 of 12, no black on a Polish
  band; on `4a977fdb` German 0 of 8 and 0 of 15. Unit `ballShader.test.ts` (`flagUv`). The spec's flag-colour test
  follows `flagUv` for infantry (worst point 2 at 15 m/px, 13 at 100 m/px, limit 40). `countryballs1938` 6 of 6,
  `settings1938` green. Evidence `docs/evidence/7.179/helmet-10m.png`, `helmet-600m.png`.
- **Next:** PLAN 7.180.

## 2026-11-01 — PLAN 7.180: planes in the ball look are their silhouette with a small ball (map visuals 6; done, ADR-783)

- **Decision:** ADR-782 accepted as option (a) (the user, 2026-11-01): 7.179 stays ticked.
- **Cause:** a plane's ball was 0.5 of its span (radius 6.5 px at T2's 13 px) with grey oval wings; an infantry ball
  at 250 m/px is radius 2.25 px, so the planes were the largest balls on the screen (critic run 22).
- **Built (the user's choice, ADR-783):** `vee` draws Classic's silhouette in the nation's colour and a flag ball on
  it at PLANE_BALL 0.17 of a fighter's span (a bomber's plane larger, its ball a fighter's), at every zoom. The
  `wings` prop of `ball2d` is gone (no other user).
- **AT:** e2e `countryballs1938` "planes in the ball look" (seed 7019, 250 m/px): 9 planes clear of the others and the
  tags; ball radius 2.21 px at most against the infantry's 2.25; 9 of 9 both wings in the colour, 9 of 9 a flag
  ball, 9 of 9 the plane's colour out of the ball ≥ the ball's area (least 1.30). The far-out test's air part follows
  the rule: 50 of 62 a flag ball, 52 of 62 both wings in their colour at 1000 m/px. `planesT3_1938`,
  `sortiesSeen1938`, `settings1938` green.
- **Flaky eye check:** `countryballs1938`'s T2/T3 test read the eyes at one wall-clock moment; with this change a blink
  shut 3–4 of 13 on 4 of 7 runs (HEAD 0 of 7). It now reads twice 0.5 s apart (13 of 13, 4 of 4 runs).
- Evidence `docs/evidence/7.180/planes-250m.png`, `planes-250m-zoom.png`.
- **Next:** PLAN 7.5, the critic run (`npm run check:review` first).

## 2026-11-01 — PLAN 7.5: critic run 23 on 81beca11 (blocking 0)

- `npm run check:review` green before the run (0 known red, 0 not known); `fightCamera1938`, `nukeAlertTwo1938`
  and `seaRow1938` each red once and green alone. Evidence PNGs the review re-rendered were restored.
- Scores: map **7** (was 6), diplomacy 7, emergent 7, God Mode 7, editor 7, stats 7, UI 7, performance 7,
  stability 7; zoom 8, naval 8, tanks 8, aircraft 8, nukes 8. Blocking 0: R22-B1 fixed (German helmeted balls'
  dark share at 10 m/px 0.071 -> 0.354, Polish 0.047 -> 0.030); run 22's planes-as-units item fixed. Run 22's
  other non-blocking items unchanged. Sim unchanged (seed 7019's yearly hashes 20 of 20 as run 22).
- Every dimension at its bar and no blocking issue: the report part of the DONE CONDITION holds at 81beca11.
  Nothing filed.
- **Next:** PLAN 7.5, the rest of the DONE CONDITION at HEAD (gate in full, soak, sweep, scripted demo, budgets).

## 2026-11-01 — PLAN 7.5: the DONE condition's runs on fbc9fbc3 (code of 81beca11): green but for the T0 frame rate, filed as 7.181

- **Code:** fbc9fbc3 differs from 81beca11 only in `critic/` and PROGRESS.md (`git diff --name-only`), so the critic
  report of run 23 (81beca11: parity 7, differentiators 8, blocking 0) and its `check:review` stand for it.
- **check:full** (`npm run check:review`, 81beca11): green, 0 red twice; `fightCamera1938`, `nukeAlertTwo1938`,
  `seaRow1938` red once, green alone. The scripted demos (zoom, sea, tank, air, nuclear specs) in it.
  `docs/evidence/7.5-done/check-review-81beca11.json` and `-steps.txt`.
- **Soak** (`npm run soak -- --scenario 1938 --seed 99 --minutes 30 --affinity 0xFFFF`): green, 34.24 years (299,904
  ticks) in 30.0 min, 5 saves and loads, no exception, no desync; final hash e631fc14 (7.162: 28.06 years).
- **Sweep** (`npm run sweep -- --first 1501 --tag done23`, seeds 1501–1510 × 50 years, unseen): land changing
  controller in the last 5 years 40.5–69.7 %, ≥ 1 % on 10 of 10 (the condition). The sweep's own verdict FAILING on
  limits 5 of 10 (largest income over 40 % on 1501, 1502, 1508, 1509, 1510; 1508's USA 36.8 % of the land): "no
  hegemon" struck, ADR-740, reported (1481–1490 7 of 10, 1491–1500 9 of 10). Riser, faller, no stasis, no break-up
  10 of 10; nukes in 10 of 10. `docs/sweeps/2026-11-01-sweep-done23.md`, copy in the evidence.
- **Bench** (`npm run bench`, then `bench -- G` alone): budgets PASS (T0 136.2 and 135.0 fps against 60, T2 174.9 and
  176.6 against 30, GPU and draw CPU in SPEC). But T0 fell from 7.162's 347.6 fps, p95 4.3 → 21 ms, on both runs, the
  GPU's frame unchanged: filed as **PLAN 7.181** before 7.5, so the condition waits on it.
- **Next:** PLAN 7.181.

## 2026-11-01 — PLAN 7.181: the overlay's countryballs drawn once and copied; T0 back to 323 fps (ADR-784)

- **Cause:** the ball look's T0 (classic on the same code 346 fps). A probe of T0 as bench G sets it timed each part
  of `draw`: the CPU of the two looks within 0.3 ms, the long frames on the GPU's raster of the 2D overlay. Without
  the planes' balls (71 planes at T0, balls ~1.3 px), classic's frames. Each ball's radial gradient was most of it.
- **Fix** (ADR-784): `Ball2dCache` / `drawBall2dCached` in `ball2d.ts`; a ball drawn once into its own canvas (by
  flag image, tint, look, prop, ring, radius, scale, and its place off the device pixel to a quarter pixel) and
  copied unscaled. The T0 counters and the planes use it; a vee's balls after its planes, shadow off.
- **AT** (bench G back to back, `docs/evidence/7.181/`): fix 322.7, fbca2cc4 345.5, fix 323.4 fps at T0 (bar 311);
  p95 4.6 ms all three (bar 6.9); T2 174.8, 182.6, 179.1 (bar 164). Met.
- Specs run by hand: `countryballs1938`, `counters1938`, `countersRest1938`, `sortiesSeen1938`, `markers1938`: 12
  of 12 (the planes' flag reads 50 of 62 at 1000 m/px, as on HEAD). New unit test `ball2dCache.test.ts`.
- **Next:** PLAN 7.5, the DONE condition's runs again on the new code (bench; then check:review, critic).

## 2026-11-01 — PLAN 7.182: the 1938 start's alliances, guarantees and wars drawn by the seed (ADR-785)

- **The user's request:** an option to randomize the starting alliances and wars. 1938 starts with 7 alliances,
  8 guarantees and 2 wars (`data/scenarios/1938/diplomacy.json`). Puppets kept, the user's choice.
- **Change:** `GameOptions.diplomacy` (`?diplo=random`), the "Alliances and wars" row of the new-game form where the
  scenario has diplomacy (title screen and settings panel), `randomDiplomacy` in `src/sim/gameOptions.ts`.
- **Tests:** new unit test in `tests/unit/gameOptions.test.ts`; `tests/e2e/gameOptions1938.spec.ts` extended (run by
  hand, green). Seeds 5–7 drew e.g. Germany–Czechoslovakia–Romania and Nicaragua–El Salvador–Honduras pacts, and
  wars Denmark on Germany's pact, Poland on Lithuania, Brazil on Argentina (with its guarantor China).
- **Next:** PLAN 7.5.

## 2026-11-01 — PLAN 7.183: the camera follows any formation clicked (ADR-786)

- **Built:** `MapView.pickedPoint` / `followPicked` and `PlayerControl.followPicked`: a click on a formation the
  player cannot order (another nation's, or any with no nation played) follows it where it is drawn, land or sea,
  until a pan, its panel closed (Escape, its button, a click on ground) or the formation gone (the point null).
- **AT:** new e2e `followPicked1938` (seed 1938, no nation played): a German division at T1 (1,500 m/px) and T2
  (150 m/px) and the British cruiser squadron at Gibraltar sent to Alexandria, at T1 and T2: after 48 ticks of the
  march the centre within 2 px of the drawn place, the camera moved with it; a pan ends it (the camera unchanged the
  next 24 ticks); Escape ends it. Red without the `game.tsx` change ("following after the click"). Evidence
  `docs/evidence/7.183/`.
- **Specs by hand:** `player1938`, `formationPanel1938`, `enemyClickPanel1938`, `airOrders1938`, `toBattle1938`
  (19 of 19); `buildArmour1938`, `carrierDeck1938`, `fightSeen1938`, `fleetFight1938`, `formationClickPanel1938`,
  `formationFight1938`, `hotkeys1938`, `playerActions1938`, `seamFight1938` green; `fightCamera1938` red once, green
  alone (as at the reviews). `stackPick1938` red: the first click now brings the stack to the middle; it clicks the
  stack where it is drawn once the camera settles (its check unchanged), green.
- **Next:** PLAN 7.184a.

## 2026-11-01 — PLAN 7.184a1: heroes' data, the option, the start (ADR-787); 7.184a split in three

- **Split:** 7.184a into a1 (data, option, start, guards), a2 (healing, return), a3 (strength), one cause a commit.
- **Built:** `data/units/heroes.json`, `data/templates/heroes.json` (14 each, read last), `data/scenarios/1938/heroes.json`
  (schema `HeroesFile` with cross-file checks), `hero` in the unit schema and `TemplateRule`, the names in `en.json`;
  `GameOptions.heroes`, `addHeroes1938` in the Sim after the options; `systems/heroes.ts` (`placeHeroes`,
  `raiseHero`); `World.heroRoster` / `World.heroes` saved while not empty; `destroyFormation` drops a hero's mark;
  guards in the lay-up, disband, fold and refill steps; queue and God placing refuse a hero (`NoSuch`), the page's
  build and placing lists leave them out.
- **AT (a1's part):** `tests/unit/heroes.test.ts` 5 of 5: off = no option (hash), no hero; on, 14 at tick 0 (sea within
  6 cells of its port on water, land at the capital), one land and one sea each of ENG FRA GER ITA JAP SOV USA;
  save/load keeps them; hero templates refused three ways; a month of every nation at −1,000 gold lays up fleets and
  disbands formations, no hero. The pin of seed 99 unchanged (the gate).
- **Tests extended for the heroes after the air:** `airTemplates`, `seaTemplates`, `breakdown` (the hero tanks break
  down as tanks; 14 sea types). The fold guard is a safeguard: a living hero is never hollow (its men are its crew).
- **Next:** PLAN 7.184a2.

## 2026-11-01 — PLAN 7.184a2: heroes heal and come back

- **Built:** `heroSystem` (after `collapse`, before `stats`): at each day's start a hero not engaged heals
  `HERO_HEAL_PER_DAY` 0.05 of its health (`1 − wound` of its element), a ship anywhere; `destroyFormation` sets the
  row's return (`heroLost`, `World.heroReturn`, saved while not empty) at `HERO_RETURN_HOURS` (1,440) on; at that hour
  or after, a row comes back whole while its nation lives and has a place: its start while held, else the capital
  (land) or the water of the held naval base nearest its start (sea); never two of a row. No hero, no work: the pin
  of seed 99 unchanged.
- **AT (a2's part):** `heroes.test.ts` 8 of 8: Hood at half heals to 0.75 in 5 days and whole by 20; the Maus removed
  is gone until its hour and back whole at Berlin the tick after, a saved-and-loaded copy the same hash; Germany
  collapsed: no Maus or Bismarck 61 days on, the Maus back within two hours of the revival, one of a row.
- **Next:** PLAN 7.184a3.

## 2026-11-01 — PLAN 7.184a3: the heroes' strength (ADR-788); 7.184a done

- **Cause found:** a land hero is one tank, and armour lost whole tanks by a draw (PLAN 7.23a): the Maus went from
  full to lost on one hit. A hero's tank now carries its wound (`combat.ts`). At sea one element sinks at most one
  target an hour, and eight destroyers' torpedoes ignore armour.
- **Figures:** sea heroes `hard` 1,100, hp 25,000; land heroes `soft`/`hard` 3,000, hp 700.
- **AT (`heroes.test.ts` 10 of 10, `tests/helpers/heroFight.ts`; probe `tools/diag/heroProbe.ts`):** Bismarck vs one
  battle squadron: least health 0.68, the squadron broke off at 7 of 16 ships; vs three: sunk on day 1. Maus attacked
  by one armoured division: least 0.74, the division on the retreat at 3,690 of 5,700 men; by three: lost on day 2.
  The pin unchanged (no hero with the option off).
- **Next:** PLAN 7.184b.

## 2026-11-01 — PLAN 7.184b1: `?heroes=on`, a hero's tag its name (ADR-789); 7.184b split in three

- **Split:** 7.184b into b1 (URL, the view's heroes, the tag's name), b2 (T2/T3 sprites, both looks), b3 (T0
  counter, T1 marker, bench G), one cause a commit.
- **Built:** `optionsFromUrl` / `newGameUrl` carry `heroes=on`; `MapView.formationName` gives a hero's name alone;
  `MapView.heroFormations()`.
- **AT:** new e2e `heroes1938` (by hand, green): 14 hero formations with `heroes=on`; at 150 m/px Yamato's tag reads
  "Yamato" and the Maus's "Maus" (`docs/evidence/7.184b/b1-tag-*.png`). `gameUrl.test.ts` 10 of 10 (a new case).
- **Next:** PLAN 7.184b2.

## 2026-11-01 — PLAN 7.184b2: a hero's sprite twice its kind's at T2 and T3, both looks (ADR-789)

- **Built:** `HERO_BIT` / `HERO_SCALE` (`ballShader.ts`): both shaders multiply a sprite's size after its clamp when
  the instance's state has the bit; `MapView` sets it for a hero's element, figures and stand-in, a turret and a wake
  take their hull's (`appendWakes` takes the states). The tag box, `elementBallPx` and `shipHullPx` follow.
- **AT (`heroes1938`'s second test, by hand green; `docs/evidence/7.184b/b2-sizes.txt`, `b2-*.png`):** each sprite
  drawn alone: Classic T2 Yamato 1.995 ×, Maus 1.999; T3 1.976, 1.999; Countryball T2 1.923, 2.000; T3 2.000, 2.029
  (bar 1.9–2.1). Sprites of a squadron overlap at T2 and a company's tanks touch at T3: measured on the scene they
  were clusters, hence the draw alone.
- **Specs by hand:** `countryballs1938` (7 of 7), `armourT21938`, `closeZoom1938` (4 of 4) green.
- **Next:** PLAN 7.184b3.

## 2026-11-01 — PLAN 7.184b3: heroes' T0 counters and T1 markers (ADR-789); bench G's bar missed (ADR-790, BLOCKERS)

- **Built:** `CounterLayer.draw`'s `heroes`: a hero its own counter, 2 ×, its name, not folded, above, stepping clear
  of another hero's; drawn once into a picture and copied (`heroPictures`). `MarkerInput.hero`: 2 × marker, out of the
  stacks, drawn last. `symbolOf`: a land hero is armour (the O-I had the rifle cross; `unitLooks.test.ts`). Bench G
  `--heroes`.
- **AT (`heroes1938`'s third test, by hand green; `b3-sizes.txt`, `b3-*.png`):** T0 (5,000 m/px) counter height 28
  against 14, T1 (1,000 m/px) marker 52 × 82 against 26 × 41, Yamato and the Maus, both looks; the counter reads the
  name; the marker stands for itself alone.
- **Bench G (GPU, alternating pairs, one build):** painted each frame: off 318.1/312.1/311.9, on 299.2/301.6/294.9;
  cached: off 317.3/314.1/318.2, on 307.0/308.7/311.9 fps, p95 4.8 ms. Bar 311 missed by 0.6 % on the mean: BLOCKERS,
  ADR-790 (the user's). T2 unchanged (168–175 both).
- **Specs by hand:** `counters1938`, `countersRest1938`, `markerStacks1938`, `markers1938`, `navalCounter1938`,
  `retreatMarker1938`, `stackBlocks1938`, `stackPick1938`, `labels1938`, `countryballs1938`: 21 of 21 green.
- **Next:** PLAN 7.184c (7.184b3 open on ADR-790).

## 2026-11-01 — PLAN 7.184c: the heroes in a nation's Overview (ADR-791)

- **Built:** `HeroStat` / `NationStat.heroes` (worker stats from the roster), the "Heroes" block first in the
  Overview (`NationPanel.tsx`, styles, `en.json`), `PlayerControl.openHero` (the formation's panel, the follow).
- **AT (`heroes1938`'s fourth test, by hand green; `docs/evidence/7.184c/`):** Japan's Overview opens with
  `panel-heroes`, 2 rows (Yamato, O-I, 100 %); a click on Yamato's row from Europe at 1,500 m/px opens its panel and
  after 24 ticks the view's centre is within 2 px of it; Yamato removed: its row reads "returns in 60 days", disabled;
  no block for Poland, none for Japan with the option off.
- **Specs by hand:** `nationPanel1938`, `followPicked1938` green.
- **Next:** PLAN 7.184d (7.184b3 waits on ADR-790).

## 2026-11-01 — PLAN 7.184d: the heroes option in the new-game form and the settings panel

- **Built:** `ScenarioInfo.heroes` (1938: its roster is not empty), `NewGameForm`'s "Heroes" row (`opt-heroes`, Off by
  default; its hint names the 14), passed by the settings panel and the title screen; off is no option and no URL
  parameter (`?heroes=on` came with 7.184b1).
- **AT:** `gameOptions1938` (3 of 3): `opt-heroes` Off at first, On → `heroes=on` in the URL and 14 heroes on the
  page; the panel starts from On, Off → no `heroes` in the URL and none on the page. `gameOptions.test.ts` 6 of 6
  (a new case: none by default or off, the same hash as no option; 14 on, the same per seed).
  `docs/evidence/7.184d/settings-heroes.png`.
- **Specs by hand:** `settings1938`, `title` (14 of 14).
- **Next:** PLAN 7.184e (7.184b3 waits on ADR-790).

## 2026-11-02 — PLAN 7.184e: HEAD read first; the AT's 30 % out of reach at sea (ADR-792, BLOCKERS)

- **Read** (`tools/diag/heroBattle.ts`, new; 1461–1465 × 3 years, heroes on, HEAD): heroes in battle on land
  0.000–0.207 of their days at war, at sea 0.000–0.123. The ceiling (any formation of the nation in the hero's domain
  in battle that day): sea 0.003–0.172 on all 35, land 0.261–0.903 (`docs/evidence/7.184e/head-read.md`).
- **Not built:** no sea hero can meet 0.30 whatever the AI does; the bar is the user's (ADR-792: (a) against the
  ceiling, recommended; (b) land only; (c) close not done). Nothing in `src/` changed.
- **Next:** waits on ADR-790 (7.184b3) and ADR-792 (7.184e); then PLAN 7.5.

## 2026-11-02 — the user's decisions: ADR-790 (a), ADR-792 (a)

- **ADR-790 (a):** 7.184b3's bench bar read as heroes on ≥ 0.97 × heroes off on one build: 0.977, 7.184b3 and 7.184b
  ticked.
- **ADR-792 (a):** 7.184e's AT against the ceiling (land ≥ 50 % of its army's fighting days; sea with its largest
  fleet ≥ 50 % of days and in ≥ 50 % of its battle days).
- **Next:** PLAN 7.184e.

## 2026-11-02 — PLAN 7.184e: the rules built, the AT missed (ADR-793, BLOCKERS)

- **Built (not committed):** the land hero out of the allotment, ordered onto the attack cell of its nation's most
  threatened own sector (`operational.ts`, `HERO_TRIES` 3); the sea hero after its nation's largest other fleet every
  day, after the naval plans (`naval.ts`, `heroFleets` / `sailWith`). Two unit tests (`heroes.test.ts`), red without.
- **AT run** (`tools/diag/heroBattle.ts` with the AT's columns; `docs/evidence/7.184e/at-run.md`): land `ofArmy` mean
  0.161, ≥ 0.5 on 1 of 69 (HEAD on 1461–1465 0.158, the rules 0.148); sea `with` 0.711, 50 of 70 (HEAD 0.603 → 0.721
  on 1461–1465), `ofFleet` 0.828, 57 of 64. The sweep:quick smoke not run: the rules are not kept yet.
- **Next:** ADR-793 waits on the user (keep the sea rule, drop the land one, a task for the cause: recommended).

## 2026-11-02 — ADR-793 (a): the sea heroes' rule kept, the land rule dropped; 7.184e closed not done, PLAN 7.184 done

- **Committed:** `naval.ts` `heroFleets` / `sailWith` (a sea hero at war sails after its nation's largest other fleet
  every day, after the naval plans) and its unit test (red without). The land rule is not in (`operational.ts` as
  HEAD). Pin unchanged (the gate).
- **Filed:** PLAN 7.185, a land hero in its army's battles (read the cause first), with 7.184e's sweep:quick smoke.
- **Next:** PLAN 7.185.

## 2026-11-02 — PLAN 7.185: the cause read, a rule tried, the AT missed (ADR-794, BLOCKERS)

- **Read** (`tools/diag/heroLandWhy.ts`): on its army's fighting days a land hero fought 17 %, stood 38 %, marched 45 %;
  41 % of the days out of a fight it was over 80 cells from the nearest.
- **Rule** (not committed): `joinFights`, onto the enemy formation by its army's nearest fight. AT, 1471–1480 × 3: land
  `ofArmy` 0.201, ≥ 0.5 on 1 of 70; sea `with` 58 of 70, `ofFleet` 50 of 58 (86 %; 7.184e's 57 of 64, 89 %).
- **Causes** (`tools/diag/heroCeiling.ts`): the regulars' best 0.29–0.72, top decile 0.05–0.56 (the hero at or above it
  in 13 of 30 lives); refused orders strand a hero (Japan's O-I, 1471: 698 refused, a year still).
- **Next:** ADR-794 waits on the user (the bar to the top-decile regular, keep the rule, the refusals: recommended).

## 2026-11-02 — PLAN 7.185 under ADR-794 (a): the refusals' fallback; the AT missed by 3 points (ADR-795, BLOCKERS)

- **Rule** (not committed): `joinFights`, and refused at every enemy target, the cells of the fights themselves. Unit
  test (`heroes.test.ts`, the Maus's first march at war with Poland) red without the rule.
- **AT** (1481–1490 × 3, `tools/diag/heroCeiling.ts`): 110 of 172 lives at or above the top-decile regular (0.640, bar
  2/3); Britain 10 of 30, the United States 2 of 11, the rest 98 of 131. Sea `with` 57 of 70, `ofFleet` 49 of 59 (83 %).
- **Tools:** the sweep takes `--heroes on` (`tools/sweep/run.ts`, `seed.ts`); the smoke not run yet.
- **Next:** ADR-795 waits on the user (commit the rule, close not done, a task for the heroes overseas: recommended).

## 2026-11-02 — ADR-795 (a): the land heroes' rule committed; 7.185 closed not done

- **Committed:** `joinFights` (`operational.ts`): at war a land hero is ordered onto the enemy formation by its army's
  nearest fight, 3 tried, and refused at each, onto the fights' own cells; its unit test (red without). Pin unchanged.
- **Filed:** PLAN 7.186, a land hero overseas (Britain, the United States), with the sweep:quick smoke.
- **Next:** PLAN 7.186.

## 2026-11-02 — PLAN 7.186: the crossing by sea tried; no better than HEAD (ADR-796, BLOCKERS)

- **Rule** (not committed): a land hero with no way over land goes by sea to its army's nearest fight on another land
  (`orderMove`'s `byPort`).
- **AT**, 1491–1500 × 3: 93 of 170 lives at or above the top decile (0.547); HEAD on the same seeds 113 of 195 (0.579).
  Britain and the United States 13 of 42 (HEAD 20 of 55). Sea `with` 45 of 70, `ofFleet` 54 of 61.
- **Next:** ADR-796 waits on the user (drop it, close the heroes' AI not done: recommended); the smoke on HEAD.

## 2026-11-02 — ADR-796 (a): the crossing dropped; 7.186 closed not done, the heroes' AI with it

- **Kept:** the sea hero with its largest fleet (7.184e), the land hero to its army's nearest fight (7.185).
- **Smoke:** sweep:quick with heroes off and on, running on HEAD; reported when done.
- **Next:** PLAN 7.5 (the critic runs).

## 2026-11-02 — the heroes' smoke: sweep:quick with heroes off and on (PLAN 7.184e–7.186)

- **Run** (seeds 1–10 × 20, HEAD ec098292's rules; `docs/evidence/7.186/2026-11-02-sweep-heroes-{off,on}.md`): limits
  7 of 10 off, 8 of 10 on; every failure the largest income ≥ 40 % (the open one of done23, BLOCKERS). Riser and
  faller 10 of 10 both, no break-up, no stasis; nukes 9 / 10 of 10.
- **Riser and faller:** off, the largest riser varied (GER 2, USA 2, CHI 2, IRQ 2, AUT, ARG), the faller ENG 4, SOV 4,
  CHI 2; on, the largest riser GER in 7 of 10 (× 11.8 to × 23.4), USA 2, NED, COL; the faller BRA 3, ENG 2, ITA 2, FRA,
  CHI, SOV. Germany rises more with the heroes on (the Maus and the Bismarck): reported, not judged (ADR-58).
- **Next:** PLAN 7.5.
- **2026-11-02 · critic run 24 (on `82d428c1`):** check:review green after shipMarks1938's T3 went on the known reds
  (red twice in the review at 16.5 px, bar 17; 8 of 8 by hand; BLOCKERS). Scores: map 7, diplomacy **6** (was 7), emergent
  7, God 7, editor 7, stats 7, UI 7, performance 7, stability 7; zoom 8, naval 8, tanks 8, aircraft 8, nukes 8. Blocking 1
  (R24-B1: random diplomacy leaves Japan occupying China at peace). Filed PLAN 7.187 (R24-B1) and 7.188 (diplomacy 6).
  The default world unchanged (seed 7019's 20 yearly hashes equal run 23's).
- **2026-11-02 · PLAN 7.187 (R24-B1):** with "Alliances and wars: random" the scenario's wars now end as a white peace
  would: `randomDiplomacy` gives the land a side holds of the other's back to its owner before it clears them; the
  armies left in foreign land march home at the day's start (`repatriationSystem`). AT: land held at peace 0 at days
  0, 30, 180 on 1517, 3739, 8821 and 1501–1510 (39 of 39; `docs/evidence/7.187/at-run.md`, `tools/diag/peaceHeld.ts`);
  the unit test red without (1,345 cells on 1517). The default path is untouched (seed 99's pin unchanged).
- **2026-11-02 · PLAN 7.188 (diplomacy 6, ADR-797):** in `declareWar` a pledge binds as a bond (a nation called
  against one it guarantees, or that guarantees it, stays out; a pledge between the sides lapses), and an attacker on
  one side with a defender in an older war leaves it (`leaveWarsWhere`). The nation menu offers no alliance at war.
  AT (`docs/evidence/7.188/at-run.md`): no guarantor at war with its own to day 30 on 13 of 13 seeds (the critic's 3
  of 3 before); the critic's freed-puppet case and the menu as tests, red before. Pin dc41c283 → a7946f81.
  `farWait1938` re-aimed to seed 4 (day 255); seed 3's first wait (formation 820, day 253) is not taken: the plan's
  sector orders, outside ADR-703's wait, are refused 4 times while it waits (a gap of ADR-703's scope, not filed).
- **Next:** PLAN 7.5 (the critic again: diplomacy's blocking and its dimension task are done).

## 2026-11-02 — PLAN 7.5: the review before critic run 25 red on the fleet guard (ADR-798 proposed)
- `npm run check:review` on 5d7b214b: green but `tests/sweep/aiSweep1`, red twice: 24 of 197 fleets of the start
  stand after one year, floor 25 (ADR-633); seeds 2 and 3 stand 70 and 71. The browser reds (fightCamera,
  seaRow, shipMarks T3) went green alone.
- Why (`tools/diag/fleetYear.ts`, against ac449e8d): 7.188 keeps Czechoslovakia out of the Soviet war on Romania,
  which ends 5 days earlier; the United States' war on Romania no longer ends with it, and 27 American fleets
  sail on days 90–120. No rule broken; the history moved. Not a machine red.
- **Next:** waits on ADR-798 (the guard's floor), then PLAN 7.5's critic run 25.

## 2026-11-02 — ADR-798 (a): the fleet guard's floor a tenth of the start's fleets
- `tests/helpers/aiSweep.ts`: fleets of the start standing after one year ≥ `ceil(start / 10)` (20 of 197), for 25.
  Seeds 1–3 stood 24, 70, 71 on the review of 5d7b214b. No sim change.
- **Next:** PLAN 7.5: the review again, then critic run 25.

## 2026-11-02 — Critic run 25 on e4386478: diplomacy 6, one blocking; PLAN 7.189, 7.190
- `npm run check:review` green (seaRow's known red only). Scores: mapVisuals 7, diplomacy 6, emergent 7, God 7,
  editor 7, stats 7, UI 7, performance 7, stability 7; semantic zoom 8, naval 8, tanks 8, aircraft 8, AI nukes 8.
  Blocking 1: R25-B1 (declaring war on a war partner leaves the old war with no peace, 7.188's leave rule).
- R24-B1 and the run-24 diplomacy defects verified fixed. PLAN 7.189 (R25-B1) and 7.190 (diplomacy: guarantees shown,
  a war left logged) before 7.5. The report records ADR-798 as a design objection (no score moved).
- **Next:** PLAN 7.189.

## 2026-11-02 — PLAN 7.189 (R25-B1, ADR-799): no war on a partner in a war
- `whyNotWar` refuses a war between two on one side of a war (`Refusal.Beside`; `forceWar` breaks nothing of it); a
  nation called against its partner stays out. 7.188's leave in `declareWar` is gone. Menus: "Fights beside you",
  the war greyed with the reason.
- AT (`docs/evidence/7.189/at-run.md`): 0 of 6 of the critic's EXIT and COBEL cases leave (e4386478: 6 of 6). Four
  unit tests red on e4386478, a standing test; the Albania test reads the refusal; the forceWar overrun case in its
  own world. Unit 2041 of 2041 (the 1938 build-time test 2017 ms under the whole suite, green alone); pin unchanged.
- **Next:** PLAN 7.190.

## 2026-11-02 — PLAN 7.190 (diplomacy 6, ADR-800): the pledges shown; a lapse and a war left logged
- The nation panel lists "Guarantees" and "Guaranteed by" (the statistics message's `guarantees`, `guarantors`).
  New history rows: `GuaranteeLapsed` after a declaration between a guarantor and its target, `WarLeft` when a bond
  takes a nation out of a war that goes on.
- AT (`docs/evidence/7.190/at-run.md`): the 8 guarantees of the start in both panels on 3739 (e2e, red on e4386478);
  the rows' words in unit tests (red on e4386478); 1 of 1 lapse with its row on 1522–1531 to day 60. Unit 2041 of
  2041; e2e guarantees, history, nation panel, puppets 7 of 7; pin unchanged.
- **Next:** PLAN 7.5 (the critic again: R25-B1 and diplomacy's dimension task done).

## 2026-11-02 — Critic run 26 on 33c84306: diplomacy 6, one blocking; PLAN 7.191, 7.192
- `npm run check:review` green (0 known red). Scores: mapVisuals 7, diplomacy 6, emergent 7, God 7, editor 7, stats 7,
  UI 7, performance 7, stability 7; semantic zoom 8, naval 8, tanks 8, aircraft 8, AI nukes 8.
  Blocking 1: R26-B1 (7.189's `Beside` refusal stops a puppet's or ally's break and a revolt's war of independence).
- R25-B1 and run 25's non-blocking 1 and 9 verified fixed. PLAN 7.191 (R26-B1) and 7.192 (diplomacy: ticker rows,
  the bond in the standing, the alliance proposal greyed) before 7.5.
- **Next:** PLAN 7.191.

## 2026-11-02 — PLAN 7.191 (R26-B1, ADR-801): a bond's break wins over Beside; a rebel rises
- Changes:
  - `whyNotWarOn` names a bond before `Beside`.
  - `forceWar` with a bond first leaves the wars fought beside the defender or its overlord (`leaveWarsBeside`, the
    `leaveBondedWars` way, with `WarLeft` / `WarEnded` rows), then breaks the bond and declares.
  - A partner with no bond is refused before a truce breaks.
  - `puppetSystem`'s rebel leaves its overlord's wars, then declares.
  - `standingOf` names the bond before "beside".
- AT (`docs/evidence/7.191/at-run.md`):
  - On 7019, 2207, 5113, 9241, every 30 days: 0 refused for `Beside` (was 52–78 %), 0 nations beside an enemy after.
  - The critic's PR cases: Manchukuo and Albania freed and at war with their overlords, both by Force war and by revolt.
  - Unit tests red on 33c84306 (4); Poland on France still refused.
  - Unit 2042 of 2042; e2e 13 of 13; pin unchanged.
- **Next:** PLAN 7.192.

## 2026-11-02 — PLAN 7.192 (diplomacy 6, ADR-802): a war left and a revolt in the ticker; the bond and the shared war; the alliance greyed
- Changes:
  - `WarLeft` and `PuppetRevolt` are in `TICKER_KINDS`, with cues (peace, war).
  - A bond's standing with a partner reads "Allied · fights beside you" or "Your overlord · fights beside you".
  - `allyWhy` greys "Propose alliance" with its reason in the menu and the Actions tab.
  - The sim refuses a puppet's alliance with its overlord.
- AT (`docs/evidence/7.192/at-run.md`):
  - Unit tests red on 33c84306; `allyWhy` agrees with the sim on 72 of 72 pairs.
  - e2e `bondsMenu1938`: Manchukuo's menu of Japan, the alliance greyed, Force war's exit in the ticker.
  - Unit 2043 of 2044 (territory's timing bar under load; green alone); e2e 19 of 19; pin unchanged.
- The loop stops here at the user's request, before PLAN 7.5 (critic run 27).
- **Next:** PLAN 7.5: the review, then critic run 27.

## 2026-11-02 — ADR-803 (the user's decision): the critic loop shortened
- Runs 24–26 were one chain: each blocking issue was made by the fix before (7.182 → R24-B1, 7.188 → R25-B1,
  7.189 → R26-B1). The rules of war and peace are now checked together: `tests/helpers/diploInvariants.ts`, with
  `tests/unit/diploInvariants{Scenario,Random}.test.ts` (7019, 2207, 8821, 3739; 81 s). 0 broken on 60d1ef05.
  Red on 82d428c1 (R24-B1), e4386478 (R25-B1, 23 and 26 silent exits) and 33c84306 (R26-B1).
- PROMPT step 2a: no `check:review` before a critic run; the last report's probes and the checker are re-run first.
  A sim rule change lists the ADRs and SPEC lines it could contradict, each with a test.
- **Next:** PLAN 7.5: the last report's probes (`critic/scripts/c26_*`) and the checker on HEAD, then critic run 27.

## 2026-11-02 — ADR-804 (the user's decision): release before new features; focused critic runs; less to read
- PROMPT 2a: a clean full report leads to the DONE checks and a `release-<date>` tag. Features asked for while 7.5
  is open wait in a batch after it, and the critic runs once a batch.
- CRITIC_PROMPT: a focused run on a fix round (the last report's cases, its dimensions under bar, what changed); the
  JSON's `mode`; the DONE CONDITION needs a full run.
- The war-and-peace checker with the heroes on and on the random world of 60
  (`tests/unit/diploInvariantsOptions.test.ts`), green.
- BLOCKERS.md 187 → 57 KB: the resolved entries in `docs/BLOCKERS_DONE.md`. SPEC, DECISIONS and PARITY are read by
  section, the rest searched.
- **Next:** PLAN 7.5: run 26's probes and the checker on HEAD, then critic run 27 (focused).

## 2026-11-02 — Critic run 27 on 15b7b08b (focused): no blocking issue, every dimension at its bar
- Before the run (ADR-803): run 26's probes on HEAD, outputs in `.cache/p27/`: PZ on 7019, 2207, 5113, 9241 × 365 days,
  0 refused for `Beside` (was 52–78 %); PR Manchukuo and Albania freed and at war with their overlords by Force war and
  by revolt; PP Manchukuo's menu "Your overlord · fights beside you", Force war live, at war after; FW2 2207 case B
  Albania freed. `tests/unit/diploInvariants*` 6 of 6.
- Scores: mapVisuals 7 (carried), diplomacy 7 (was 6), emergent 7, God 7, editor 7 (carried), stats 7, UI 7,
  performance 7 (carried), stability 7; semantic zoom, naval, tanks, aircraft, AI nukes 8 (carried). Blocking 0.
- No task filed. A focused report does not meet the DONE CONDITION (ADR-804).
- **Next:** PLAN 7.5: a full critic run.

## 2026-11-02 — Critic run 28 on 73c531b6 (full): no blocking issue, every dimension at its bar
- Scores: mapVisuals 7, diplomacy 7, emergent 7, God 7, editor 7, stats 7, UI 7, performance 7, stability 7; semantic
  zoom, naval, tanks, aircraft, AI nukes 8. Blocking 0. The build is byte-identical to run 27's; 7019 × 20 years, 20 of
  20 yearly hashes equal.
- Non-blocking, noted (no task filed): (1) no AI puppet revolts in 3 seeds × 30 years (loyalty floor 30.5 against the
  revolt line 20); (2) R27-N2, a bonded Force war calls a nation in beside its enemy: 3 cases on seed 1777, and
  `tools/diag/diploInvariants.ts` reports 7 broken pairs on seed 8209 (random diplomacy, heroes). God or player only.
- **Next:** PROMPT 2a's DONE checks: `npm run check:full`, the soak, the sweep, the scripted demo run, the budgets.

## 2026-11-03 — PLAN 7.5: the DONE CONDITION met on e57b5b98; release-2026-11-03
- **Critic:** run 28 (full) on 73c531b6: every parity dimension 7, every differentiator 8, blocking 0. e57b5b98 differs
  from 73c531b6 only in `critic/` and PROGRESS.md.
- **check:full** (`npm run check:review`): green, 0 red twice. Red once, green alone: `snapshot-perf`, `cityNames1938`,
  `fightCamera1938`, `nukeAlertTwo1938`, `nukeFx1938`. The scripted demos (zoom, sea, tank, air, nuclear specs) in it.
- **Soak** (1938, seed 99, 30 min, P-cores): green, 40.49 years (354,696 ticks), 5 saves and loads, no desync; final
  hash 6ef7972d.
- **Sweep** (`--first 1511 --tag done28`, 1511–1520 × 50 years, unseen): land changing controller in the last 5 years
  32.2–67.9 %, ≥ 1 % on 10 of 10 (the condition). Its own limits 6 of 10 (largest income over 40 % on 1514, 1516,
  1519, 1520; 1519's land 40.2 %): "no hegemon" struck, ADR-740, reported. Riser, faller, no break-up 10 of 10; nukes
  in 10 of 10. `docs/sweeps/2026-11-03-sweep-done28.md`.
- **Bench** (`bench -- G` alone; the full `bench` run's unjudged swiftshader setting timed out on a screenshot at
  1.5 fps): T0 321.7 fps (budget 60), p95 4.7 ms; T2 176.5 fps with 10,752 sprites (budget 30), p95 8.8 ms; SPEC GPU
  0.51 / 1.10 ms, draw CPU p50 2.1 / 4.6 ms: PASS.
- Evidence: `docs/evidence/7.5-done/release-2026-11-03/`.
- Every PLAN item checked. Tag `release-2026-11-03`.

## 2026-11-03 — ADR-805 (the user's decision): the loop's machinery retired after the release
- Untracked probe output deleted (~10.5 GB of `.cache/` and `critic/`); tracked `critic/` pruned to runs 26–28
  (3636 files of runs 1–25 leave the tree).
- Parity retired: `docs/PARITY.md` frozen at 48.1 %; `npm run parity`, its gate stage and its tests removed.
- The plan retired: PLAN.md frozen; `ROADMAP.md`; `critic:due`, `plan:archive`, `verify:phase0` and the gate's
  phase-review trigger removed. Gate 2032 of 2032 unit tests.
- PROGRESS and DECISIONS archived by month (`docs/history/`); PROMPT.md, CLAUDE.md, CRITIC_PROMPT.md rewritten;
  CHANGELOG.md; SPEC.md 1.0 (§1, contents, §2.2).
- Nightly GitHub Actions (`.github/workflows/nightly.yml`); first run started by hand (41612352441).

## 2026-11-03 — ROADMAP R1a (ADR-806): the relations graph and its layout
- `src/ui/relationGraph.ts`: nodes for the tied living nations and a hub per war; edges for war (by side),
  alliance (a star from the leader), guarantee, puppet bond, truce. `relationLayout.ts`: a force layout with no
  random numbers, warm-started from the last places.
- AT: `tests/unit/relationGraph.test.ts`, the worker's statistics message against the world: 0 mismatches either
  way on 7019, 2207, 3739 at days 1, 60, 365 (98 s with the checkpoints written).
- **Next:** R1b, the panel.

## 2026-11-03 — ROADMAP R1b (ADR-806): the relations panel
- The bottom bar's Relations button opens a centre panel (closed by the others, and by Escape): the graph in SVG,
  each nation its flag in a disc sized by its land, a ⚔ hub per war; a checkbox per kind, a nation's ties alone,
  a click on a line read in the footer, a click on a nation selects it. A nation with 4 or more lines is named.
- AT: `tests/e2e/relations1938.spec.ts` 2 of 2 (7019: puppet and guarantee lines equal the statistics message's;
  guarantees off, Japan's node unmoved; puppets alone; "Manchukuo is a puppet of Japan"; Japan selected; a year
  on, puppet lines and war hubs as the message; at 390 × 844 the panel inside the view). Screenshots in
  `docs/evidence/R1/`, looked at: the British and French empires as purple stars, Japan's and Spain's wars as hubs.
- Specs run by hand: phoneLayout1938, barNarrow1938, history1938, charts1938, hotkeys1938: 19 of 19.
- **Next:** R2, AI puppets revolt.

## 2026-11-03 — The nightly's unit job; ROADMAP R5 split for the heroes critic run
- Nightly run 41612352441: all green but two unit tests that time the runner (the 1938 build 2,151 ms against
  2,000; a snapshot 2.80 ms against 2). `tools/ci/unit.ts` judges the unit job as the gate does, with
  `tools/ci/runnerRed.json` as warnings. Re-run 41624512914: unit job green; the checker red on new seed 1009
  (scenario): R3's case (Greece's Force war on Turkey), added to R3.
- The user asked for a critic run on the heroes feature once the items are resolved: R5a, before the batch's run.

## 2026-11-03 — ROADMAP R2 (ADR-807): AI puppets revolt
- `src/sim/systems/puppets.ts`: while the overlord is losing, the loyalty target falls by SIZE_PENALTY (25) ×
  min(1, the puppet's income ÷ its overlord's); at peace ADR-31's. A rising puppet in its overlord's alliance leaves
  it before declaring (Tannu Tuva's rising on the Soviet Union was refused as between allies and only freed it).
- `tools/diag/puppetLoyalty.ts` (3 seeds × 30 years, risings against puppets made): SIZE_PENALTY 35: 11/87 (over),
  5/64, 4/97; 30: 10/75 (over), 5/82, 7/114; **25: 3/81, 2/72, 5/84**; 20: 1/85, 0/76, 3/74. A replayed loyalty
  drop on lost peaces made waves at every size, so none. 7 of the 10 risings at 25 are 1938's colonial bonds.
- Checker rule `rise` (`tests/helpers/diploInvariants.ts`): red on 7019 with a rising at loyalty < 60 and with none
  at all (21 broken lines each); green on the checker's seeds in the suite.
- Tests: `puppets.test.ts` 15 of 15 (3 new); `npm test` 2041 of 2042 (the build-time budget at 2,047 ms with the
  suite at once, green alone); `test:sweep` with the pin a7946f81 → 614c24dd. Tick cost: one division a puppet a
  month, not measurable.
- **Next:** R3, a bond's Force war calls no one in beside its enemy.

## 2026-11-03 — ROADMAP R3 (ADR-808): a nation called beside one it is at war with stays out
- Seed 1009 (the nightly's, day 91): Italy's AI on Turkey called Czechoslovakia, at war with Turkey and Iran, to
  Turkey's side as its guarantor. `declareWar`'s call judged a called nation against the other side only; now
  also against its own (`war.ts`, `foe`).
- Checker, every pair tried on days 60/200/350 to day 351: at 73c531b6 (critic run 28) 1777 21 → 0 with the fix
  patched in, 8209 0 → 0; HEAD 1009 2 → 0 (default run) and 0 with every pair, 1777 0.
- Tests: `calledBesideFoe.test.ts` (red without the fix); `npm test` 2043 of 2043; `test:sweep` 18 of 18, pin
  unchanged.
- **Next:** R4, checkers for the other systems.

## 2026-11-03 — ROADMAP R4a (ADR-809): the economy's checker
- `tests/helpers/worldInvariants.ts` and `tools/diag/worldInvariants.ts`: rule sets checked every hour of a run;
  `economy` first. The nightly gains a `systems` job (4 new seeds × 730 days).
- 730 days, 0 broken: 1938 7019, 2207, 3739, 1009; random 7, 11, 23, 8821 (38–57 s each). Red on two patched
  rules: income doubled (7019, 21 lines), no desertion (Poland 800 in debt: formation 558 kept 12,048 of 12,048
  units, at most 11,445.6).
- Found: a default after 6 bankrupt months with nothing to fragment voids the debt with no row (Poland, 7019 day
  151): ROADMAP R7. The rule's first form (whole men per formation) was wrong: desertion carries parts of units.
- `worldInvariantsEconomy.test.ts` 8 of 8 (88 s).
- **Next:** R4b, the navy.

## 2026-11-03 — ROADMAP R4b (ADR-809): the navy's checker
- Rule set `navy`: a fleet not under way on water; a formation aboard rides its own nation's fleet, where it is,
  or is lost by the next hour after its transports sink (the first form flagged every sunk group's men: the
  amphibious system loses them an hour later, by design); no fleet of a dead nation.
- 730 days, 0 broken on 1938 7019, 2207, 3739, 1009 and random 7, 11, 23, 8821. Red: the formation aboard not moved
  with its transports (7019 to day 400, 14 lines); kept afloat after they sank (England's 279, day 287).
- `worldInvariantsNavy.test.ts` 8 of 8.
- **Next:** R4c, air.

## 2026-11-03 — ROADMAP R4c (ADR-809): the air's checker
- Rule set `air`: a base held by its side or its nation's fleet (lost ones gone by the next hour); at the base
  unless ferrying; a sortie within range; an airbase wing's mission within range. First forms flagged carrier
  wings by design: missions kept while the carrier is out of range (the scheduler waits), and a fleet moved by
  the naval combat after the air system (in a battle, or in the hour one ends).
- 730 days, 0 broken on the eight worlds. Red on 7019 to day 400: a launch out of range (2 lines), a carrier's
  wing not moved (2), a taken airbase kept (19).
- `worldInvariantsAir.test.ts` 8 of 8.
- **Next:** R4d, nukes.

## 2026-11-03 — ROADMAP R4d, R4e (ADR-809, ADR-810): the nukes' and the bonds' checkers; R4 done
- Rule set `nukes`: launches need nukes allowed, a warhead, a means in range; the yield built; launches counted by
  rows; each end told; a stockpile grows only by a build at the day's pass. The checker's `acts` let a case script
  God's and a player's acts: on 7019 God arms the Soviet Union and it strikes by bomber (2 warheads left).
  20 years on 7019 and 8209 (and every rule set at once on 8209, random diplomacy, heroes): 0 broken. Red with a
  launch that spends no warhead and a missile without the tech (first form missed the first: a launch at 00:00
  passed as the day's build; a build now resets what was paid).
- Rule set `bonds`: red on HEAD, puppets of puppets on 1009, 2207, 3739 and random 11 within two years, which
  ADR-148's schema refuses. Fixed in `makePuppet` and `annexNation` (ADR-810: a realm has one head); the six
  worlds then 0 broken. "No alliance with an overlord" dropped as no rule (Tannu Tuva).
- Tests: `worldInvariantsNukes.test.ts`, `worldInvariantsBonds.test.ts` 8 of 8 each; `puppets.test.ts` 18 of 18
  (3 new, red before); `npm test` 2086 of 2086; `test:sweep` 18 of 18, the pin unchanged.
- **Next:** R5a, a critic run on heroes.

## 2026-11-03 — ROADMAP R5a: critic run 29 (heroes), full
- Commit 823cbf1b. Scores: mapVisuals 6, diplomacyWarDepth 7, emergentDynamics 7, godMode 7, editorScenarios 7,
  statsHistory 7, uiUxPolish 6, performance 7, stability 7; semanticZoom, naval, tanks, aircraft, aiNukes 8.
  3 blocking, all heroes': R29-B1 counters drawn up to 5,000 km off at the world zoom; B2 a hero handed over with
  its nation's land, never to return; B3 sea heroes wait years for a naval base. Filed as ROADMAP R8–R12 with the
  scores under the bar and the heroes' silent rows. Heroes on vs off, 10 seeds × 20 years: sea battles +87 %.
  R2 and R3 hold on the critic's counts (puppets rose on 7019 and 1777, 0 on 3163; 0 broken of 2,372 Force wars).
- **Next:** R8.

## 2026-11-03 — ROADMAP R8 (ADR-811): heroes drawn where they are
- `counters.ts`: a hero counter steps at most one height down or up; else it folds into the hero counter it
  covers ("Maus +2"). `MapView.formationPick`: hero counters first, a folded one opens its heroes in turn.
- AT: `heroes1938.spec.ts` R8 on 5521 at the start view, desk 1600×900 and phone 390×844: every hero counter
  within a step of its place (red before: 8 off), every hero in view on a counter, a click opens each, a second
  click on a folded one the next. Shots `docs/evidence/R8/` looked at: no counter off Europe. Spec 6 of 6.
- **Next:** R9.

## 2026-11-03 — ROADMAP R9 (ADR-812): a hero stays its nation's
- `annexInto` hands over no hero; `eliminateNation` takes it with its nation, its row waiting for a revival.
  Checker: a `heroes` rule set (its row's nation's, one formation a row, a row with no hero waiting to return);
  `worldInvariantsHeroes.test.ts` (4 seeds, 180 days), `heroes.test.ts` 2 new (red before).
- AT: the checker's heroes rules, 20 years, heroes on: red on HEAD on 4637 (day 1591: ITA's hero ENG's) and
  7603 (day 6044: GER's USA's); 0 broken on the critic's ten seeds (4111 … 7603) after.
- **Next:** R10.

## 2026-11-03 — ROADMAP R10 (ADR-813): sea heroes come back
- `returnPlace`: with no naval base held, the water of the nearest port held. `heroWaits`: why one past its day
  waits ('port', 'revival'), shown in its Overview row. Checker: a row past its day with a place is back in the hour.
- AT: `tools/diag/heroWaits.ts`, the critic's ten seeds × 20 years, heroes on: 0 broken, 0 days past a return
  with a place. Days waiting past 60 (10 seeds): Richelieu 542 (critic: 16,123), Sovetsky Soyuz 0 (5,551),
  Bismarck 3,568 and Roma 3,050 with no port held, 5,753 and 5,649 with the nation dead. The row's text is
  unit-tested through `heroWaits`, not in a page.
- Seen on the way (R29-N5, non-blocking): sea heroes lost 83–351 times in the ten runs.
- **Next:** R11.

## 2026-11-03 — ROADMAP R11 (ADR-814): what the heroes and the graph read
- Snapshot column `health` (a hero's percent); the formation panel's Health row; a hero's T1 marker and T2 tag
  read its health. The heroes option's hint as text. War lines name their side ("leads its side, with …",
  "alone on its side"). The graph zooms and pans (wheel, pinch, drag, −/+). The bar one row from 1024 px.
- AT: `heroesRead1938.spec.ts` (5): the Maus at 77 % after God's bomb reads 77 % in its panel (men 6 of 6),
  its marker and its tag, desk and phone; the hint visible on a phone; 60 war lines on 4111 at day 120, none
  "beside itself"; zoomed 2.25×, more names and twice the size; the bar one row at 1024, 1180, 1280, 1600.
  Shots `docs/evidence/R11/` looked at.
- **Next:** R12.

## 2026-11-03 — ROADMAP R12 (ADR-815): a hero's loss and return are told
- `HeroLost`, `HeroReturned`: history log and ticker kinds, a hero named by its roster row, the city near it;
  none on its nation's death.
- AT: `heroesRead1938.spec.ts` R12: the Bismarck removed by God on 1938, its ticker row "Germany lost Bismarck
  near …", 60 days on "Bismarck is back with Germany near Bremerhaven", both in History with their kinds, the
  row's Go to moves the camera. `heroes.test.ts`: the log's rows at the hero's place, none at Germany's collapse.
  Shots `docs/evidence/R11/r12-*` looked at.
- R8–R12 done: **Next:** R5b, the critic's full run and the release.

## 2026-11-03 — ROADMAP R5b: critic run 30, focused
- Commit d6e1bb1e. Focused by the brief's rule (run 29 blocking, every commit since R8–R12), so it does not close R5b.
  Scores: mapVisuals 7 (up), uiUxPolish 7 (up), diplomacyWarDepth, emergentDynamics, godMode, editorScenarios,
  statsHistory, performance, stability 7; semanticZoom, naval, tanks, aircraft, aiNukes 8. Every score at its bar.
  R8–R12 hold on the critic's seeds (0 days served for another nation in 13 seeds; sea-hero waits 39,420 → 9,219 days).
  3 blocking, filed as R13–R15: Sovetsky Soyuz back on the Caspian or Lake Onega for good (B2); folded heroes a tap
  cannot reach on a phone, and folds across nations (B1); the checker's air rules break with heroes on (B3).
- **Next:** R13.

## 2026-11-03 — ROADMAP R13 (ADR-816): a sea hero comes back to the open sea
- A sea hero's return port must be on its start's basin, with water of the lane graph (no lake's); else it waits
  ("waits for a port on its sea"). Checker: a sea hero on water is in its start's basin (a passage over land is not
  judged: Suez gave every sea hero a false "basin 0" on the first try).
- Red with HEAD's return on 4637, 7603 (Caspian), 4111 (lake); with the fix 0 broken on 4637, 7603, 9001, 4111 × 20
  years. `heroes.test.ts` 17 of 17 (1 new). R7 moved into the batch after R15 (the user's request).
- **Next:** R14.

## 2026-11-03 — ROADMAP R14 (ADR-817): every folded hero reachable by touch
- A hero folds only into its own nation's hero counter; with none and no free step, it takes the step that covers the
  least. A fold's round is kept with the panel closed, so taps after closing open each hero in turn. A hero counter
  whose place is in view is drawn whole.
- `heroes1938.spec.ts` R14 (desk by mouse, phone by touch) red on HEAD, and red with only the layout fixed; green
  after; R8's test green. Shots looked at: every name reads, TOG II over the top of "Bismarck" on 5521.
- **Next:** R15.

## 2026-11-03 — ROADMAP R15 (ADR-818): carrier wings stay with their fleet
- A fleet moved after the air system's hour (closing in a sea battle of one hour, `closeOn`; set on its cell's water by
  a sail order, `orderSail`) left its carrier wings behind; `carryWings` now moves them. The checker's "kept a base
  lost an hour ago" compares the base (a wing fallen back to an airbase taken in the same hour had another).
- Red on HEAD on 5591 and 3373 random (heroes); 0 broken on seven seeds × 20 years with heroes. `carrierWingsMove1938`
  2 of 2 (red without the fix). Seed 99's pin unchanged.
- **Next:** R7.

## 2026-11-03 — ROADMAP R7 (ADR-819): a default says so
- A nation that defaults with nothing to fragment now has a History row, "Poland defaulted: its debts were voided"
  (`NationDefaulted`, b = the debt). The economy checker's exemption for a silent default is gone; red without the
  row on 7019 (Poland, day 151). `defaultRow1938.test.ts` 1 of 1 (red without). Seed 99's pin unchanged.
- **Next:** R5b, the full critic run.

## 2026-11-03 — ROADMAP R5b: critic run 31, full; no blocking issue
- Commit 4c546398. R13–R15 fix R30-B1–B3 on the critic's own seeds; R7's row in the page. 0 blocking; scores
  unchanged from run 30, every one at its bar (semanticZoom, naval, tanks, aircraft, aiNukes 8; the rest 7).
  Non-blocking R31-N1–N6 (heroes under the Ranking panel at a desk, two nations' counters overlapping a name, …).
- **Next:** the release checks (check:review, soak, sweep on unseen seeds, bench G).

## 2026-11-03 — ROADMAP R5b: the release checks on 4c546398; release-2026-11-03b (ADR-820)
- **Critic:** run 31 (full) on 4c546398: no blocking issue, every score at its bar. The release commit differs from it
  only in documents and `tools/gate/knownRed.json`.
- **Unit by hand first:** 2099 of 2099; sweep config 18 of 18.
- **check:review** (4c546398): green, 0 known red, 0 not known. Red once, green alone: `cityNames1938`,
  `fightCamera1938`, `nukeFx1938`, `seaRow1938` (Speed x1). shipMarks1938's T3 passed (destroyers 18 px, bar 17):
  it and seaRow's Speed x1 leave `knownRed.json` as their BLOCKERS entries say (moved to `docs/BLOCKERS_DONE.md`).
  The review's specs rewrote old evidence PNGs; restored.
- **Bench** (`bench -- G` alone): T0 322.3 fps (budget 60; last release 321.7), p95 4.7 ms; T2 173.4 fps with 10,752
  sprites (budget 30; last 176.5), p95 9.0 ms; SPEC GPU 0.52 / 1.08 ms, draw CPU p50 2.1 / 4.6 ms: PASS.
- **Soak** (1938, seed 99, 30 min, P-cores, heroes off): green, 36.45 years (319,344 ticks), 5 saves and loads, no
  desync; final hash bc135d38. Last release 40.49 years, the one before 34.24: within this machine's spread run to
  run (sequential timings drift ±10 %); critic run 31's headless ticks 4.1–5.8 ms against run 30's 3.7–5.7.
- **Sweep** (`--first 1551 --tag done31`, 1551–1560 × 50 years, unseen, heroes off): land changing controller in the
  last 5 years 24.3–53.3 %, ≥ 1 % on 10 of 10 (the release's condition). Its own limits 7 of 10 (largest income over
  40 % on 1551, 1553, 1556; "no hegemon" struck, ADR-740); riser, faller, no break-up 10 of 10; nukes in 10 of 10,
  fallout at most 1.85 %. `docs/sweeps/2026-11-04-sweep-done31.md`.
- CHANGELOG entry; Batch 1's items moved to `docs/history/ROADMAP-release-2026-11-03b.md`. Evidence
  `docs/evidence/R5b/`. Tag `release-2026-11-03b`.
- **Next:** R6 (Later), or a new batch from the user.

## 2026-11-03 — ROADMAP R6a (ADR-821): SPEC's references checked; §10 rewritten
- R6 split in ten parts by size (R6a–R6j). ADR-821 sets the rules of the rewrite: from the code outward, ADR cites kept,
  PLAN references and histories out, numbers only a rule's constants.
- `tools/spec/refs.ts`: every backticked path, `npm run` script and code name of a SPEC section must exist. Dry run on HEAD:
  17 misses over §2–§10 (§10: `npm run parity`, `critic:due`, `tools/gate/criticDue.ts`, `tools/parity`).
- §10 rewritten from `tools/gate/check.ts`, `review.ts`, `tools/headless/cli.ts`, `tools/soak/cli.ts`, `tools/sweep/`,
  `tools/bench/run.ts`, `src/app/testApi.ts`, `.github/workflows/nightly.yml`: the checkers, the nightly and the release
  added; parity, the critic's cadence and the phase reviews gone. §2.1: the editor's row (no `src/editor/`).
- Constants stated, read from: sweep limits `tools/sweep/criteria.ts:45–61` (MOVING_MIN 0.01, MAX_LAND 0.35, MAX_INCOME
  0.4, ALIVE 20–250, WAR_YEARS 0.8, RISER 1.5 and 0.01, FALLER 2/3, quorum 0.8, 50 years, BREAKUP 1.1 over 20, fallout
  0.5), sweep defaults `tools/sweep/run.ts:32–33` (50 years, 10 seeds), soak `tools/soak/cli.ts:19–21` (30 min, 5 min,
  COMPARE_DAYS 30), `E2E_CHUNK` 20 `tools/gate/review.ts:27`, reports kept 30 days `nightly.yml:80,154`.
- `tests/unit/specRefs.test.ts` 4 of 4 (§1, §2, §10 at 0 misses; red on HEAD's §10 with 6).
- **Next:** R6b.
- After the commit, two §10 lines read against the code: `zoomTo` is the `CameraController`'s (`controller`), not the
  view's; the headless year record (`YearMetrics`, `tools/headless/runner.ts:55`) has cells controlled and owned, not land.
  Fixed. ROADMAP: R6b and R6f say how a split section enters the test.
- Fix: `specRefs.test.ts` red on main from 7f7320d2 to cb52f5b5. Once committed, the test's own example of a stale name
  (`isCapitalOfNowhere`) was a word of the tracked code it searches; green before only because the file was untracked.
  The checker's own two files are left out of its corpus. 4 of 4.

## 2026-11-03 — ROADMAP R6b: SPEC §3.1–3.3 as the code is
- Three read-only read-throughs of the code against the old text (map and cells; provinces, cities, boot and ownership;
  sea zones, lanes and ports), each claim marked holds, wrong, gone or a measurement. Rewritten from them.
- Wrong or gone in the old text: world units are cells, not km; the cell layer had `flags` and `pressure` and lacked
  `econ`, `pop`, `supply`, `flip`; the sim never paints Urban; L terrain and all four elevation levels ship; no province
  file, buildings, city industry or victory points; air zones are ~300,000 km² regions (sea zones over water) and air
  superiority is a nation's; port levels are static, their state is bomb damage and blockade; lanes are built with the
  other map caches (`buildMapCaches`). Measured counts and timings out; the tests' held ranges kept.
- Constants stated, read from: `LAT_TOP_DEG` 80, `DEFAULT_W` 2048, `kmPerCell` `projection.ts:23–61`; `SHORE_NOISE` 0.35,
  `SURE_LAND` 0.85, `WAY_MARGIN_CELLS` 1 `landMask.ts:50,52,349`; `EARTH_R` `nav/grid.ts:21`; `STRAIT_EXTEND_CELLS` 4
  `sim/data/terrain.ts:61`; terrain thresholds `tools/data/terrain.ts:59–70`; `LAKE_MAX_SCALERANK` 7, `SHIP_MAX_W`
  `tools/data/run.ts:52,121`; `CITY_SNAP_CELLS` 2 `sim/data/cities.ts:34`; `CAPITAL_BIND_KM` 40 and the size tiers
  `tools/data/cities.ts:43,53–65`; label limits, `NAME_SIDES`, reach 40/26, `CAPITAL_REACH` 1.6, `NAME_CLEAR_PX` 2
  `cityLabels.ts:89–122`; `ZOOM_HYSTERESIS` 1.15, `FADE_MS` 250 `render/timing.ts:14,16`; `ZONE_KM2`, `ZONE_SPAN_KM`,
  `MIN_WATER_KM2`, `SEED_SNAP`, 16 rounds `seaZones.ts:42–54`; `MIN_NAMED_KM2` `tools/data/seas.ts:26`; `PASSAGE_SNAP`
  `lanes.ts:74`; `PORT_SNAP_CELLS` `ports.ts:58`; port levels `schemas.ts:269–284`; `AIR_ZONE_KM2` `airZones.ts:29`;
  `DISPLACED_CELLS` 2, `ISLET_REACH` 16 `ownership.ts:291,294`; `passageShut` `seaSupply.ts:95`.
- `specRefs.test.ts` 5 of 5 (§3 at 0 misses; 2 before, in the old §3.3).
- **Next:** R6c.

## 2026-11-03 — ROADMAP R6c: SPEC §3.4–3.7 as the code is
- Four read-only read-throughs (nations; diplomacy; military; tech and production), each claim marked against the code.
  Rewritten from them, 38 → 26 KB.
- Wrong or gone in the old text: the nation record (half its fields gone: industry, stability, relations, doctrine,
  allianceId; tech is a bit mask); the war record (`sides`, no `goal` or `leaders`); a revolt's neighbour is not chosen by
  the war test; puppets of an annexed nation go to the annexer's realm head (ADR-810); the march home's test; the
  formation and element records; air wings "from Phase 5" (198 at the start); research's cap 4.0, not 2.44; nuclear
  research no longer held back from everyone; a founded nation without its parent's nuclear techs; no industry input.
- Added: Force war, `foe`, pledges, `Beside`, `refusesSuit`, frontless wars, peace offers, `WarLeft`, `GuaranteeLapsed`,
  collapse and `NationDefaulted`, revival, the levy, muster points, shipyards and airfields, heroes.
- Found, filed as R16 (Later): traits' modifiers other than income and manpower act on nothing.
- Constants stated, read from: economy `src/sim/systems/economy.ts:38–63`; start gold `scenario1938.ts:93,102`; collapse and
  revival `systems/revival.ts:53–59`; `CAPITAL_SAFE_STEPS` `capitals.ts:284`; `START_GOLD`, `REBEL_AGGRESSION`
  `revolts.ts:96,98`; random world `randomWorld.ts:52–57`; war and peace `systems/war.ts:73–114,672`; peace offers
  `src/shared/peace.ts`; puppets `puppets.ts:32–46`; alliances `systems/alliances.ts:16–22`; strategic AI
  `ai/strategic.ts:47–62`; `REPATRIATE_CELLS` `movement.ts:92`; production `production.ts:53–64`; research
  `research.ts:28–34`; `NUKE_PROGRAMME_INCOME` `nuclear.ts:178`; `REFILL_MONTH` `ai/economic.ts`; `HOLLOW_MEN`, `MERGE_KM`
  `ai/hollow.ts:26–28`; `SLOT_SPACING` `core/pose.ts:14`; `ANCHOR_REACH_CELLS` `oob.ts:57`; `CRUISE_SHARE` `sail.ts:38`;
  `HERO_RETURN_HOURS`, `HERO_HEAL_PER_DAY` `heroes.ts:66,68`.
- `specRefs.test.ts` 5 of 5 (§3 whole at 0 misses).
- **Next:** R6d.

## 2026-11-03 — ROADMAP R6d: SPEC §4 as the code is
- Two read-only read-throughs (supply and movement; territory, capitals, cores, revolts), each claim marked against the
  code. Rewritten from them, 29 → 11 KB, as 4.1 supply, 4.2 land movement, 4.3 territory, 4.4 capitals, 4.5 cores,
  4.6 revolts.
- Wrong or gone in the old text: pressure's radius by type and org (it is a fixed 2, scaled); a garrison per province
  from spending (a flat 1 of defence; for revolts, a formation within 3 cells); stability (none); the capital moves to the
  largest city (the safest first); the owner changing only by peace (also revolts, revival, kin, capture, God); a small
  state "under 40 cells" (8,500 km²); rebels' 50 gold (150); an encircled division dry in 8–14 h (8–20); the supply
  network's whole-flood rules (since the part search); the march along cell centres (land points and ways).
- Added: sea-linked sources, the beach layer, air superiority's supply term, breakdown, liberation of cells, corridors,
  the hold scaled by map size, the field capital at war, overextension, nuclear unrest, God's revolts.
- Found, added to R16: the scenario's `revival.cooldownDays` is read by nothing.
- Constants stated, read from: `supply.ts:42–78,163`; `movement.ts:82–95,438–440,603`; `grid.ts:498–502`;
  `provinceGraph.ts:127,900`; `ORG_FIRE` `combat.ts:282`; `FALLOUT_SLOW` `nuclear.ts:541`; `territory.ts:42–45`;
  `CORRIDOR_PRESSURE`, `CORRIDOR_RATE` `majorBattles.ts:27–28`; `revolts.ts:66–98`; `NUKE_UNREST` `nuclear.ts:1738`; the
  system order `sim.ts` (`SYSTEM_NAMES_1938`).
- `specRefs.test.ts` 6 of 6.
- **Next:** R6e.

## 2026-11-03 — ROADMAP R6e: SPEC §5 as the code is
- One read-only read-through of combat, retreat, efficiency and Major Battles; rewritten from it, 11 → 7 KB.
- Wrong or gone in the old text: a battle record (battles are derived each hour; only Major Battles are records); air
  and naval units joining battles; a target held 4 h (the pick hour and 4 more); the old steps 1–5 (rate of fire,
  posture, surrender, entrenchment); the retreat point "3 cells from the enemy" (3 beyond the formation); "a quarter of
  its fire" in retreat; air superiority "read by nothing" (it is a fire factor); efficiency drifting by experience;
  the Major Battle threshold relative to the front (120,000 men), its corridor towards the loser's centroid (along
  loser − winner), a pulsing marker, a war-banner entry.
- Found, added to R16: `retreat.ts`'s header on the retreat point; the snapshot's `majors` read by no UI.
- Constants stated, read from: `combat.ts:43–47,282` and `data/combat.json` (`COMBINED_ARMS`, `AIR_SUPERIORITY`,
  `UNSCREENED`, `SUPPRESSED`, `IN_THE_OPEN`, retreat); `retreat.ts:67`; `efficiency.ts:27–36`; `majorBattles.ts:19–28`;
  `CONTACT_CELLS` `elements.ts:90`; `WITHDRAW_SPEED` `movement.ts:603`.
- `specRefs.test.ts` 7 of 7.
- **Next:** R6f.

## 2026-11-03 — ROADMAP R6f: SPEC §6.1–6.2 as the code is
- Two read-only read-throughs (armour; the navy); rewritten from them, 21 → 11 KB.
- Wrong or gone in the old text: tank years (heavy 1942, not 1943; medium-2 1941 and the MBT 1950 missing); armour
  "industry heavy" (industry is read by nothing); burning wrecks "not yet" (built); ports that repair ships (none do);
  detection by zone search (fleet to fleet); sea control by "recent wins" (hit points alone; carriers add none); a broken
  fleet sailing to its nation's port (its bloc's, by `waterKeys`); submarines sinking convoys (raids take gold); landings
  needing an escort and sea control (a zone no enemy holds), 2,000 men a transport (2,100), a repulsed landing landing
  there; bombardment by soft attack × 2.5 (effectiveness × 2.5); "air not yet".
- Constants stated, read from: `data/units/land.json`, `data/tech/armor.json`; `economic.ts:219–234`;
  `SPEARHEAD_ARMOUR` `operational.ts:143`; `navalCombat.ts:85–105,563`; `AIR_DETECTION` `airSuperiority.ts:75`;
  `seaControl.ts:28–66`; `RAID_PER_BOAT` `convoys.ts:22`; `CONVOY_ROWS` `economy.ts:241`; `BANK_REACH` `seaSupply.ts:74`;
  `amphibious.ts:51–55`; `BOMBARD_FIRE` `bombardment.ts:27`; `bombing.ts:23–33`; `naval.ts:74–78`.
- `specRefs.test.ts` 8 of 8 (§6 at 0 misses).
- **Next:** R6g.

## 2026-11-03 — ROADMAP R6g: SPEC §6.3–6.4 as the code is
- Two read-only read-throughs (aircraft; nuclear weapons); rewritten from them, 24 → 13 KB.
- Wrong or gone in the old text: missions beyond patrol, strike and supply (interception is no mission; strategic
  bombing is a strike's bombs); AA from buildings (elements only); wings "not built" (queued and bought by the AI);
  "33 more nations" (34); a rebase within range (twice the range); superiority "read by nothing" for supply, detection,
  bombing; missiles "hard to stop" (nothing stops one); the target value's fleets-in-port and Major Battle terms (none);
  retaliation summed (it is the largest); doctrine "from traits" (from aggression); fallout drifting (laid once, by the
  day's wind); relations hit with every nation (outrage and pariah rules in the strategic AI).
- The checker caught two names abbreviated in the draft (`FALLOUT_WIDTH_KM`, `NUKE_WEIGHED_LONG`/`_NONE`).
- Constants stated, read from: `airbases.ts:46`; `air.ts:186,281,358,420`; `airCombat.ts:21–28,181–183,326–354`;
  `airSuperiority.ts:13–94`; `bombing.ts:21–33`; `airLift.ts:28–62`; `ai/air.ts:66–69`; `PLAYER_MISSION_HOURS`
  `playerOrders.ts:19`; `economic.ts:265,276`; `nuclear.ts:178–216,426–434,530–543,632–692,1084–1134,1536,1734–1810`;
  `THERMO_YIELD`, `BLAST_KM` `src/shared/nuclear.ts`; `historyText.ts:19,21`.
- `specRefs.test.ts` 8 of 8 (§6 whole at 0 misses).
- **Next:** R6h.

## 2026-11-03 — ROADMAP R6h: SPEC §7 as the code is
- Three read-only read-throughs (strategic and economic AI; the operational AI in two halves); rewritten from them,
  29 → 9 KB, as 7.1 layers, 7.2 strategic, 7.3 operational, 7.4 pointers to the navy, invasion and air AI (§6), 7.5
  economic, 7.6 the long run.
- Wrong or gone in the old text: AI actions it never takes (suing, accepting peace, guarantees, puppets); "threat from the
  largest nation" (the top earner); the strategic AI first in the tick (second); the operational AI every 6 h (each nation
  once a day); defensive postures (none); fleets escorting convoys (landings); air CAS on Major Battles (the nearest
  engaged enemy); the landing lock (a landing at sea for an enemy cell, the ferry still runs); marches from afar to the
  own front only (partners' too) and their "nobody" (over 1,500 men); a corridor refusal while open and shut are the
  same (re-planned); fleets laid up "in port" (standing); the economic AI daily (monthly); admin cost by non-core land
  (all land held); coalitions by industry (income); collapse on capital loss (six bankrupt months).
- Constants stated, read from: `ai/strategic.ts:47–100`; `ai/layers.ts:15–39`; `ai/operational.ts:86–147`, `takeMen`
  `:135`; `ai/economic.ts:149–297,564`; `NAVY_WEIGHT` `seaControl.ts:66`; `POCKET_CELLS` `nav/grid.ts:401`.
- `specRefs.test.ts` 9 of 9.
- **Next:** R6i.

## 2026-11-03 — ROADMAP R6i: SPEC §8 as the code is
- Three read-only read-throughs (tiers and looks; handovers and effects; interest management, precision, map, budgets);
  rewritten from them, 43 → 10 KB, as 8.1 tiers, 8.2 forces by tier, 8.3 effects, 8.4 the map, 8.5 interest
  management, 8.6 budgets.
- Wrong or gone in the old text: tiers as overlapping bands (a step function; the 1.5 band unlisted); fronts glowing,
  province borders, supply lanes (none drawn); sea and air zones as a T1 layer (map modes); a plane as a ball with
  wings (a plane with a ball on it); `GROUND_CAP` 12,000 (24,000); stack nudge 6 px (10); wrecks 12 s (or 72 game
  hours, the later); "the count is always exact" (64 figures a whole battalion); T2 → T3 figures in the default look
  (balls have none); border width constant (grows with zoom); an origin per frame (one per upload); owner textures
  tiled (dirty tiles); `d / fwidth(d)` (analytic); coasts with the handover (with zoom); `spriteTint` one factor
  (lightness kept by HSL).
- Constants stated, read from: `timing.ts:12–16`; `markers.ts:101–110,156–157,234`; `individuals.ts:27–44,94–133,291`;
  `counters.ts:36,93–96,155–159`; `markerStacks.ts:49–113`; `MapView.ts:34–41,104–153`; `ballShader.ts:54–55,219–222`;
  `sorties.ts:218`; `ships.ts:66,98`; `elementSprite.ts:17–27`; `turrets.ts:40–44`; `fire.ts:33–40`; `wrecks.ts:17–40`;
  `hulls.ts:30–39`; `ground.ts:49–89`; `GroundInstances.ts:113`; `scatter.ts:28`; `MapRenderer.ts:95`; `landMask.ts:50`;
  `tags.ts:74–90`; `subscription.ts:5`; `server.ts:90,98`; `protocol.ts:234–239`; `tools/bench/game.ts:16–22`.
- `specRefs.test.ts` 10 of 10.
- **Next:** R6j.

## 2026-11-03 — ROADMAP R6j: SPEC §9 as the code is; R6 done
- Three read-only read-throughs (panels, map modes, God Mode and player control; editor, files, statistics, history,
  ticker, sound; title screen, settings, options, keys, the least view); rewritten from them, 39 → 11 KB, as 9.1 start
  and settings, 9.2 screen and controls, 9.3 player control, 9.4 God Mode, 9.5 editor, 9.6 statistics and history.
- Wrong or gone in the old text: an Actions/Economy panel (tabs of the nation panel); an events counter; five ranking
  lists (twelve); fallout "still planned" (built) and a supply map mode (none); God's map tools in its tab (a bottom-bar
  row) and placing in the Actions tab (the God tab); the player's war as `declareWar` (`forceWar`); the played nation
  on the bottom bar (the top bar); a banner flying to 20 m/px (to hold the battle); terrain edits dropping paths (kept);
  flags falling back to plain colour (a founded flag); `stats.rows` (`stats.km2`); five sound cues (eight); the ticker's
  kinds; speed on 1–5 (`,` and `.`; the digits pick map modes); a locale picker (English alone); a scenario file only
  at its own map size (any the map offers); the URL options (`diplo`, `heroes`, `size` missing).
- Filed to R16: `player.ts`'s header (AI off on take), `air.ts`'s header (no land rule reads a wing; owed since R6g),
  `exportScenario` keeping `stats.nuke`.
- Constants stated, read from: `settings.ts:11–19`; `scenarios.ts:18,138`; `tools/data/preview.ts:15–16,58`;
  `autosave.ts:15`; `CameraController.ts:49–51`; `MapView.ts:120–122,145`; `mapModes.ts:2,71`; `MapLegend.tsx:7`;
  `server.ts:99`; `player.ts:46–48`; `StatsRanking.tsx:17`; `WarBanners.tsx:10–12`; `battleView.ts:17`;
  `shared/history.ts:197–199`; `hud.ts:24,29`; `peace.ts:8–10`; `playerOrders.ts:19`; `commands.ts:319–322`;
  `GodTab.tsx:11–12`; `editor.ts:23–25`; `importImage.ts:8`; `scenarioEdit.ts:16`; `placeForces.ts:60`;
  `flagPixels.ts:7–8`; `scenarioFile.ts:16`; `history.ts:12`; `HistoryPanel.tsx:8`.
- `specRefs.test.ts` 11 of 11: every section of SPEC.md at 0 misses. R6 done.
- **Next:** R16 is the first open item, and it is the user's decision (make the traits act or drop them).

## 2026-11-03 — ROADMAP R16a: traits are state, shown and set by God (ADR-822)
- The user's decision on R16: make the trait modifiers act where the game has a rule, drop the rest, let God set a
  nation's traits; old saves need not load. Split into R16a (the store, no rule change) and R16b (the effects).
- Found while planning: no screen showed traits (their descriptions in `en.json` were unused), and the game kept no
  nation's traits after the start, only the two multipliers. Corrected what I had told the user.
- `nations.traits` (u16 mask, `src/shared/traits.ts`), set by the 1938 scenario, random traits and `setTraits`
  (`TraitsClash` refusal; `applyTraits` sets the multipliers); rebels and reused ids none; aggression untouched.
  Nation panel Overview chips; God tab boxes, a clashing one greyed. No history row: God's nation edits make none.
- Save format 2 (`STATE_FORMAT`), pins by `SAVE_FORMAT_PIN=1`.
- AT: seed 99's year hashed without `nations.traits` is 614c24dd, the old pin; the new pin f7089e32 (ADR-822).
- `traits.test.ts` 4 of 4; whole unit suite green; `godUi1938.spec.ts` 7 of 7 with the trait steps.
- **Next:** R16b.

## 2026-11-04 — ROADMAP R16b: the trait modifiers act (ADR-822)
- Every modifier kind of the data acts where the game has its rule (`traitMod`): land, armour, naval and air fire;
  war exhaustion; unrest and suppression; research; order price and days (`priceWith`, `daysWith`, the production
  list shows them); org regained; `fortStrength` as a held cell's defence against a flip. Trait descriptions give the
  numbers.
- First sweep (seeds 1551–1560, `.cache/sweep/reports/2026-11-04-sweep-traits16b.md`): limits 4 of 10, the United
  States 44% of the land on the mean (done31: 7 of 10, 20%). Zeroing one family a sweep found stability: it calmed
  the United States' conquests and stirred the Axis and Soviet ones. Stability now acts on core land only.
- Final sweep (`docs/sweeps/2026-11-04-sweep-traits16b.md`): limits 7 of 10 (done31's 7; bar 8), riser, faller and
  break-up 10 of 10, stasis 9 (reported); the United States 29% on the mean, still above done31's 20%: a watch.
- Tests: `traitEffects1938.test.ts` 11 of 11. Base-rule tests on nations now with traits read the rule bare
  (`withoutTraits`); `nukeMeansLost1938`'s window 40 → 80 days (the fortifier holds Prague to day 50); the economy
  invariant's desertion bound leaves out armour that fought in the hour (a hole of its own, found on 7019).
  Whole unit suite 2,125 green; `diploInvariants` 99 0 broken; pin f7089e32 → aa1a5dbb.
- **Next:** R16's remaining notes (war.ts header, `revival.cooldownDays`, retreat.ts header), then the next item.

## 2026-11-04 — R17 planned: landings the player can order (ADR-823)
- Found: a player's left-click over the sea lands divisions only when transports already wait at a port of their
  land; nothing brings transports, shows the voyage, or escorts it. SPEC §9.3 says right-click (it is left; filed
  under R16's notes).
- The user's decisions: real transports; R17a transports come, R17b landings together, R17c shown, R17d an escort
  box ticked by default. The United States' lean stays a watch.
- **Next:** R16's notes, then R17a.

## 2026-11-04 — ROADMAP R16: the notes; R16 done
- Headers to the code: `war.ts` (a side fights to the death by its leader's flag), `retreat.ts` (the point
  RETREAT_CELLS beyond the formation), `air.ts` (wings act on the land by their missions), `player.ts` (AI layers
  on but nukes; left click orders). SPEC §9.3: a left click orders a march.
- Bug: `exportScenario` kept `stats.nuke`, so a scenario's file carried the run's nuclear statistics and a reload
  hashed apart from its header. Now dropped; `scenarioFile.test.ts` grants warheads and checks it (red without).
- Kept, as by design: `revival.cooldownDays` (pinned to `REVIVAL_COOLDOWN` by `scenario1938.test.ts`); `majors` in
  `inspect` (a reply for tests and the critic).
- **Next:** R17a.

## 2026-11-04 — ROADMAP R17a: transports come to the troops (ADR-823)
- A player's order over the sea from a land with no transports at its ports calls the nearest idle transport group
  of its nation to the nearest port of that land (`callTransports`); the division marches there, waits, boards that
  group (`world.seaFetch`, saved as an optional section, no new save format).
- AT (`landingCall1938.test.ts`, 3 of 3): Britain played, its four groups moved to Gibraltar, a division by London
  ordered to Belfast: group called, under the player's order, kept over a save; boards on day 6, lands in Ulster on
  day 8.5 on the called group. No transports anywhere: refused `NoTransports`. A God order calls none. Red with the
  call switched off.
- Pin unmoved. Found: a fleet's player order never ends while it lives (relied on; filed under R17).
- **Next:** R17b.

## 2026-11-04 — ROADMAP R17b: landings together (ADR-823)
- A player's order over the sea goes by convoy: divisions bound for one target share a transport group, board it at
  the port without sailing, and it sails once no division that would fit is still to come; the rest wait for its
  voyage back (`assignTransports`, `convoySystem`, `world.convoyPort`).
- Guarded: a loading group stays aboard at its port (the stray-landing rule skipped), no other order takes it, a
  full group keeps the leftovers waiting, a repulse ends the convoy, a stalled division is not waited for.
- AT (`landingCall1938.test.ts` 4 of 4): one group at Portsmouth, three full divisions from London to Belfast: two
  land in the same hour, the third boards after their landing and lands later; red with the hold off. R17a's
  case unchanged. Pin unmoved; landing and invasion tests (26) green.
- **Next:** R17c.

## 2026-11-04 — ROADMAP R17c: the voyage shown (ADR-823)
- The formation panel's status says marching to the port (named), waiting there for transports, at sea, or landed
  (`FormationDetail.voyage`); the map draws a bound formation's sea leg and landing ring (`Snapshot.voyages`,
  `drawVoyages`); over land across the sea, the tooltip says the selected forces go by sea (`overSea` request).
- AT (`landingVoyage1938.spec.ts`): Britain played, its transports sent to Gibraltar, a division from London ordered to
  Belfast: the tooltip line, then toPort, waiting, atSea, landed in turn, the leg drawn while bound. Screenshot read:
  "Waiting at Portsmouth for transports", the leg to a ring at Belfast.
- `landingOf` shared by the landing and the drawing; pin unmoved.
- **Next:** R17d.

## 2026-11-04 — R16b's e2e fallout fixed; R18 and R19 filed
- A full e2e run (186 specs) after R17c: 11 red. Two were load (`fire1938`, `seaRow1938`, green alone). Nine were
  R16b's (ADR-822): its rules moved seeded scenes. Fixed by finding each scene again, every assertion kept:
  `buildArmour1938` (Germany's own price and days, `priceWith`/`daysWith`), `nukeMeansLost1938` (window 30 → 80
  days: the fortifier holds Prague to day 50), `fightCamera1938` (three of the critic's eight re-picked by contact on
  day 21), `fallen1938` (division 556 by `contactPick.ts`), `enemyClickPanel1938` (seed 4441 → 3: Poland's counters
  stacked under a German one), `seaClose1938` (three rows from a new `seaPairs.ts` scan; evidence PNGs swapped),
  `tankBattle1938` (seed 2 → 1, the spec's own search), `zoomDemo1938` (the search asks the T2 picture's sprite too).
- `stackBlocks1938` stays red: a layout bug the new history shows (R18, before R17's rest). The gate ran none of
  these on R16b (R19).
- **Next:** R18.

## 2026-11-04 — ROADMAP R18: a block keeps clear of its own side's other stacks (ADR-824)
- `deployOf` read no friendly block of another stack: on seed 1212 day 20 Soviet blocks on two neighbouring Polish
  divisions stood in one another. It now reads its own side's blocks before it in the hour's order as an enemy's.
- AT: `deployStacks1938.test.ts` (red without: 66/164, 153/156, 153/164, 156/200), `stackBlocks1938.spec.ts` 2 of 2
  unchanged. The air AI reads block places, so the pin moved: aa1a5dbb → 6012d9d2; `diploInvariants` 99 0 broken.
- Full e2e: 330 passed, 7 red; six green alone (load); `declutter1938` a tie of clusters the nested grids allow (a
  probe of the keys), restated with stricter whole-view and whole-way checks (seventh addendum).
- **Next:** R17d.

## 2026-11-04 — ROADMAP R17d: the escort; R17 done (ADR-823)
- The panel of the player's land formation has an "Escort with warships" box, ticked by default and kept in the
  browser; each click's order carries it. A new convoy with it takes the nearest idle warfleet of the nation (not under
  the player's own order), which sails at once to the landing's water as the player's, and goes back where it came
  from once the transports are empty. None free: the transports sail alone, and the panel says so.
- AT: `landingEscort1938.test.ts` (Britain, London to Belfast: escorted and there first, held until ashore, then back;
  every warfleet the player's own: alone and told; no box: none; a save keeps the escort), `landingEscort1938.spec.ts`
  (ticked by default, a click over the sea with no warfleet told, unticked after a reload). Pin unmoved.
- **Next:** R19, then the batch's release (critic run, sweeps, tag).

## 2026-11-04 — ROADMAP R19: a moved pin runs the whole e2e suite (ADR-825)
- `planE2e` plans every spec when `tests/sweep/baselineHash.test.ts` changed: a rule that moves the history moves the
  pin in its commit, and the seeded specs' scenes with it (R16b: nine red, R18: one, none run by the gate). A sim change
  that leaves the history alone runs only its changed specs, as before. The full run keeps the gate's rerun-alone rule.
- AT: `gate.test.ts` (the pin's file plans the stage in full; the same change without it, none). CLAUDE.md says so.
- **Next:** the batch's release (R16–R19): critic run, unseen-seed sweeps, CHANGELOG, tag.

## 2026-11-04 — critic run 32, full, on e7437a57: one blocking issue (R32-B1)
- After R16–R19. 1 blocking: **R32-B1**, a player's landing on a coast it is not at war with is undone at the next day
  start (`repatriationSystem` moves the division to its spawn point: no land way home; no notice). Naval 8 → **7**, under
  its bar; every other score at its bar (semanticZoom, tanks, aircraft, aiNukes 8; the rest 7). Non-blocking R32-N1–N5
  (one click's divisions land weeks apart, trait text hover-only, refusal toasts cut, run 31's items, sea heroes lost more).
- **Next:** R20 (R32-B1), then the critic again.

## 2026-11-04 — ROADMAP R20: no landing on a neutral's ground (R32-B1, ADR-826)
- A player's order over the sea onto ground of a nation outside its wars is refused (`Neutral`: "it would land on the
  ground of a nation outside its wars"), as a march by land there is; onto an enemy's ground it goes as before. A
  formation the march home sets on its spawn point (a peace while at sea) is now an event, and the player's is told
  below the ticker.
- AT: `landingNeutral1938.test.ts` 3 of 3 (Calais at peace refused; held by an enemy, by sea; idle there, sent home with
  the event; two red without the rule), `landingNeutral1938.spec.ts` (the panel's reason, the ticker's row). Pin unmoved.
- **Next:** critic run 33 (focused on R32-B1).

## 2026-11-04 — critic run 33, full, on 937fd085: no blocking issue; naval under its bar
- R32-B1 fixed (each case refused `Neutral`; at war a landing goes); R20 changes no history (15 twenty-year runs as run
  32's). 0 blocking; naval **7** under its bar of 8 for R33-N1 (a sea order outlives the peace), R33-N2 (a shut port's
  wrong reason), R33-N3 (the refusal read only as a cut row), R33-N4 (many sent home, one row) and R32-N1; every other
  score at its bar. No release while naval is under: filed as R21a–e.
- **Next:** R21a.

## 2026-11-04 — ROADMAP R21a: a sea order does not outlive the peace (R33-N1)
- A player's division bound for its convoy whose landing a peace made a neutral's is stopped where it stands and told
  `Neutral`; a convoy still loading for it does not sail, those aboard are told and go ashore at the port (ADR-826).
- AT: `landingPeace1938.test.ts` 2 of 2 (Britain on German-held Calais: peace while bound; peace with one aboard a
  loading convoy), both red without the rule. Pin unmoved.
- **Next:** R21b.

## 2026-11-04 — ROADMAP R21b: a port bombed shut says so (R33-N2)
- A division refused at a port of its nation that is bombed shut is told "its port is bombed shut" (`PortShut`, 16),
  not "it stands at no port of its nation". A reason only: the pin unmoved.
- AT: `landingPortShut1938.test.ts` (Britain's division for Belfast, Portsmouth shut while it marches: `PortShut`; red
  without, `NoPort`).
- **Next:** R21c.

## 2026-11-04 — ROADMAP R21c: a refusal is read in full (R33-N3)
- Over a neutral's coast the tooltip says "No landing here: the ground of a nation outside your wars" instead of "go by
  sea"; a refused order of a selected formation opens its panel again (the click had closed it), the reason in it.
- AT: `landingNeutral1938.spec.ts` (a real mouse hover and click over Calais at peace: the tooltip's line, the panel
  open with the reason). Order specs (invasion, orderNews, landing voyage and escort, fleet order, order lines, follow,
  markers, ticker) green.
- **Next:** R21d.

## 2026-11-04 — ROADMAP R21d: many sent home are told once (R33-N4)
- The player's formations sent home across the sea in one day start are one event (`FormationsSentHome`, the count),
  one History record ("Sent home"), and one row below the ticker naming the first and counting the rest.
- AT: `sentHomeMany1938.test.ts` (ten British divisions at Calais: ten sent home, one event of ten, one History record,
  one row of ten). The AI's are not recorded: pin unmoved.
- **Next:** R21e.

## 2026-11-04 — ROADMAP R21e: one click lands together (R32-N1); R21 done
- A division whose landing has a full convoy loading at a port of its land takes another group at that port, or calls
  one there; convoys at one port for one landing sail together. The waiting division's panel says "Aboard at {port},
  waiting for the rest of the landing". Japan's two divisions to Shanghai land at hours 632 and 633 (before: 123, 510):
  the trade, recorded in ADR-826, is the landing together.
- AT: `landingTogether1938.test.ts` (within a day; the panel's `aboard`; red without, 387 h apart). Landing unit and e2e
  specs green. Pin unmoved (the player's convoys only).
- **Next:** critic run 34.

## 2026-11-04 — critic run 34, focused, on 2535a577: one blocking issue (R34-B1); naval under its bar
- R33-N1, R33-N3 and R32-N1 fixed; R33-N2 fixed in the sim only. **R34-B1 (blocking):** a refusal at the port a division
  marched to is never told in the page (the worker's `orderNews` forgets the order at the hour's arrival), so R21b's
  `PortShut` is unseen. Naval **7** under its bar of 8 for R34-B1 and R34-N1 (the wait aboard: 50 days, no account, a
  recall refused); every other score at its bar (diplomacy, stats, UI, performance, stability 7 rescored; the rest carried).
  Filed as R22a–e (with R34-N2–N4).
- **Next:** R22a.

## 2026-11-04 — ROADMAP R22a: a refusal at the port is told (R34-B1)
- The worker's `orderNews` forgot a player's order at the hour's `FormationArrived`, so the `MoveRejected` that followed
  at the port the division had marched to (shut, no port, no transports, no sea way) was told to no page. An arrival now
  forgets the order only when no refusal of the same formation follows in that hour (`refusedLater`, `server.ts`).
- AT: `serverPortShutNews1938.test.ts` (Britain → Belfast through the worker, the port kept shut: one `refused` of
  `PortShut` at the sim's hour; red without, `[]`); `landingPortShut1938.spec.ts` (the critic's case, seed 3517, three
  divisions to Calais at war with France: division 270's row and panel say "its port is bombed shut"; red without, no
  news in 150 h). Order and landing specs green (orderNews, landingNeutral ×2, landingVoyage, landingEscort). The
  worker only, no sim rule: pin unmoved, tick unchanged.
- **Next:** R22b.

## 2026-11-05 — ROADMAP R22b: the wait aboard has a way out (R34-N1)
- R22b split into b (a way out), c (the panel's account) and d (the escort waits for the sailing); the old c–e are e–g.
- A division aboard a player's convoy still loading at a port of its nation takes an order: it goes ashore at the port's
  cell and the order stands (`ashoreAtPort`, an amendment of PLAN 4.5a in ADR-826's R22b). Under way, or the AI's, as
  before: refused `Aboard`.
- AT: `landingAshore1938.test.ts` (Japan's four to Shanghai, the first recalled inland while it waits at Tokyo: ashore by
  the port and marching, not refused; the other three land together; red without, `Aboard`). The decisions it stands
  on green before and after: `rejectReasons1938`, `serverOrderNews`, `landingTogether1938`, `landingPeace1938`, and
  every `landing*` unit test (15 files). Pin unmoved (the gate's pin stage green). Tick: an embarked formation's order
  only, no system's hourly cost changed.
- **Next:** R22c.

## 2026-11-05 — ROADMAP R22c: the wait aboard is accounted for (R34-N1)
- A division aboard at its port waiting for the rest of its landing has a "Landing" row in its panel: "1 of 4 aboard;
  the last 47 days from the port" (or "the rest at the port", "one held up on the way", "more transports on their way").
  The worker counts the landing's divisions at that port for that target and takes the furthest bound one's
  `marchHoursLeft` (`voyage.wait`).
- AT: `landingWait1938.test.ts` (Japan's four to Shanghai: 1 of 4, 47 days said at hour 2; the last reached the port
  after 46.6 days; red without, no account); `landingWait1938.spec.ts` (the row at 1600 × 900 and 390 × 844, looked
  at). formationPanel, landingVoyage, landingNeutral specs green. At the desk panel's width the row's value runs into
  its label, as the status row's does (R34-N2): R22e. Worker and UI only: pin unmoved, tick unchanged.
- **Next:** R22d.

## 2026-11-05 — ROADMAP R22d: the escort is not sent weeks ahead (R34-N1)
- A convoy's escort is kept where it stands at the order and sails for the landing's water once its voyage (`sailHours`,
  the way and pace `sailStep` takes) is at least the wait left (`waitLeft`: the longest march of a division still bound,
  the voyage of a group still coming); a loaded convoy waits only for an escort in a battle or one that would be there
  after its transports (`escortAhead`).
- First design rejected on its own numbers: sailing the escort with the transports and holding them at the port until it
  was there made every escorted landing later (Belfast 110 → 172 h; Shanghai 1243 → 1289 h). With the timing: Belfast
  110 h escorted and unescorted; Japan's four to Shanghai, escorts at the water at hours 1117–1120, the last aboard 1121,
  landed 1242–1243 (unescorted 1242–1243; HEAD's escorts there from hour 23). Restated in ADR-826 (R22d).
- AT: `landingEscortWait1938.test.ts` 2 of 2 (red without). R17d's `landingEscort1938.test.ts` green unchanged; landing,
  naval AI, carrier, order-news unit tests green (18 files); `landingEscort1938.spec.ts`, `landingVoyage1938.spec.ts`
  green. Pin unmoved. Tick: a route search an hour for each of the player's kept escorts, none in the AI's world.
  The gate's `snapshot-perf` (2 ms bar) red under the full parallel run, green alone, as at R22b.
- **Next:** R22e.

## 2026-11-05 — ROADMAP R22e: a long value keeps to its column (R34-N2)
- A panel row's label keeps its width and a 0.6 rem gap, and a long value wraps right-aligned in its own column
  (`.panel-row`, every panel): "Aboard at Tokyo, waiting for the rest of the landing" no longer runs into "Status", nor
  R22c's "Landing" row into its label.
- AT: `landingWait1938.spec.ts` (the Status and Landing rows: the label ends at least 4 px before the value's leftmost
  line, at 1600 × 900 and 390 × 844; red without at the desk, 0 px), the crops looked at. Panel and layout specs green
  (enemyClickPanel, formationClickPanel, formationPanel, godPanelMore, nationPanel, nukeAlertPhone, phoneLayout,
  orderNews: 29). CSS only: no sim, frame budget untouched.
- **Next:** R22f.

## 2026-11-05 — ROADMAP R22f: a refusal notice goes when it stops being true (R34-N3)
- The formation panel's notice of a refusal is shown only while the formation's voyage, march, fight and retreat are as
  when the panel first showed it after the news (`staleNotice`, `orderNewsText.ts`); the ticker's row is untouched.
  Refusals only: a first try cleared "no warships free" as the division marched to its port, which stays true while the
  order goes on (`landingEscort1938.spec.ts` red, then green with the rule narrowed).
- AT, restated (R22b obeys the critic's recall in Tokyo): `orderNews1938.spec.ts` (Switzerland refused London, the
  notice held over two hours standing; marched to Zurich, "On the march" and no notice; the row kept; red without).
  orderNews, landingNeutral, landingPortShut, landingVoyage, landingEscort, landingWait, airOrders specs green. UI only.
- **Next:** R22g.

## 2026-11-05 — ROADMAP R22g: an order to the open sea says so (R34-N4); R22 done
- A land formation's order to water with no land of its own near enough to snap to is refused `OpenSea` (17: "there is
  only sea there: it goes over the sea to land on a coast"), not `NoRoute` ("no way by land…"), which spoke of a march
  never asked for. A reason only, for every order: the pin unmoved (the gate's pin stage green).
- AT: `orderOpenSea1938.test.ts` (Britain's division onto the water off Bergen, the player's order and one of no player:
  `OpenSea`; the Thames water by London snaps to land and goes; red without, `NoRoute`); `landingNeutral1938.spec.ts`
  (a click there: the panel says "only sea there"; looked at). `rejectReasons1938` green. The gate's `snapshot-perf`
  red in the full run and green alone again (BLOCKERS watch list, a timing test under load).
- **Next:** critic run 35.

## 2026-11-05 — critic run 35, focused, on a3e76107: two blocking issues (R35-B1, R35-B2); naval under its bar
- R34-B1 fixed (both refusals at the port told), R34-N1's account, way out and escort timing, R34-N2, R34-N4 fixed;
  R34-N3 fixed for its case. **R35-B1 (blocking):** the division aboard clicked to the same landing again goes ashore
  and takes another division's place, which waits on the quay for weeks. **R35-B2 (blocking):** a refused order still
  takes the division aboard off its transports. Both in R22b's `ashoreAtPort`. Scores: naval **7** under its bar of 8;
  semanticZoom, tanks, aircraft, aiNukes 8; the rest 7, at their bars. Every AI world bit-identical to run 34's.
  Filed as R23a–e (with R35-N1–N3).
- **Next:** R23a.

## 2026-11-05 — ROADMAP R23a: a refused order leaves the division aboard (R35-B2)
- `orderMove` of a division aboard a loading convoy goes ashore, judges the order, and on a refusal puts it back aboard
  where it was (`ashoreAtPort` now returns the way back), its `seaBound`/`seaFetch` restored. The rest of `orderMove` is
  `orderAshore`, unchanged.
- AT: `landingAboardRefused1938.test.ts` (Japan's four to Shanghai, the one aboard ordered onto open sea and onto Calais:
  refused 17 / 15, embarked entry and place as before, the four land within a day; red without, ashore),
  `landingAboardRefused1938.spec.ts` (the panel: "only sea there" under "Aboard at Tokyo", "1 of 4 aboard"; red without;
  looked at). The player's convoys only.
- **Next:** R23b.

## 2026-11-05 — ROADMAP R23b: ordered to its landing again, the division aboard stays (R35-B1)
- `orderMove` of a division aboard a loading convoy to the landing it is aboard for (`sameLanding`: the same land and
  water) is taken and changes nothing. Before, it went ashore (R22b) and its new order bound it to the group division
  365 was walking to; 365 then found no room and waited on the quay from h512 to h1367.
- AT: `landingSameAgain1938.test.ts` (Japan's four to Shanghai with the escort, the one aboard clicked to Shanghai again:
  still aboard in its place, none bound to sailed transports, landed 1242–1243 as with one click; red without, ashore).
  Probed: the one aboard sent instead to Fuzhou, Tianjin, Canton or Ningbo is refused `NoTransports` and stays aboard
  (R23a); the four land together. The binding rule is left as it is.
- **Next:** R23c.

## 2026-11-05 — ROADMAP R23c: a refusal notice goes with the next order taken (R35-N1)
- The formation panel's detail has `goal`, the cell its march or voyage is for while it moves; `staleNotice`'s state
  includes it, so a refusal given while marching goes once another march is taken, and holds while the first goes on.
- AT: `orderNews1938.spec.ts`'s third test (Switzerland's division marching, refused London: "no port" held an hour on;
  sent to the other of Zurich and Geneva: no notice, "On the march"; red without, the notice stays). UI and worker
  detail only: pin unmoved.
- **Next:** R23d.

## 2026-11-05 — ROADMAP R23d: the escort's wait does not cost a lone landing time (R35-N3)
- The critic's Belfast case is the same on every seed: the fourth division nearest London stands at the port and boards
  at hour 2; the escort, Britain's warfleet nearest Belfast by straight cells, had Scotland to go round (72 h), and the
  loaded transports waited for it from hour 2 to 18 (`escortAhead`). Landed 72–73 h against 58–59 unescorted.
- `escortConvoy` now takes, of the eight nearest by straight cells, the one there soonest by sea (`sailHours`).
- AT: `landingEscortWait1938.test.ts` (Belfast, fourth nearest: 58 / 58; red without, 72; nearest: 110 / 110; Shanghai
  unchanged). `landingEscort1938.test.ts`'s line "under way after the first hour" was R17d's sailing at the order,
  replaced by R22d; the new escort is near enough to wait, so it is restated to R22d's rule (under way, or kept where
  it stood; ADR-826 notes it). Escort and wait specs green. Pin unmoved (the player's convoys only).
- **Next:** R23e.

## 2026-11-05 — ROADMAP R23e: a click clicked again keeps its landing together (R35-N2); R23 done
- Cause: a division's new order cleared its `seaFetch`/`seaBound` first; a convoy's landing is read from the
  divisions bound for it (`convoyTarget`), so its convoy lost its landing, and `assignTransports` put the division on
  the full convoy 1136's next voyage (all three did). The four then landed one at a time (148, 633, 952, 1243).
- `sameLanding` now also covers a division bound for a convoy still at its port: an order to the same landing keeps its
  binding and changes nothing, as R23b does for the one aboard.
- AT: `landingSameAgain1938.test.ts`'s second test (all four sent again at hour 26: the same transports, landed
  1242–1243 as clicked once; red without). Every landing unit test and e2e spec green. Pin unmoved.
- **Next:** critic run 36.

## 2026-11-05 — critic run 36, focused, on 41e88005: two blocking issues (R36-B1, R36-B2); naval under its bar
- R35-B1, R35-B2, R35-N1, R35-N2, R35-N3 fixed. **R36-B1 (blocking):** a refused order clears the binding of a division
  walking to its convoy (older), so a whole click re-clicked a cell off Shanghai, all refused, sails the one aboard
  alone. **R36-B2 (blocking, older):** the one aboard clicked a cell off is a different landing: ashore, sent to Sasebo,
  the landing split for weeks, untold. Scores: naval **7** under its bar of 8; the rest at their bars (diplomacy, UI,
  performance, stability rescored 7; the others carried). AI worlds bit-identical to run 35's. Run 37 must be full.
  Filed as R24a–d (with R36-N1, R36-N2).
- **Next:** R24a.

## 2026-11-05 — ROADMAP R24a: a refused order leaves every division its landing (R36-B1)
- `orderAshore` clears `seaBound`/`seaFetch` before judging; R23a restored them only for the one aboard. `orderMove` now
  restores them on any refusal, so a division walking to its convoy, or waiting at its port, keeps its place.
- AT: `landingRefusedBound1938.test.ts` (Japan's four to Shanghai with the escort; at hour 26 the walker 365 onto open
  sea, or all four a cell east of Shanghai: those refused keep their transports, the four land 1242–1243; red without,
  365 unbound). Landing unit tests green. Pin unmoved (no player convoy in AI play). In the gate run, two timing
  tests red under load and green alone: `snapshot-perf` (watch list) and `scenario1938`'s build time (2044 ms of 2000).
- **Next:** R24b.

## 2026-11-05 — ROADMAP R24b: a click a cell or two off the landing is the same landing (R36-B2)
- `sameLanding` matches a landing whose water and land are within `SAME_LANDING_CELLS` (2 cells of the default map,
  about 25 km) of the division's own, the land of the same holder; the order stands as it was.
- AT: `landingNearSame1938.test.ts` (Japan's two to Shanghai; the one aboard re-clicked one cell east, one south, two
  east: still aboard, the two land 632–633; Fuzhou is another landing; red without, one east: 633 / 1285). The one
  south and two east were already the same on HEAD. Pin unmoved.
- **Next:** R24c.

## 2026-11-05 — ROADMAP R24c: a refusal notice goes with any order taken (R36-N1)
- The HUD keeps, for each formation ordered from the page, the news `seq` its last order was sent at (`orderedAt`); a
  refusal older than that is no longer the panel's notice, whatever the state. A refusal of the new order is newer and
  shows. R23c's goal stays in the state key (a state change without an order of the page).
- AT: `orderNews1938.spec.ts`'s fourth test (Switzerland's division marching, refused London, re-clicked on its own
  goal: no notice, "On the march"; red without). UI only.
- **Next:** R24d.

## 2026-11-05 — ROADMAP R24d: the one aboard sent to another landing is told why (R36-N2); R24 done
- A division gone ashore from its loading convoy for an order over the sea that finds no transports is refused
  `Loading` (18: "its transports are loading for another landing, and no others with room are at a port it can
  reach"), not `NoTransports`, which it contradicted while aboard transports at that port. R23a puts it back aboard.
- AT: `landingAboardRefused1938.test.ts`'s third test (Fuzhou: 18, still aboard, the four land together; red without,
  6) and `landingAboardRefused1938.spec.ts` (the words in the panel over "Aboard at Tokyo"; looked at). Pin unmoved.
- **Next:** critic run 37 (full).

## 2026-11-05 — critic run 37, full, on b0dd86f3: one blocking issue (R37-B1); naval under its bar
- R36-B1, R36-B2 (at one cell), R36-N1, R36-N2 fixed. **R37-B1 (blocking):** the one aboard re-clicked two cells south
  of Shanghai resolves to a landing four cells off, is not the same landing, and is taken ashore to transports at
  Sasebo in silence; the landing splits for four weeks (with four divisions the same click is refused and kept).
  Scores: naval **7** under its bar of 8; semantic zoom, tanks, aircraft, AI nukes 8; the rest 7, at their bars. All
  dimensions rescored (full run). Filed as R25a–c (with R37-N1).
- **Next:** R25a.

## 2026-11-05 — ROADMAP R25a: the near-miss is measured from the click (R37-B1)
- `sameLanding` also takes a click within `SAME_LANDING_CELLS` (2) of the cell its landing was ordered for (the
  convoy's target, or the bound division's), of the same holder. Two cells south of Shanghai resolved to a landing four
  cells off, so the landing-to-landing test of R24b missed it.
- AT: `landingNearSame1938.test.ts`, two new cases (two south, two south-west: landed 632–633; red without, 633 / 1288
  and 633 / 1291). Pin unmoved (player convoys only).
- **Next:** R25b.

## 2026-11-05 — ROADMAP R25b: a division aboard never leaves its transports untold (R37-B1)
- The one aboard a loading convoy, taken by an order over the sea to other transports, emits `LeftLanding` (73); the
  worker tells it as the order's news "leftLanding" (a row and the panel's notice: "its transports are loading for
  another landing; it left them for other transports and will not land with the rest").
- AT: `landingLeftTold1938.test.ts` (Japan's two to Shanghai, the one aboard sent to Fuzhou: 1136 → 1151, told) and
  `landingLeftTold1938.spec.ts` (the row and the notice; looked at). Red without, both. Pin unmoved (an event only).
- **Next:** R25c.

## 2026-11-05 — ROADMAP R25c: no false refusals for a near re-click (R37-N1); R25 done
- The walkers of a whole click re-clicked two cells off are bound to their convoy, and R25a's rule (a click within two
  cells of the clicked target) holds for them: none refused, each keeps its transports. No code beyond R25a.
- AT: `landingNearAll1938.test.ts` (all four two south, and two south-west: none refused, landed 1242–1243; red
  without R25a's change). Pin unmoved.
- Housekeeping: a red-without check stashed a committed file (nothing to stash) and the pop applied an old stash
  (`rule worktree scratch 2026-10-24`) onto `tools/diag/airLate.ts`; both files restored to HEAD, the stash kept.
- **Next:** critic run 38.

## 2026-11-05 — critic run 38, focused, on a54afc77: one blocking issue (R38-B1, new in R25); naval under its bar
- R37-B1 fixed (the near re-click stays aboard and lands with its partner; the move to other transports is told).
  **R38-B1 (blocking):** the worker judges "landed away" against the new click, two cells south of Shanghai, four
  from the landing's land: a landing that went as ordered is told as failed (364; with four, 364 and 367). Scores
  unchanged: naval **7** under its bar of 8; the rest at their bars. Filed as R26a–b (with R38-N1).
- **Next:** R26a.

## 2026-11-05 — ROADMAP R26a: a landing kept by a near re-click is judged against that landing (R38-B1)
- The worker's order news took the new click as the order's target; a click two cells south of Shanghai is four from
  the landing's land, so a landing as ordered was told "came ashore away". It now asks `sameLanding` when the order
  comes and, if kept, keeps the convoy's (or bound division's) target.
- AT: `landingNearNews1938.spec.ts` (seed 3517, the critic's; two with the one aboard re-clicked, and all four: they
  land, no news; red without: 364 told, and all four told). Worker only: pin unmoved. The landing and order-news specs
  green.
- **Next:** R26b.

## 2026-11-05 — ROADMAP R26b: R25b's notice says which landing it leaves (R38-N1); R26 done
- "{name}: it left its transports, which stay with the landing it had, for others bound for its new landing; it will
  not land with the rest." `landingLeftTold1938.spec.ts` checks the words (red without). Words only.
- **Next:** critic run 39.
- ADR-827 proposed (show the landing while choosing it): the user asked whether the naval rounds are a loop; the
  options are put to them. Meanwhile, the standing order: critic run 39.

## 2026-11-05 — ADR-827 accepted: the landing shown while it is chosen; R27 filed
- The user chose the marker and the fuzz of re-clicks first ("Yes do 1 and 2 first"). Critic run 39, started on
  eb35f769, was stopped before its report (its queue and sims killed; its partial files moved out of `critic/` to the
  session's scratchpad, none committed). R27a–c filed.
- **Next:** R27a.

## 2026-11-05 — ROADMAP R27a: the worker's hover answer names the landing (ADR-827)
- `landingFor(world, id, x, y)`: the landing an order over the sea is for, as the order resolves it (the one it has
  when `sameLanding`, else the click's `landingOf`), and the cell it is judged against. `overSea` now answers a
  `SeaHint` {how, water, land, same}; the worker's order news (R26a) uses the same function.
- AT: `landingFor1938.test.ts` (before an order: Shanghai's; the one aboard two cells south: its own, `same`, the
  click's own landing another; Fuzhou: Fuzhou's). All 21 landing unit files green. Pin unmoved.
- **Next:** R27b.

## 2026-11-05 — ROADMAP R27b: the map marks the landing while it is chosen (ADR-827)
- With land formations selected and the cursor over a target across the sea, the map draws the landing the order is
  for: a dashed line from its water to its land, an arrowhead and a ring, orange for a new landing, green for the one
  the division already has (the tooltip then says "the landing they already have"). Drawn over the unit markers, with
  a dark edge (a first amber version read poorly on yellow land and hid under a marker).
- The hover is asked again each tick, so a still cursor follows the sim. The one aboard a loading convoy is asked
  from its port (`aboardAtPort`, `overSeaFrom`): it was "not over the sea" before, so no hint at all.
- AT: `landingMark1938.spec.ts` (seed 3517: two cells south before the order, a new landing; the cursor still while
  the two board, the mark turns green at Shanghai's landing; Fuzhou new; screenshots looked at). Landing unit tests
  and the landing and tooltip specs green. Pin unmoved.
- **Next:** R27c.

## 2026-11-05 — ROADMAP R27c: a fuzz of re-clicks about a landing; R27 done
- `landingReclickFuzz1938.test.ts`: two and four divisions to Shanghai, re-clicked at hours 26 and 200, one to three
  cells off in eight directions, the one aboard, one walking, or all: 288 cases from four saved states, 26 s.
- Its finds, fixed: a whole click sent elsewhere told the one aboard it "will not land with the rest" (the rest went
  with it); one walking, sent alone elsewhere, left its partner to land alone, untold. `LeftLanding` is now noted for
  aboard and bound alike and told once the hour's orders are in (`tellLandingsLeft`), where another division still
  has the landing left (judged by landing: two transport groups can carry one, R21e).
- The worker's news judges every order over the sea against the land of the marked landing (`seaOrderLanding`,
  `landedAway`), not the click: a click three cells off would have been told "came ashore away".
- Red without (two violations in each two-division state). Landing unit tests (22 files) and landing specs green.
  Pin unmoved.
- **Next:** check the open PR (the user's ask), then critic run 39.

## 2026-11-05 — PR #5 merged: the nightly checker judges only real risings (78c5ca29)
- The user asked to check the open PR before the critic. #5 (another session's): the war-and-peace checker's revolt
  probe now takes puppets between `PROTEST_FROM` (10, the literal it had) and `FREE_ABOVE` (90). Above it the puppet
  pass releases in peace (`autonomy > FREE_ABOVE`), so the probe's forced rising never happens; the nightly's red
  (seed 1019, Ireland at 90.25) was the probe's, not the game's. Not a weakened test: the rule it judges is the same.
- Checked on main before the merge: `diploInvariants.ts 1019 random --heroes` 0 broken; `npm run check` green (the
  whole unit suite, a helper changed; snapshot-perf red under load, green alone, watch list). Squash-merged.
- **Next:** critic run 39.

## 2026-11-05 — Critic run 39 (full) on 99ba6c07: one blocking issue, R39-B1; R28 filed
- Full (R27 was filed by the user's ADR-827, not a report). Scores: 7 for map, diplomacy, emergent, god mode, editor,
  stats, UI, performance, stability, naval (bar 8); 8 for semantic zoom, tanks, aircraft, AI nukes. One blocking.
- R38-B1 fixed. R39-B1: a landing the player redirects leaves its own transports idle (two re-sent to Fuzhou walk to
  Sasebo and land h1291 against h657; of three, two land 21 days apart; four re-clicked three cells SW all refused
  "no transports"); present on run 38's commit too. R39-N1: the mark speaks for the first selected division only.
- **Next:** R28a.

## 2026-11-05 — R28a: a changed landing takes its own transports (R39-B1)
- The hour's orders are judged together: before they are applied, `noteLeaving` notes the player's divisions they
  take off a landing; that landing's transports are free once nobody else holds them (`heldGroup`), and a released
  group on its way to the port comes on. Seed 3517: two re-sent to Fuzhou land h657/h658 (red h1291); of three,
  the two sent on h657/h658 (red 502 h apart); the four re-clicked SW, none refused (red: all four).
- The one aboard sent alone now takes its own transports where they carry no one else; R24d's `Loading` refusal
  is kept where they carry another (the unit test builds that group), its page spec checks the notice and "at
  sea"; R25b's test checks Fuzhou's landing instead of "other transports". `LeftLanding` judged by landing.
- Fuzz: a whole click refused nothing, one port a landing, one target a convoy; red without. Whole unit suite
  green (snapshot-perf red under load, green alone); landing specs green; pin unmoved.
- **Next:** R28b.

## 2026-11-05 — R28b: the mark speaks for the whole selection (R39-N1)
- `seaHint` (the worker's `overSea` takes the selection's ids): each distinct landing of the selection is marked,
  green where every division it is for has it; two or more: "{n} landings, each marked: they will not land
  together". The one aboard and a fresh one two cells south of Shanghai: two marks (unit test; spec looked at).
- **Next:** R28c.

## 2026-11-05 — R28c: a landing re-sent an hour apart takes its own transports
- Found tracing the critic's stagger case after R28a: the second of two re-sent to Fuzhou an hour after the first
  went on another port's group (h794), its own under way to the port for it unoffered. A group of a landing left,
  under way to its convoy's port, is offered there (`comingTo`): h658. Red without. `noteLeaving` checks the
  order's nation. Landing tests (29 files) and the fuzz green; pin unmoved.
- R28 done. **Next:** critic run 40.

## 2026-11-05 — Critic run 40 (focused) on 76b88197: two blocking issues, R40-B1 and R40-B2; R29 filed
- Focused (R28 filed by run 39's report). Rescored: map 7, UI 7, performance 7, stability 7, naval 7 (bar 8); the rest
  carried (7 diplomacy, emergent, god mode, editor, stats; 8 semantic zoom, tanks, aircraft, AI nukes). Two blocking.
- R39-B1's three cases fixed in outcome. R40-B2: the game applies each division's order at once, so R28a's whole-click
  judgement never runs in the game, and a whole landing re-clicked is told "the rest keep the old landing". R40-B1:
  with a fresh division sent to Fuzhou first, the one aboard of the redirected landing walks to Sasebo while its
  group sails there empty (h657 against h1291); present on 99ba6c07 too. N1: one re-sent alone sails at once; N2:
  "go by sea" for a selection most of which march.
- **Next:** R29a.

## 2026-11-05 — R29a: a click's orders applied together (R40-B2)
- The map's click now sends the selection's orders in one message (`cmds`, `Hud.commands`); the worker takes them
  all and applies them once, so `noteLeaving` and `tellLandingsLeft` judge the click, as R28a meant. Seed 3517 by
  the page's path: the four re-clicked SW3, nobody told (red: three of four), together h1244/1245; two to Fuzhou,
  none told (red: the first), h657/658; of three, the two told. Test and spec, both red without. Pin unmoved.
- **Next:** R29b.

## 2026-11-05 — R29b: the one aboard goes to its new landing's port on its own transports (R40-B1)
- A landing redirected to a target a convoy loads for at another port: the one aboard is offered its own group at
  that port where nobody else holds it, stays aboard, and the group sails there with it (`sailAboard`). Seed 3517,
  the fresh one first, then the two (same hour / an hour before): the three land h792–796 (red: the one aboard
  walks, h1292–1294; before R29a h657 and h1291). Landing, convoy, sea and server tests green (48 files); pin unmoved.
- Checked (the advisor's question): the second, bound for 1144 at Tokyo, walks to Sasebo from where it stood
  (about as far as Tokyo); 1144 reaches Tokyo and stays idle; no group sails empty to Sasebo.
- Filed from run 40: its two blocking issues (PROMPT RELEASES 2), the naval line's bold "Not 8". R40-N1 (one
  re-sent alone sails at once, "consistent with the rules") and R37-N2 stay non-blocking.
- R29 done. **Next:** critic run 41.

## 2026-11-05 — Critic run 41 (focused) on 77d37526: one blocking issue, R41-B1; R30 filed
- Rescored: UI 7, performance 7, stability 7, naval 7 (bar 8), aircraft 8; the rest carried (7 map, diplomacy,
  emergent, god mode, editor, stats; 8 semantic zoom, tanks, AI nukes). One blocking.
- R40-B1 and R40-B2 fixed by real click. R41-B1 (a regression of R29b): the one aboard's transports, sailing to the
  port where a convoy for its new landing loads, are not that convoy's mate; it sails at once, and its first lands
  alone and dies (Britain, 276 h84 against h289). Non-blocking: R41-N1 (the bound one walks while its called
  transports idle), R41-N2 (a redirect undone hours later now splits, the one aboard at sea refused), R41-N3 ("At
  sea, bound for its landing" while sailing to a home port).
- **Next:** R30a.

## 2026-11-05 — R30a: the one aboard sails with the convoy it joins (R41-B1)
- A group carrying and under way to its own convoy's port is still to load: the convoys at that port for its landing
  wait for it. Britain (15101, 7019): the three land h288/288/289 (red: 276 alone h84, destroyed). R29b's Japan cases
  unchanged; landing, convoy, sea and server tests green (49 files); pin unmoved.
- **Next:** R30b, R30c (the advisor: run 41's naval clause lists them; one state of R29b's, three holes).

## 2026-11-05 — R30b, R30c: the one aboard under way to its port takes an order as at that port
- `sailingToPort` (R29b's state) in `aboardAtPort`, `ownLanding`, `stillLoading`: a click onto its landing changes
  nothing (red: refused at sea); the redirect undone four hours later lands both at Shanghai h766/772 (red: 364
  refused, Fuzhou h478); its panel "Aboard, sailing to {port} to load the rest of the landing". The join tests read
  refusals from the order news. Landing, convoy, sea, server tests green (50 files); pin unmoved.
- R30 done. **Next:** critic run 42.

## 2026-11-05 — Critic run 42 (focused) on 1eb4bf85: no blocking issue; naval 7 (bar 8); R31 filed, ADR-828 proposed
- Rescored: UI 7, performance 7, stability 7, naval 7 (bar 8); the rest carried (7 map, diplomacy, emergent, god
  mode, editor, stats; 8 semantic zoom, tanks, aircraft, AI nukes). No blocking issue: R41-B1, R41-N2, R41-N3 and
  R40-N1's re-click fixed by real click. The next run is full (a clean focused run is followed by one).
- Naval held at 7 by six non-blocking issues (R42-N1, N2, N3 new; R41-N1, R40-N1, R37-N2). Ten rounds at 7: ADR-828
  proposes the bar to the user (go on, release at 7, or a fixed list of cases). Meanwhile R31 takes the three that
  strand or lose a division (R42-N3, N2, N1).
- **Next:** R31a.

## 2026-11-05 — R31a: a convoy's transports take no player's order (R42-N3); ADR-828 accepted
- The user chose "Fix all six, then critic" (ADR-828): R31d–f filed for R41-N1, R40-N1, R37-N2.
- A player's order to transports with a convoy or carrying a landing is refused, `Convoy` (19). Britain 15101: the
  order to the Channel refused, 270 still aboard at Portsmouth (red: it sailed). Naval unit tests green (58 files);
  pin unmoved. The same case then shows R42-N2 (Portsmouth bombed shut, 271 refused, 270 sails alone): R31b.
- **Next:** R31b.

## 2026-11-05 — R31b: a convoy whose port is bombed shut while it loads is over (R42-N2)
- Those aboard go ashore at the port and are told `PortShut`, as those bound are. Britain 15101, Calais: nobody
  lands alone (red: 270 at Calais h99, then lost). Naval unit tests green (62 files); R21b's spec green; pin unmoved.
- **Next:** R31c.

## 2026-11-05 — R31c: the one aboard ferried along its coast takes a land order from the coast (R42-N1)
- An order not over the sea from its transports' port puts it ashore on its side's land nearest them
  (`ashoreFromShip`) and is taken from there. Britain 15101: 270 ashore and marching to the Midlands, nobody in
  France (red: refused, Caen h99). Naval unit tests green (60 files); pin unmoved.
- **Next:** R31d.

## 2026-11-05 — R31d: transports with no convoy are the AI's again (R41-N1)
- A fleet's player order never ended (`afloat`); transports called for a division that then went to another
  port's convoy stood empty for a month. Now standing, no convoy, nobody aboard: the AI's. The ferry of the bound
  one (Tokyo → Sasebo) measured at ~2 days' gain, not built. R22b's test now checks the three it names (the
  recalled one is the AI's after its march). Whole unit suite green (snapshot-perf under load); pin unmoved.
- **Next:** R31e.

## 2026-11-05 — R31e: a convoy of one at sea can be recalled (R40-N1)
- The player's transports at sea with one division alone aboard turn back for the nearest port on an order to it,
  which is taken as at that port; refused, they sail on. Seed 3517: sent alone to Fuzhou, recalled a day later,
  both land at Shanghai h633 (red: refused at sea, Fuzhou h151). The seed-2207 news test's second order is now
  refused `NoLanding` (Kassel, inland), not `Aboard`. Whole unit suite green (snapshot-perf under load); pin unmoved.
- **Next:** R31f.

## 2026-11-05 — R31f: a landing does not wait for a later order from far (R37-N2)
- Each binding has its hour (`seaFetchAt`); a landing's convoys at a port wait for its click however far, a later
  order only within a week's march; the rest go on the next voyage. Seed 3517: the two to Shanghai land h632/633
  with or without a third sent three days later from 1,094 h away (red: all h1289); the third h1290. Whole unit
  suite green (snapshot-perf under load); landing specs green; pin unmoved.
- R31 done (all six of run 42's naval issues, ADR-828). **Next:** critic run 43, full.

## 2026-11-05 — Critic run 43 (full) on 813eb375: one blocking issue, R43-B1; R32a fixed; the loop stopped
- Full run. Scores: 7 for map, diplomacy, emergent, god mode, editor, stats, UI, performance, stability, naval (bar
  8); 8 for semantic zoom, tanks, aircraft, AI nukes. R42-N1/N2/N3 and R40-N1 (one day) verified fixed. One blocking:
  R43-B1, a regression of R31e (a recall at sea after the first day walked and split the landing).
- R32a: the transports turn back only for the port where a landing for the order's target loads; none, refused as
  before R31e. Recalled at 1, 2, 3, 5 days: both land h633 (red: walked; h1015, h1563, h230). Naval unit tests,
  landing specs green; pin unmoved. Committed with run 43's report in one commit, at the user's word ("after the next
  commit let's stop").
- **Next:** critic run 44 (R32 open in ROADMAP), when the loop is restarted.

## 2026-11-05 — ADR-829 accepted: the landing rebuilt as one object; the loop's exit

- Analysis of runs 32–43: naval 7 in all twelve, every blocking issue a case of R17's player landings; fixes
  added rules that met (R31e → R43-B1). The user chose the rebuild (ADR-829, way 2) and the process fix.
- PROMPT "RELEASES": the critic commit carries no fix; the loop stops for the user's decision when a dimension
  is under its bar three runs in a row, a blocking issue regresses a ticked item, or a clean run leaves a score
  under its bar. "KEEPING WORK SHORT": an AT for an order or timing sweeps its parameters; a fix's rule runs in
  its feature's checker.
- ROADMAP: R32 closed without a critic lap; R33 the landing as one object (grid AT, `landingInvariants`);
  Batch 3 (readability) holds the carried non-blocking issues and the small ideas, after the release.
- **Next:** R33 (split into lettered parts when started).

## 2026-11-05 — R33a: the landing grid, HEAD's baseline
- R33 split into R33a–d (ROADMAP). R33a: `tests/helpers/landingGrid.ts`, `tools/diag/landingGrid.ts` (one seed, one
  order or all, JSON) and `tools/diag/landingGridReport.ts`. Re-click, redirect, recall, cancel × 6 h, 1, 2, 3, 5 days
  after the first boards × 0–3 cells off × the one aboard, one walking, both; from one saved state a case, run to
  60 days after the last order. Broken: split (a landing's divisions over a day apart), untold, away, mark, idle
  (aboard and standing over 72 h), home (a cancel). A division whose order is over (landed, told, home) is the AI's
  (ADR-759) and not read on: the first run counted the AI's later voyages against the landing (312 broken, wrong).
- HEAD b166998e: 480 cases, **140 broken**, all on seed 3517: idle 125 (longest 507 h: 364 aboard at Tokyo while 365
  walks), split 15 (recall of the one walking: 364 lands h128, 365 h634), mark 5 (recalled at sea: no mark,
  R43-N4). 15101: 0 broken, weak: its port is bombed shut, 236 of 480 divisions told `PortShut`. 8 processes, ~5 min.
  Report: `docs/sweeps/landingGrid-R33a-b166998e.md`. No sim change.
- **Next:** R33b.

## 2026-11-05 — R33b: the player's landing as one object (ADR-830)
- `src/sim/systems/landings.ts`: `world.landings` (target, port, groups, divisions with the hour each joined,
  state gathering/sailing/returning, last order, escort by landing id), saved only while not empty; older saves'
  convoy sections read into landings at the first hour. Divisions wait at the port ashore and board at the sail
  hour; the landing sails an hour after its last order at the soonest. The hour's orders edit it as a batch
  (`landingOrders`: a whole gathering landing redirected keeps its port and groups; at sea, a whole landing
  rejoins one gathering for the place, sails to a new one, or sails back to its port; some of those aboard at sea
  refused `Aboard`). Removed: `heldGroup`, `noteLeaving`, `turnBack`, `waitedFor`, `sailAboard`, `ashoreFromShip`,
  `soleAtSea`, `comingTo`, `convoySystem` and their state (ADR-830 lists them with the tests changed).
- Grid (R33a's): **15 of 480 broken (HEAD 140)**: idle aboard 0 (125), mark 0 (5), split 15 (15, one case: the
  walker re-sent elsewhere and recalled; its mate sailed alone). Longest wait at the port 507 h: HEAD's idle
  aboard, now ashore, no shorter. Report `docs/sweeps/landingGrid-R33b.md`.
- Tests: 36 landing/convoy files green; `landingSave1938` new; whole unit suite green (snapshot-perf red under
  load, green alone; specRefs green once `landings.ts` was tracked). Specs by hand: the 10 `tests/e2e/landing*`
  files, 14 tests, green; panel shots looked at ("At Tokyo, waiting for the rest of the landing", "1 of 4 at the
  port; the last 47 days from it"). Pin of seed 99 unmoved (no player). Tick time: the landing code runs only
  with a player's landing; seed 99 has none.
- **Next:** R33c (mark, panel, news from the object; most of it went in here: `seaHint`/`voyageOf` read it).

## 2026-11-05 — R33b follow-up: a landing's merge picks by id; an older save tested; tick time
- `landingOrders` and `redirectGathering` chose the landing to merge into in the map's order, which a load (sorted
  by id) or a refused order (re-inserted last) changes: now by id. `landingSave1938` gives the same order to the
  run and its loaded copy after each load (redirect, back, recall at sea): the same hash a day on.
- `landingLegacySave1938` (new): a save written at `f9e7ab94` (`tests/fixtures/landingPreR33b-3517.bin.gz`, hour
  32: 364 aboard at Tokyo, 365 bound, two convoys, two escorts) loads; one landing at port 33 with both, both groups
  and both escorts, nobody aboard; saved again without the old sections; the two land together.
- Tick (PROMPT step 8), seed 99, a year, `f9e7ab94` and HEAD at once on separate cores, then swapped: old 3.70 /
  3.52 ms, new 3.51 / 3.70 ms (the cores, not the code); hash 6012d9d2 both. No change.

## 2026-11-06 — R33c: a landing at sea ordered as one, told so; its mark
- One division of a landing at sea ordered alone: refused `AtSea` (new reason 20: "it is at sea with its landing,
  which goes as one: select all of the landing..."), not `Aboard` ("takes no order until it lands", false since
  R33b for a whole landing). A lone division at sea is its whole landing: refused for the landing's own reason
  (`serverOrderNews`'s Kassel case now `NoLanding`).
- `landingAtSeaOrder1938` (new, server news): one of the two at sea to Fuzhou refused `AtSea` and told, both land at
  Shanghai together; both by one click land at Fuzhou together; the hint over Fuzhou marks one landing for the one
  at sea (R43-N4). `landingMark1938.spec` extended: at sea, Fuzhou marked (new), Shanghai its own; shot looked at.
- The mark, panel and news already read `world.landings` since R33b (grid mark column 0).
- R43-N1 (player's order to idle transports undone) filed under R33d.
- **Next:** R33d.

## 2026-11-06 — R33d: recall rejoins; the player's transports keep their order; the landing checker (ADR-831)
- Grid's open case (the walker re-sent elsewhere, then recalled): it kept a landing of its own at another port and
  its mate sailed alone. Now a whole gathering landing redirected to a place another gathers for at another port
  of their land joins it, if none of it stands at its own port (R29b: one at its port does not walk), keeping the
  hour it joined (`World.rejoined`, not saved). Grid **6 of 480** (R33b 15): the recall after 3 or 5 days, the mate
  already at sea; by decision.
- R43-N1: `PlayerOrderKind.called` for transports a landing called or holds; R31d's hand-back is theirs only.
  `fleetOrderKept1938` (Britain 15101, 1072 onto the Channel): red at t26 before, green 20 days.
- `landingInvariants` (`tests/helpers/`, `tools/diag/`, `tests/unit/landingInvariants1938`): random orders, rules
  each hour, a save probe. First runs: checker fixes (the AI may ship a division whose order is over, ADR-759;
  a merged landing sails to its port aboard; an escort is let go the hour after its landing). One real find: a
  sunk group stayed in its landing till the next hour (seed 17203); `leaveLanding` drops it at once. 120 days on
  3517, 4021, 8803 (Japan), 15101, 16117, 17203 (Britain): 0 broken.
- Whole unit suite green (snapshot-perf red under load, green alone); 44 landing test files green; pin unmoved.
- **Next:** the critic, full (R33's end).

## 2026-11-06 — Critic run 44 (full) on 0fba90d8: two blocking issues, R44-B1 and R44-B2; naval 6 (bar 8); the loop stopped
- Full run. Scores: 7 for map, diplomacy, emergent, god mode, editor, stats, UI, performance, stability; 8 for
  semantic zoom, tanks, aircraft, AI nukes; naval 6 (bar 8; run 43: 7). R43-B1 and R43-N1–N4 verified fixed; old
  saves mid-landing migrate; AI worlds byte-identical to run 43's.
- Two blocking, both regressions of R33: R44-B1 (a landing re-sent in part keeps too few transports and sails
  leaving some at the port; 6 of 8 split shapes, 0 at `813eb375`), R44-B2 (a landing at sea clicked onto water
  turns home, refused a day later). R33 ticked; R36a/b filed, held.
- The exit (ADR-829) holds: ADR-832 proposed, the user's decision (recommended: fix both inside the object with
  wider checkers, then the critic).
- **Next:** the user's decision on ADR-832.

## 2026-11-06 — R36: run 44's two regressions fixed inside the landing (ADR-832, way 1)
- ADR-832 accepted by the user ("Let's do option 1").
- Checkers first: `landingInvariants` clicks the sea and three of the pool, and checks `cancelWater` and
  `leftBehind`; on HEAD `cancelWater` broke 19 of 24 runs. New tests red on HEAD: `landingPartResent1938`
  (4 cases), `landingSeaClick1938` (4 waters).
- R36a: a landing sails with room for all at its port, a group called when short; R17b's next voyage only
  with no group anywhere. The critic's 10 split cases: every one-click group within 2 h (HEAD: 7 split).
- R36b: a landing at sea ordered to the sea is refused `OpenSea` at the click and keeps its course; the
  tooltip over the sea says so.
- Checker 0 broken on 30 runs (120 days); grid 6 of 480 as R33d; landing/convoy tests 42 files green;
  `landingMark1938.spec` green.
- **Next:** the critic, run 45.

## 2026-11-06 — Critic run 45 (focused) on 7e09b7b3: one blocking issue, R45-B1; naval 7 (bar 8); the loop stopped
- Focused run. Scores: naval 7 (bar 8; run 44: 6); map, UI, stability 7 rescored; the rest carried (7; 8 for
  semantic zoom, tanks, aircraft, AI nukes). R44-B2 fixed everywhere; R44-B1 fixed in run 44's shapes (0 of 8 on
  three seeds); AI worlds byte-identical.
- One blocking: R45-B1, R44-B1 where the freed group is busy (18705, 1 of 40 shapes). R45-N1: re-sent parts land
  5.5–6.7 days later than at `813eb375`.
- Exit (ADR-829): naval under its bar three runs in a row. ADR-833 proposed, the user's decision (recommended: one
  bounded fix, R37, then way 2 on any further naval blocking issue). R37 filed, held.
- **Next:** the user's decision on ADR-833.

## 2026-11-06 — R37: run 45's blocking issue and the naval non-blocking ones (ADR-833 accepted)
- The user: keep fixing the landing until naval is at its bar; take its non-blocking issues; anticipate the critic.
- R37a (R45-B1, R45-N1): a re-sent part takes the groups its click freed; a busy group may be called; one left
  for the next voyage is told. 18705's three land together; re-sent parts land as at `813eb375` again.
- R37b (R44-N1): panel states `ready`, `nextVoyage`; a recall reads "Aboard, sailing back to Tokyo"; the
  landing-left notice goes at the next order; a recall's hover names the port.
- R37c (R44-N2): sibling landings for one place from two ports land within a day (unless one waits over a week).
- R37d: the critic's 162 headless cases and 22 page probes replayed first; two faults found and fixed before
  commit. Checker 0 of 30; grid 6 of 480; whole unit suite green (snapshot-perf alone); 14 landing specs green.
- **Next:** the critic, run 46.

## 2026-11-06 — Critic run 46 (focused) on 4040cad6: one blocking issue, R46-B1; naval 7 (bar 8)
- Focused run. Scores: naval 7 (bar 8), UI 7, stability 7 rescored; the rest carried. R45-B1, R44-N1/N2 and
  R45-N1 verified fixed.
- One blocking: R46-B1, a landing's transports sunk at sea: its drowned divisions told "no transports at a port",
  the loss untold (landingInvariants on a new seed; code from R33b). Non-blocking R46-N1–N5 (the sibling wait
  reads "ready"; the rejoin hover cut on a phone; a 40-day walk to a far port; `leftBehind` on a told next
  voyage; Britain's n6_012 17–19 h later, within a day).
- ADR-833: no exit for naval. R38 filed (R38a–f).
- **Next:** R38.

## 2026-11-06 — R38: run 46's blocking issue and its non-blocking ones (ADR-833)
- R38a (R46-B1): divisions aboard transports sunk at sea are lost with them and told so (`LostAtSea`, news
  "lostAtSea"), not refused "no transports"; the panel reads "at sea" till the hour's end. Unit case red without it.
- R38b (R46-N1): a landing waiting for its sibling says so, with the port and days (`sibling`); `ready` lasts an
  hour at most in run 46's 50 x-cases.
- R38c (R46-N2): the tooltip stays within a phone screen (562 px past a 390-px screen before; 200 px, 8 px in now).
- R38d (R46-N3): a free group over 20 cells farther than the nearest port: a group is called to the nearer; 18705
  and 19111 clean. Joining a far gathering landing from the nearer port was tried and dropped: it split one click
  into a landing per port (35 → 160 splits of 383). 19206/19207 Japan `stuck` (a 45-day march) left, a follow-on.
- R38e (R46-N4): `leftBehind` exempts a told next voyage; the checker takes short pools (1, 2 groups) and an hour hook.
- R38f (R45-N3): the sea hover says a click is refused for a gathering landing and for land formations in no landing.
- Before the critic: run 46's 383 headless cases (landings as in run 46: splits 35 of 35, none later) and 35 page
  probes (landings as in run 46, no page error) replayed; checker 0 broken on 20 new seeds and 12 short pools but
  the two `stuck`; whole unit suite green (two timing tests alone); 14 landing specs green.
- **Next:** the critic, run 47.

## 2026-11-06 — Critic run 47 (focused) on f464db35: one blocking issue, R47-B1; naval 7 (bar 8)
- Focused run. Scores: naval 7 (bar 8), UI 7, stability 7 rescored; the rest carried. R46-B1 and R46-N1–N4
  verified fixed (19206/19207 `stuck` left, R47-N4); landings as in run 46; no page error.
- One blocking: R47-B1, a landing whose last group is destroyed (bombed at port, or sunk with some left for the next
  voyage) tells "no transports at a port", false where another group is idle, and never tells the sinking.
  Non-blocking R47-N1–N4 (the lost row unnamed; the tooltip past the bottom; R38d by straight cells; 19206/19207).
- ADR-833: no exit for naval. R39 filed (R39a–e).
- **Next:** R39.

## 2026-11-06 — R39: run 47's blocking issue and its non-blocking ones (ADR-833)
- R39a (R47-B1): a landing left with no transport group calls another (free, idle or busy) and goes on; its groups
  destroyed, its divisions are told `TransportsSunk` (another called, or the landing over), never "no transports
  at a port". The critic's USA case: told at t273, 1123 called; case B: those at the port told, none refused.
- R39b: a notice keeps the division's name ("Square infantry division 365", not "A formation").
- R39c: the tooltip stands above the mouse near the screen's bottom.
- R39d: R38d's call is taken only when it lands over a day sooner by hours; Moscow to Cyprus keeps its free group.
- R39e held: 19206/19207's 45-day march is one click of two divisions far apart; landing together keeps it.
- Before the critic: run 47's 383 headless cases (as in run 47), far, sinking and checker jobs, and 37 page probes
  (as in run 47, no page error) replayed. Unit suite: 30 timeouts in one loaded full run, every file green alone;
  landing specs green (two timeouts in the batch, green alone).
- **Next:** the critic, run 48.

## 2026-11-06 — Critic run 48 (full) on 4ebaee76: one blocking issue, R48-B1 (diplomacy); naval 7 (bar 8)
- Full run. Scores: diplomacy 6 (down, R48-B1), naval 7 (bar 8), semantic zoom, tanks, aircraft, AI nukes 8, the
  rest 7. R47-B1 fixed in both cases; R39b–d verified.
- One blocking: R48-B1, a puppet rising against an overrun overlord goes free with no war (diploInvariants 20429
  random, day 546); the same on `f464db35`, not R39's. Naval held under 8 by R48-N1 (`World.sunk` not saved) and
  19206/19207 `stuck`. Non-blocking R48-N2 (one cut row for two lost), R48-N3 (hero tags over Europe).
- R40 filed (R40a–e).
- **Next:** R40.

## 2026-11-06 — R40: run 48's blocking issue and its non-blocking ones (ADR-834; R40e held for the user)
- R40a (R48-B1, ADR-834): a rising whose war may not be declared (an overlord overrun) is told as a release ("was
  freed from"), not "rose against" with no war. 20429 random ten years: 0 broken; the critic's four other ten-year
  seeds 0 broken.
- R40b (R48-N1): `world.sunk` saved while set; a save and load in the sinking hour still tells the sinking.
- R40c (R48-N2): two lost in one hour make one row naming both.
- R40d (R48-N3): with the whole world in view a hero's counter is its nation's size (T0 keeps twice).
- R40e held: 19206/19207 `stuck` is a march (367 walks ~70 cells, ~1 a day, through landings 7, 11, 12, 7 as the
  checker's orders re-click it); no port rule clears 45 days reliably. The bar is the user's question.
- Before the gate: run 48's 38 headless jobs (as in run 48 but 20429 fixed) and its lost and rise page probes.
- **Next:** the user's answer on R40e; then the critic, run 49.

## 2026-11-06 — R40e: `stuck` is a stall; `farPort`; a freed group judged far (ADR-835, the user's decision)
- The checker's `stuck` counts days with no ground gained, not days gathering; the longest spell of each division is
  a note. Planted stalls (frozen, circling) still `stuck`; the same orders unplanted are not.
- New rule `farPort` (R39d as a checker): breaks at `4040cad6` on 18705 and 19111 (R46-N3's Sasebo walks); 0 at HEAD.
- It found a fault, fixed: a group freed by the click's own re-send was taken at any distance (19207: 24 days' walk).
- Not taken, R41: dropping R38d's 20-cell gate or sending the far group itself splits R37c's clicks (35 → 58).
- Before the gate: every checker seed the critic has run 0 broken; run 47's 383 cases as in run 47.
- **Next:** the critic, run 49.

## 2026-11-06 — Critic run 49 (focused) on 5da444a8: no blocking issue; naval 7 (bar 8)
- R48-B1 and R48-N1 fixed; R47-N4 closed under ADR-835 (every landing seed 0 broken, the notes read as built).
  Diplomacy 6 → 7. Naval 7: "nothing new earns an 8"; a month-long two-division crossing with no day count (R49-N5),
  the cut loss row (R49-N3). R49-N4 is R41 reproduced.
- R42 filed (R42a–e); R41 carries R49-N4.
- **Next:** R42.

## 2026-11-06 — R41: R38d's gate goes; a sibling waited for up to a month (ADR-836)
- The user chose R41 before R42. The 20-cell gate is gone (hours decide, `callSooner`); a landing waits up to a
  month for a sibling of its click (a week before), so R37c's lands-together holds when one side is near its port.
- No cap tried first: run 47's `fresh2` stood still (no one landed); a month keeps its pair landing at 656.
- Run 47's 383 cases: 35 split as before, four English cases now land (274 at hour 64) instead of a refusal.
- Checker: `farPort` at any distance; a sibling's ground counts; an escort let go is forgotten (20405).
- **Next:** gate; then R42 (or the critic first: the user's call).

## 2026-11-06 — R42: run 49's issues (ADR-837)
- R42a: the hover over the landing they have says "it sails from Tokyo in about 47 days, when the last of it is
  there" (sailed after 46.6); the marching one's panel its days. Before the click not told (no landing yet).
- R42b: beside a panel the last two order rows; "2 divisions lost at sea with their transports", names in the tooltip.
  A phone kept ADR-760's one order row at first (see below).
- R42c: hero counters 1× at 10,000 m/px to 2× at 5,000 (not 3,000: PLAN 7.184b3's AT), within a quarter of the screen.
- R42d: `PuppetReleased` in the ticker (cue "return"). R42e: "their port".
- Specs run by hand: `landingClickWait1938`, `orderRowsPanel1938`, `heroes1938` (R40d, R42c, 7.184b3), `ticker1938`,
  `landingMark1938`'s text unchanged. Budgets: no sim system changed; one pass over 14 heroes a frame.
- **Next:** the batch's critic run (R42 was its last item).
- Then the user's choice: on a phone, two orders' rows in place of the newest event (ADR-760 amended, ADR-837);
  `orderRowsPanel1938`, `phoneLayout1938`, `ticker1938` by hand.
- Before critic run 50 (ADR-833): run 49's 62 headless jobs replayed on `3fe138b1` (`.cache/replay49`): every checker
  0 broken, both worker hashes as in run 49, all 29 far/sunk cases the same event for event, the risings the same.
  Its 14 page probes: no page error; the lost rows whole and the at-port row on the screen (desk, phone), the freed
  rising in the ticker, hero tags 74 → 98 → 129 → 148 px from 10,000 to 5,000 m/px (phone at most 25 %).

## 2026-11-06 — Critic run 50 (full) on `3fe138b1`: no blocking issue; naval 7 (bar 8)
- Scores: map 7, diplomacy 7, dynamics 7, God 7, editor 7, stats 7, UI 7, performance 7, stability **8** (up), zoom 8,
  naval 7 (bar 8), tanks 8, aircraft 8, AI nukes 8. Blocking: 0. Every checker 0 broken (18 diplomacy, 19 landing,
  5 world, 2 worker seeds).
- R41 and R42 confirmed: no `farPort` note; the click's days count down and the landing sails on the day said; hero
  tags blend; the release in the ticker; both order rows on the screen.
- Naval under its bar: no exit (ADR-833); R43 filed (R43a–f): R50-N1 the click's own last division unbounded (35 days
  at Tokyo), N2 single order rows cut, N3 phone names, N4 release after its effects, N5 a march on after the landing
  ended, N6 God's revolt names.
- **Next:** R43.
- R43d: the ticker tells a release or rising before the wars it left that hour (`causeFirst` in `tickerRows`; the
  sim's log order unchanged). `realmWars` (Manchukuo) red before, green after.
- R43a (ADR-838, the user's choice of a sibling, a week): a click's division a week nearer its own port boards there,
  a sibling landing; the two land together. 20841 39.6 → 5.4 days, 20661 26.3 → 5.3, 3517's four 11 days with
  Sapporo's sibling told. A gathering landing's voyage from its port, a 12-hour slack on a sibling's wait, a 6-hour
  hold after a click's last order. Run 47's grid (403 jobs): splits 5 → 5, no landing 54 → 30, 259 sooner, none
  later; run 50's 19 landing checker seeds 0 broken. Tests of one landing at Tokyo place their divisions within
  Tokyo's reach (`nearPort`; specs `tokyoReach`); claims kept. `invasion1938` was red since R33c (an aboard division
  alone is told why its landing cannot go: "no water ... to land from", not "aboard"): its expectation follows R33c.
- R43b (ADR-839): a single order row beside a panel by its gist: "366: transports sunk, the landing is over", a refusal
  "365: not done, no coast to land on"; the full words in the tooltip. Specs by hand: `orderRowsBrief1938` (new; each
  kind and reason with the longest names that can be told it, at 1600, 844, 390 px), `orderNews1938`,
  `orderRowsPanel1938`, `ticker1938`, `phoneLayout1938`, `invasion1938`, `landingClickBatch1938`,
  `landingLeftTold1938`, `landingNearNews1938`, `landingNeutral1938`, `landingPortShut1938`. No sim change; budgets
  unmoved (one string a row).
- R43c (ADR-840): on a phone the first tap on a shortened order row opens it to its full words (a loss's names), the
  next flies there. Specs by hand: `orderRowsTap1938` (new), `orderRowsPanel1938`, `orderRowsBrief1938`,
  `orderNews1938`, `ticker1938`, `phoneLayout1938`, `landingLeftTold1938`. No sim change; budgets unmoved.
- R43e (ADR-841): a landing that ends, however, stops its divisions' march to its port (R21a's peace stop made the
  rule). 20845 (the critic's `c47_far.ts`): told at t89, no longer at Hamburg at t222/t242. New checker rule `marchOn`:
  run 50's 19 landing seeds 5 broken (28, England's) before, 0 after; every landing unit test green (46 files). No
  AI rule changed: the pin unmoved; budgets: one test per division when a landing ends.
- ADR-842 (the user's decision): R43f, then R34 and R35, before critic run 51; no critic run after R43f.
- R39e ticked: done by R40e (`5da444a8`, ADR-835), confirmed by critic run 50.

## 2026-11-07 — ADR-843 (the user's decision): naval's bar after run 50
- The loop analysed at the user's request: runs 49–50 had no blocking naval issue and still 7 ("nothing new earns an
  8"). All six options taken: CRITIC_PROMPT OUTPUT 4 ("what the bar needs"), PROMPT "RELEASES" step 1 (the filing
  commit files that dimension's objections and ideas); R44 `slowClick` before critic run 51; Batch 4 R45–R47.
- **Next:** R43f, R44, R34, R35, R45, R46, R47, then critic run 51 (the user: all before 51).

## 2026-11-07 — R43f: a nation God founds is of the province clicked (ADR-844)
- `spawnRebels` takes God's `seat`: the capital is the clicked province's largest city, else its own cell nearest
  that province's middle; the origin (the capital's province, ADR-100/103) and so the name follow. The sim's own
  revolts and a Kill's pieces unchanged: the pin unmoved.
- Run 50's case: Spawn ×5 on Greater Poland founded "Free Silesian Voivodeship" (Katowice the area's largest city);
  now "Free Greater Poland Voivodeship", its flag in Greater Poland (the critic's probe replayed on the build,
  `.cache/r43f`). The probe's `revolt_bavaria` cell is in Saxony: "Free Saxony" was right.
- Test: `nationNames` sweep (every 7th province × sizes 1, 2, 5, 12, 24 and region revolts, 2,000+ founded):
  1,698 named for another province before, 0 after. Related units green (`godMode`, `rebelCapitals`,
  `revoltRegion`, `statelet`, `foundedFlags`, `godActsHistory1938`, `tableGrowth`, `flagAtlas`).
- Specs by hand: `godMode1938`, `godPanelMore1938`, `godRevolt1938`, `godUi1938`, `loadedWorld1938`,
  `seamItems1938`, `workerNodeGrowth1938` (30 passed). Budgets: God commands only; no tick system changed.
- R43 done. **Next:** R44 (`slowClick`).

## 2026-11-07 — R44: `slowClick`, the checker (ADR-845)
- `tests/helpers/slowClick.ts`: a click's first division ashore within 7 days of its best single-division way
  (`bestWayHours`, `farPort`'s reckoning moved there), in the fuzz and the grid (`slowClick` kind, `worstSlow`).
- The critic's cases (`slowClick1938`): broken at `3fe138b1` (20661 11.8 days, best 4.8; 20841 10.8, best 3.8; a
  worktree), ashore 0.1 and 1.1 days over at HEAD.
- Run 50's 19 landing seeds: 18 clean; worst ashore 3.8 days over its best way (20629, 367: 6.2 for 2.4). 20827 broken:
  R44a filed (one port for all, a 12-day walk to it). Grid: 3517 160 run, 15101 240: 0 `slowClick`, worst 14.2 h over;
  3517's 3 splits (recall at 120 h) the same on HEAD without the checker.
- `landingInvariants1938` (11) green. No sim change: the pin and budgets unmoved.
- **Next:** R44a.

## 2026-11-07 — R44a: a ready landing waits six days from its ready hour (ADR-846)
- 20827: the wait was read anew each hour, so each marching division came within the week in turn (8 days past
  ready at Newcastle). Now `Landing.ready` (saved, optional section) anchors it: `READY_WAIT_HOURS` (144) from then.
  One not waited for goes on the next voyage; its panel says the landing sails before it is there.
- AT: run 50's 19 landing seeds 0 broken; the worst click 4.6 days over its best way (20827, 10.5 days for 5.8).
  Grid 0 `slowClick` (worst 14 h), the same 3 splits. R44 done.
- `landingLegacySave1938`'s claim follows the rule (364 at t185, 365 on the next voyage at t634; was 19 days' wait
  together). Whole unit suite green (two timing tests red under load, green alone). Specs by hand: invasion1938 and
  the 15 landing/order-row specs (31 passed). Pin unmoved; no system's tick cost changed beyond one test a march.
- **Next:** R34.

## 2026-11-07 — R34 split (R34a–l); R34a: the relations graph's labels (ADR-847)
- Labels one size on the screen (11 px; were 10 drawing units, ~6 px on a phone), placed in order of importance
  where they overlap none placed before (`placeLabels`); a hidden one in its title and a tap.
- `relationsLabels1938` (new): 20887 desk and 20889 phone a year on, whole and ×3.4: 0 overlapping pairs (18 before),
  each ≥ 10 px; 32 named whole on both. `relations1938` green. Unit `relationLabels` (5). Evidence `docs/evidence/R34`.
- No sim change; one placement pass over ≤ ~100 labels a render of the panel.
- **Next:** R34b.

## 2026-11-07 — R34b: the ranking's names whole
- The ranking is as wide as its longest row (15–20rem, never past the view); a longer name is cut with its title
  the name, and a tap opens its panel. Values unchanged (`rankingRows1938`'s one number).
- `rankingNames1938` (new): 20895's start, every present list, desk and phone: no name cut ("French Equatorial
  Africa" and "Anglo-Egyptian Sudan" cut before). The 10 specs that read the ranking: 28 passed. Evidence
  `docs/evidence/R34/ranking-names-*.png`. No sim change. A small choice, no ADR (a width).
- **Next:** R34c.

## 2026-11-07 — R34c: History rows wrap beside their date
- A History row is the date and its text side by side (flex): a long text wraps in its own column, not under the
  date. `historyWrap1938` (new): 20429 eighteen months on, 400 rows: rows with a line under the date 73 → 0 (desk),
  194 → 0 (phone). R32-N3's refusal half was R43b's (`orderRowsBrief1938`). Evidence `docs/evidence/R34/history-wrap-*`;
  five older History-row shots redrawn in the new layout.
- The 14 specs that read History: 51 passed after the fix below. R34a had moved `heroesRead1938`'s R11 phone case
  (a zoomed name twice the size): its claim follows ADR-847, committed alone (`65cb615e`).
- **Next:** R34d.

## 2026-11-07 — R34d: a map tool's refusal on the tools' bar
- Breakthrough at peace was refused since PLAN 7.165 (`AtPeace`), but its words were only in the God tab of the
  nation's panel: from the map tools' bar with the panel on another tab (critic run 37's path) nothing showed. A
  command a map tool's click sends now has its refusal on the bar (`god-tool-refusal`), cleared by the next tool or
  command. With no nation selected the bar's hint already asks for one.
- `godBreakthrough1938`'s new case (11003, the panel on Overview): red before, green. The God specs: 27 passed.
  No sim change.
- **Next:** R34e.

## 2026-11-07 — R34e: hero counters clear of the panels
- MapView reads the panels over the map (top and bottom bars, Ranking, a nation's, formation, History, Relations,
  editor, settings, legend) every 250 ms; a hero counter under one is drawn beside it (`clearOf`): left or right at
  its own height first (R8's "within a step of its place"), else below or above; a thin line to its place.
- `heroesClear1938` (new; desk, heroes on): 5521 and 1201 at the start, 7019 at day 730: under a panel 2, 2, 1 →
  0 (Japan's O-I and Yamato under the Ranking, the critic's case). The 13 specs that read counters or heroes:
  39 passed. Unit `clearOf` (4). Budgets: ~10 `getBoundingClientRect` every 250 ms; no sim change.
- **Next:** R34f.

## 2026-11-07 — R34f: the first tap after a drag in the relations graph
- The cause: after a one-finger drag Chrome took the next tap for stopping the drag's fling and sent no click
  (pointerdown and pointerup came, no click, even 1.5 s later), so the nation tapped was not chosen. The graph now
  reads a finger's tap from its pointer events (same finger, no drag, under 10 px) and clicks what it went down
  on; the browser's own click within 800 ms after is dropped, so a tap is never two clicks. Mouse unchanged.
- `relationsTap1938` (new; phone, the critic's 4111 a year on): a tap, a drag then a tap and a second tap, a pinch
  then a tap: red before at the tap after the drag. The relations specs: 5 passed.
- **Next:** R34g.

## 2026-11-07 — R34g: a hero's marker no longer hides the stack under it
- At T1 a hero's marker (twice the others') was drawn over the markers where it stands: Bismarck at Kiel hid the
  German fleets' "×4" (3739, two hours in, 1,200 m/px), and every click opened Bismarck. The stacker's nudge
  (7 px at most) cannot clear a box twice its size, so the hero's marker steps instead (`heroClear`): just above
  the markers it would cover, clear of their tags, or below when that covers less; a thin line to its place.
- `heroStack1938` (new): markers under Bismarck 1 → 0; a click on the fleets opens a fleet, on the hero the
  hero. The 27 specs that read markers or heroes: 67 passed.
- **Next:** R34h.

## 2026-11-07 — R34h: a trait's words on a tap
- A trait chip in a nation's panel is a button: a tap shows what the trait does on a line under the chips, a tap
  again (or another nation) hides it; the hover title stays. In the God tab, where a tap on a trait toggles it,
  the trait last touched is named and described under the list.
- `traitsTap1938` (new; phone, Germany): red before (no words on a tap), green; `godUi1938` green.
  R32-N2's other half (nothing shows a trait act) is not this item.
- **Next:** R34i.

## 2026-11-07 — R34i: why sea heroes die so often
- Probe (`.cache/r34i/probe.ts`, six of the critic's seeds × five years, heroes on): every sea-hero loss with its
  place, hours alive, hours engaged. Before: 62 Soviet losses, 19 sea-hero losses within 24 hours of a return.
  Sovetsky Soyuz came back on Leningrad's water under the US fleet (5867) or Hood (4253) and was sunk in 2 to 12
  hours, every 60 days.
- ADR-848: a sea hero comes back only where no enemy fleet holds the port's water (`BLOCKADE_CELLS` 2); none, it
  waits and says so ('blockade'). After: within 24 hours 19 → 2; Soviet losses 62 → 58.
- The rest, found and not changed: the Soviet Union has no other fleet of power, so the naval AI orders the hero
  itself, and at `AVOID_RATIO` 1.5 it fights at even odds: out of Leningrad at Hood (25,000 each) under British
  bombers, lost 60–71 hours after each return. Every fleet's rule; a change is the user's.
- Unit: `heroes` (18, a new case), `worldInvariantsHeroes`, `saveFormat`: 25 passed. Heroes off by default: no pin.
- **Next:** R34j.

## 2026-11-07 — R34j: the same landing clicked again is told
- A click of the player's divisions asks the worker's read-only `overSea` before the orders go; where all of them
  already have the landing it is for (`same`, one mark), the page adds an order's notice: "{name} and 3 more:
  already bound for this landing; the order changes nothing", in the panel and as a row; the next order takes it
  away. No sim change. The escort box on a re-click is still not applied (R36-N3's second half): the words say so
  by saying nothing changes.
- `landingSameClick1938` (new; 3517, Japan's four to Shanghai, again, then Fuzhou): red before, green. The order
  and landing specs: 31 passed.
- **Next:** R34k.

## 2026-11-07 — R34k1: Escape takes the landing's mark away
- R34k split in three (Escape; a mark off the screen at unit zoom; a touch screen). The hover's sea hint is asked
  again on any change of the player's selection: Escape (or a click, a box) with none left clears the mark and the
  tooltip at once, the cursor still.
- `landingMarkMore1938` (new; 3517, Japan's division nearest Tokyo, the cursor on Shanghai): red before (the mark
  stayed), green; `landingMark1938` green.
- **Next:** R34k2.

## 2026-11-07 — R34k2: a landing's mark off the screen is pointed to
- With no copy of a landing's mark on the screen (a unit's zoom), an arrow in its colour at the screen's edge, on
  the line from the middle to its land, points the way (`drawLandingMark` returns it; `MapView.landingEdges`).
- `landingMarkMore1938`: 30 m/px, the cursor 0,2 / -3,3 / 2,-2 cells from Shanghai: on the screen no arrow; off it
  (2,-2) an arrow at (376, 26) towards the land; red before. `landingMark1938` green.
- **Next:** R34k3.

## 2026-11-07 — R34k3: a touch screen sees the landing before it orders (ADR-849)
- A tap of the selection that would go by sea shows the hover at the tap (the mark, the tooltip, "Tap again to send
  them") and orders nothing; a second tap there orders; a march by land is sent at once. The next finger down
  clears the tap's hover. R34k done.
- `landingMarkMore1938` touch case: red before (the first tap ordered, no mark), green 8/8 at six workers. The case
  first tapped by Shanghai, where a Japanese division stands within 14 px: the tap picked it (right); Fuzhou has
  none. The land march goes through the page's tap handler at a point off the canvas (a drawn counter under a
  chosen point made it flaky). The touch and mark specs: 32 passed.
- **Next:** R34l.

## 2026-11-07 — R34l: the tooltip says how many go by sea
- `seaHint` counts the land formations whose order goes by sea of all selected (`part`, when not all); the hint is
  the first that goes by sea's (a marcher first gave none). The tooltip adds "{n} of the {m} selected go by sea;
  the rest march". 3517, all of Japan's 33 to Shanghai: "4 of the 33".
- Unit `landingHintSelection1938` (a new case): red before, green; the seven `seaHint` tests: 19 passed; the
  tooltip specs: 13 passed; `landingMarkMore1938`: 6 passed. R34 done.
- **Next:** R35.

## 2026-11-07 — R35: the reports' small ideas (ADR-850)
- An order's error cleared by the next order (R24c), the destination's flag (ADR-827's mark), a preview on touch
  (R34k3's two taps): in the game already. New: a fleet once on a player's order and on none now, its navy the AI's,
  says so in its panel ("Done with your orders: the AI commands it again"); the worker remembers such fleets.
- `fleetAiBack1938` (new; 3517, a Japanese division Tokyo → Shanghai: its transports, released once it is ashore):
  red before, green; a fleet never ordered has no line. The order and panel specs: 27 passed.
- **Next:** R45.

## 2026-11-07 — R45: the critic's replay as a tool (ADR-851)
- `tools/diag/replayCritic.ts`: run 50's 65 headless jobs from `critic/scripts/c50_jobsAll.txt`, 6 at a time, at
  HEAD or at a commit in a worktree; outputs compared with the critic's (wall time out, sim time in); `--new K`.
- At run 50's commit 3fe138b1: 65 of 65 the same (30 min). At HEAD: 30 the same, 35 differ, each named with what both
  say (R43's landing notes, transports sailing at once, far landings' fleets); 95 jobs on 5 new seeds a family, all
  exit 0, every checker 0 broken. Reports in `docs/replays/`.
- A failed edit script let a whole rerun start; stopped, its sims killed, the ten logs it rewrote run again.
- **Next:** R46.

## 2026-11-07 — R46: sea battles the critic can find (ADR-852)
- `tools/diag/seaBattles.ts`: each sea battle of a run with its hours, sea, sides, fleets, losses and a camera;
  `tools/diag/seaBattlesLook.ts`: each looked at in the page, each side's ships counted in the view.
- 20885, 7019, 3517 × 5 years: 85, 90, 100 battles; all 275 seen. On the way: one-hour battles (11, 30, 23) are
  never in `world.seaBattles` at an hour's end, so their fleets are taken from about their place (a side sunk
  whole leaves the other; carriers fight from 14.5 cells). 20885's first battle: t107 Black Sea, SOV v ROM.
- **Next:** R47.

## 2026-11-07 — R47a: a landing's row, its data (ADR-853)
- R47 split: a data (this), b the bar on the page, c the cancel, d the AT on the critic's cases.
- `landingRows` (sim, read only) and the worker's `landings` message: each landing's port, target city, divisions
  with their panels' voyage, ships needed and had, days to sail; over, its outcome for a day. `hud.landings`.
- `landingRow1938` (new; R42a's four Tokyo → Shanghai): one row, each hour its divisions as their panels, sails, over
  "landed" 4, kept a day; red before.
- **Next:** R47b.

## 2026-11-07 — R47b: the landings bar (ADR-854)
- `LandingsBar` (top middle; a phone's width under the top bar): a row a landing, opened to its divisions with their
  panels' words (`voyageText`, `waitText` shared with `FormationPanel`), the anchor to its land.
- `landingsBar1938` (new): desk hour by hour against the panel, gathering → at sea → over, gone a day on; landscape
  and phone inside the view. Red before (3 of 3). The 27 specs that read the panel: 26 passed, `landingWait1938`
  (phone) red at 4 workers on a count ("1 of 2" for "1 of 4"), green alone.
- **Next:** R47c.

## 2026-11-07 — R47c: a landing's cancel from its row (ADR-855)
- The row's cancel orders its divisions to its port's cell in one click's batch; the sim's rules do the rest (at
  sea it turns back, gathering they leave it). Told "cancelled: back at {port}" once over.
- Found on the way: an ended landing's opened row kept its divisions' last voyage ("it sails when …"); now blank.
- `landingRow1938` +2 cases (gathering, at sea), red before; `landingsBar1938` +1 (the button): 4 passed.
- **Next:** R47d.

## 2026-11-07 — R47d: the landings bar on the critic's cases (ADR-856); R47 done
- `tools/diag/landingRows.ts` (with `tests/helpers/landingRows.ts`): run 47's grid and run 50's far routes through the
  worker, each hour the rows against the panels. Grid 3517: 40 cases (20 skipped, none walking), 15101: 60; far: 8.
  0 broken over 19,905 hours. A planted fault (a division dropped from each row): 7 of 8 far cases broken.
- On the way: 20661 → Qingdao made no landing; the AI shipped the division itself. Not the player's landing, not the
  bar's; the reading counts only divisions in `world.landings`.
- `landingRowsCritic1938` (new, six cases, 31 s).
- **Next:** critic run 51 (PROMPT's RELEASES: the batch R43f–R47 ends in a critic run and a tag).

## 2026-11-07 — Critic run 51 (full, on `14a85a51`)
- Scores: map visuals 8 (up), diplomacy 7, emergent 7, God Mode 7, editor 7, stats 8 (up), UI 7, performance 7,
  stability 8, semantic zoom 8, naval 7 (bar 8), tanks 8, aircraft 8, AI nukes 8. Blocking: 0.
- 0 broken on every checker (25 diplomacy runs, 25 landing seeds, 8 world seeds, 3 worker seeds; `landingRows far`).
  Run 50's six findings all fixed. Naval's 7 rests on the landings bar's cancel words (R51-N1, N2).
- Filed as Batch 5 (R48 naval, R49 the rest); ADR-833: naval's findings fixed, then critic run 52.
- **Next:** R48a.

## 2026-11-07 — R48a: a landing's cancel stops those ashore (ADR-857)
- `cancelLanding`: those aboard turn back, those ashore stop where they stand; a landing at sea with one ashore turns
  back too (sim: judged by those aboard, only a cancel). Row: "stopped where they stood; the AI commands them again".
- The critic's `c51_lbar.mjs 21107 GER …` (copied to `.cache/c51`, its outputs there): day 4 the row and the panels
  agree. `landingRows` all: 108 cases, 0 broken. Run 51's 25 landing seeds: 0 broken after `marchOn` skips a retreat
  (20829 t2325: 364 beaten at Jiaxing retreated toward it).
- `landingRow1938` 4 (3 red before; the one-ashore case red on the sim change alone); `landingsBar1938` 4.
- **Next:** R48b.

## 2026-11-07 — R48b: a division on the AI's voyage says so (ADR-858)
- The played nation's division aboard or bound for a port in no landing of the player's: "At sea with the AI's
  landing (not one of yours)". `landingAiVoyage1938` (20661: 364 shipped by the AI at t217; red before); the
  critic's `c51_cancel_page.mjs 20661 …` in the page: from h216 so, no row.
- **Next:** R48c.

## 2026-11-07 — R48c: the open row's cancel in its head (ADR-859)
- At 844 × 390 the critic's 21107 three and the cancel all on the screen; under 500 px tall the bar's list runs to the
  bottom bar. `landingsBar1938` 5 (the new case red before).
- **Next:** R48d.

## 2026-11-07 — R48d: when a row sails and lands (ADR-860)
- "sails in about a day, to land with the landing from Hiroshima" for a sibling wait (it sails first when its voyage is
  longer, R51-N6); at sea "lands in about N days". `landingRowDays1938` on 20861 (red before at t3).
- **Next:** R48e.

## 2026-11-07 — R48e: siblings "within a day of" each other (ADR-861)
- Row, panel and hover: "to land within a day of the landing from …", the rule's promise. `landingWithinADay1938` on
  20661 and 20841 (each pair so told lands within 24 h). A heredoc nearly overwrote `landingTogether1938.test.ts`;
  restored from git before any commit.
- **Next:** R48f.

## 2026-11-07 — R48f: one click, one row (ADR-862)
- `LandingRow.click` (siblings taken through); the bar a row a click, a line a port, one cancel. 20861's three: one
  row, cancelled whole. `landingClick1938` 4 (2 red before), `landingsBar1938` 6.
- **Next:** R48g.

## 2026-11-07 — R48g: on a phone the panel gives way to a new landing (ADR-863); R48 done
- A new landing on a phone closes the nation's panel; `landingsBar1938` 7 (red before). Run 51's 25 landing seeds: 0
  broken. R48 (run 51's naval findings) done.
- **Next:** R49, then the critic (run 52).

## 2026-11-07 — R49a: God's Breakthrough told (ADR-864)
- `GodBreakthrough` event and row ("God opened a breakthrough for Germany"), ticker and History; the critic's
  `c51_kw_breakthrough.mjs 21151` (copied to `.cache/c51`) sees it. `godBreakthroughRow1938` (red before).
- **Next:** R49b.

## 2026-11-07 — R49b: History's hour cause first (ADR-865); R49 done
- History's rows take `causeFirst`; the panel the newest hour first, each hour as logged. `historyHourOrder` on 20429.
- **Next:** the critic's probes replayed (`replayCritic.ts`), then critic run 52 (naval, ADR-833).

## 2026-11-07 — Run 51's probes replayed at 0b3dd6e1 (ADR-833's step before a critic run)
- `replayCritic.ts --run 51 --at head --jobs 4`: 65 jobs, 63 the same, 2 differ in a note only (`slowClick`'s counts;
  20829's worst click 4.3 days over its best way, 1.7 at the critic's, inside `slowClick`), 0 broken on every checker
  (`docs/replays/run51-at-0b3dd6e1.md`). Nothing to fix first.
- **Next:** critic run 52.

## 2026-11-07 — Critic run 52 (focused, on d8dba302): one blocking issue, naval 7
- R52-B1: the landings bar's outcome ("lost at sea", "landed") from R47a's tally, false on 22103, 3517 and 21105.
  God Mode 8; every checker 0 broken; run 51's seven findings fixed on their cases. Filed as ROADMAP batch 6 (R50,
  R51).
- **Next:** R50a.

## 2026-11-07 — R50a: a landing's outcome where its divisions ended (ADR-866)
- The worker's `endLanding` per division; "broke off … away from Valletta", "transports were sunk; 2 never sailed".
  `landingOutcome1938` (3 red before); `landingRows`' `outcome` from the world (red before on 22103, 21105), 108
  cases 0 broken; `landingsBar1938` 7.
- **Next:** R50b.

## 2026-11-07 — R50b: one click's row to its end (ADR-867)
- The worker keeps each landing's click; over parts stay while the click runs, a day after its last end. 20861: one
  row, "over: 3 landed" (critic's script in the page too); 20661's cancel: one row. `landingClick1938` 6 (2 red before).
- **Next:** R50c.

## 2026-11-07 — R50c: "under attack, held up" (ADR-868)
- A landing at sea with a group engaged says so, no days. `landingHeld1938` on 21105 (red before at t38).
- **Next:** R50d.

## 2026-11-07 — R50d: turning back with its days (ADR-869); R50 done
- "turning back to Tokyo: there in about N days"; `landingRowDays1938` 20661 (red before at t29).
- **Next:** R51a, then the 25 landing seeds and the probes replayed, then critic run 53.

## 2026-11-07 — R51a: the Breakthrough row's place (ADR-870); R51 done
- The ticker names a city role as History does. `godBreakthroughRow1938` (red before).
- **Next:** the 25 landing seeds, the probes replayed (run 52's jobs), critic run 53.

## 2026-11-07 — Run 52's probes replayed at 29928a1b
- 35 jobs: 32 the same, 3 differ in an echoed path or command and one grid case's rows at the end (2: R50b keeps an
  over part beside its click's), 0 broken on every checker (`docs/replays/run52-at-29928a1b.md`); run 51's 25
  landing seeds 0 broken. Nothing to fix first.
- **Next:** critic run 53.

## 2026-11-07 — Critic run 53 (focused, on 5f8ef9e8): no blocking issue, naval 8
- Naval up to 8 (its bar): R52-B1 fixed on its three cases and new seeds; every checker 0 broken. Every dimension at
  its bar. Three small findings (R53-N1–N3) filed as batch 7 (R52), fixed before the full run 54 the release needs.
- **Next:** R52a.

## 2026-11-07 — R52a: thrown back stays so (ADR-871)
- `endLanding` keeps `repulsed`; "over: 1 landed, 2 thrown back". `landingRepulse1938` (red before); the checker reads
  a throw-back from the world; 108 cases 0 broken.
- **Next:** R52b.

## 2026-11-07 — R52b: every port turning back named (ADR-872)
- "turning back to Tokyo, Ōsaka: there in about a day"; "1 of 3 ashore; at sea: …". `landingClick1938` (red before);
  the critic's two page probes pass.
- **Next:** R52c.

## 2026-11-07 — R52c: who holds a landing up (ADR-873); R52 done
- 21105's group is in a mutual fight with British fleet 1080, 19 cells off; the row and the panels name the United
  Kingdom. `landingHeld1938` (red before). Landing tests 23, specs 8.
- **Next:** the probes replayed (run 53's jobs), then critic run 54 (full).

## 2026-11-07 — Run 53's probes replayed at 585e20a8; R52d (ADR-874)
- 18 jobs: 15 the same, 3 differ (two are R52a and R52b as meant), 0 broken; one gap, 23071's 271 thrown back with
  its group but "came ashore away": all aboard a thrown-back group now count so. `landingRepulse1938` 2 (red before).
- **Next:** critic run 54 (full).

## 2026-11-08 — Critic run 54 (full, on 8d7d02fe): one blocking issue, naval 7
- R53-N1–N3 fixed on their cases; every checker 0 broken. R54-B1: a thrown-back Malta landing (6 of 11 clicks) reads
  "lands in about a day" for a day after, then "over: 2 thrown back" beside the ticker's "landed away"; naval 8 → 7.
  Filed as batch 8 (R53); no release.
- **Next:** R53a.

## 2026-11-08 — R53a: a thrown-back landing tells one story (ADR-876)
- Rome to Valletta on 23105 and 24151: "thrown back: sailing home to Catania" in the bar and both panels from the
  repulse, both divisions told; ashore, the ticker and the bar "came ashore near Catania". Worker and UI only (the sim
  and the pin unchanged). `landingThrownBack1938` (red before); `serverOrderNews` 2207 hears `thrownAshore`.
  `landingRows all` 108 cases 0 broken.
- **Next:** R53b.

## 2026-11-08 — R53b: who holds a landing up is the fleet in its sea battle (ADR-877)
- `heldBy` reads `world.seaBattles`; on 21105 a French division in a fight beside the transports was named, now the
  British fleet is. Display only. `landingHeld1938` 2 (the new case red before).
- **Next:** R53c.

## 2026-11-08 — R53c: a march to the port gives its days to the last (ADR-878)
- Under a day from the port the days were left out; now "about a day". `landingMarchDays1938` (red before).
- **Next:** R53d.

## 2026-11-08 — R53d: the landing checker reads the news, and the critic's page clicks (ADR-879)
- A `news` kind (row, panel and order news agree) and seven Rome → Valletta page cases; red on the code before R53a
  (the six seeds the critic found), 115 cases 0 broken now.
- **Next:** R53e.

## 2026-11-08 — R53e (first part): a held landing's transports joined to the fleet that holds them (ADR-880)
- `Snapshot.holds` and `drawHolds`: a red ring on the transports and a dashed line in the foe's colour from its fleet,
  over the markers. Unit `landingHoldMark1938` (red before); spec `landingHoldMark1938.spec` (21105 h60 at 1500 and
  250 m/px, shots looked at). Display only; a few strokes a held landing.
- **Next:** R53e's corridor.

## 2026-11-08 — R53e (second part): the breakthrough corridors drawn (ADR-881); R53e done
- `Snapshot.corridors` and `drawCorridors`: each corridor in force, God's and a battle winner's, as a band edged in
  amber with chevrons, under the counters. Unit `corridorMark1938` (red before); spec `corridorMark1938.spec` (the
  critic's Berlin → Warsaw click at 1500 m/px, "Show where" at about 1,070 m/px, day 5; shots looked at). At most
  13 corridors at once on 24123 over two years. Display only.
- **Next:** R53f.

## 2026-11-08 — R53f: History's "My wars only" (ADR-882)
- While a nation is played, History keeps its war rows (`WAR_KINDS`). Unit `historyMine` (red before); spec
  `historyMine1938.spec` (Germany at war with Poland: 15 of 119 rows; desk and phone shots looked at). UI only.
- **Next:** R53g.

## 2026-11-08 — R53g: a Major Battle goes on through a lull of a day (ADR-883)
- The Tangier pair was two battles: one quiet hour ended a battle and the armies began another. Now it ends when
  decided or after 24 h unmatched. 7019, two years: battles 84 → 51, restarts within a day 36 % → 10 %, corridors
  84 → 51; 24123 91 → 69. Land of the leaders −5 % to +11 %. Pin `6012d9d2` → `bd1b6944`. `majorBattles` (red before).
  The critic's long worlds (7019, 21099, 20899) change from here: a rule moved, not a regression.
- **Next:** R53h.

## 2026-11-08 — R53h: the played nation's Build tab (ADR-884)
- Production moved from the Actions tab (1,150 px tall on a phone that shows 500) to a Build tab: Infantry, Armour,
  Navy and Air, tiles two to a row. Spec `buildTab1938` (red before; phone and laptop shots looked at); four specs
  reach the tiles through the tab. `seaRow1938`'s Speed x1 test back on `knownRed.json` with R53g (red on HEAD too).
- **Next:** R53i.

## 2026-11-08 — R53i: the run-26 scenario starts (ADR-885)
- It lacked one section, `nations.traits` (R16 came after it). A scenario file lacking only that now starts with no
  traits; the title screen says so. The hash is checked on the file as written. Unit `scenarioUpgrade`, spec
  `scenarioUpgrade1938` on the critic's own file (both red before). Saves are not upgraded.
- **Next:** R53j.

## 2026-11-08 — R53j: the editor's nation filter (ADR-886)
- A search box narrows the editor's nation lists (layer and mask) as typed, case and accents aside; the chosen
  nation stays, and typing a name picks it. Spec `editorNationFilter1938` (desk and phone, red before; shots looked
  at). `editor1938`'s bucket click finds Polish ground clear of its line. UI only.
- **Next:** R53k.

## 2026-11-08 — R53k filed; R53l: who joins a war, within reach (ADR-887)
- R53k: on HEAD 24099 and 21099 pass; 20899's Denmark is Greenland's ice counted in cells. Filed; the user chose (b),
  the bar by area (to do after R53l, on its worlds).
- R53l: a puppet of either side, and an attacker's ally, join a war only within `WAR_REACH_KM` (500) of the other
  leader's realm; the defender's pact allies wherever they are. Day 365: 21129 and 24129 no pile; 20887 one front,
  Italy against the United Kingdom's bordering colonies and allies: the user chose (a), a front, not a pile. Done. Three years on four seeds: nations a side 5.7 → 2.0, piles at the start 83 → 12, wars 225 → 240,
  capitals taken 256 → 213. A bug found on the way (a puppet that declares was dropped from its own side) fixed
  before the measures. diploInvariants 0 broken on six seeds. Pin `bd1b6944` → `8f453ee7`. Unit `warReach1938` (red
  before); 15 tests moved to cases in reach or found again (ADR-887 lists them).
- e2e found again: `fallen1938` division 555; `seaClose1938` rows at 363, 949 and 1678 for 156, 1195 and 1230;
  `formationClickPanel1938` clicks a point of the marker no other marker covers (German 20's and 23's middles were
  under another nation's); `tankSides1938` on Poland's front, the critic's case (its first pick was on the French
  border, where grey tanks are 13 of lightness from green ground: filed in BLOCKERS for the next batch).
- **Next:** R53k (b), the bar by area.

## 2026-11-08 — R53k by area waits on the user; R53o: a grey's tint by the ground as drawn (ADR-888)
- R53k (b), by area, 25 years with R53l: 21099 passes (15 years); 20899 Australia and 24099 Canada still 20 years each;
  before R53l 8 and 14. Filed with options; the user's to choose.
- R53o: the French border's German tanks stood on a plains cell beside a forest cell, half tinted light and half dark
  by the cell under each, on a ground drawn as the blend. `lightGroundBlend` judges the blend as drawn: 73 of
  lightness from the ground (was 13), Poland's front 99 as before. `tankSides1938` judges any front too (red before);
  `tint.test` the blend.
- **Next:** R53k on the user's choice; R53m.
