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
