# Critic report, run 28 (full)

- **Mode: full.** Decided from git before anything else (CRITIC_PROMPT, ADR-804): the last report (run 27, focused, on
  `15b7b08b`) has **no blocking issue and no score under its bar**, so the first condition for a focused run fails. (The
  only commit since is `73c531b6`, run 27's own report, which changes nothing under `src/`, `data/`, `public/`.) Every
  dimension is scored afresh; nothing is carried.
- **Commit:** `73c531b65d1cdd43e2150c8dbf6647155cac52b7` (HEAD at the start, `critic/c28_commit.txt`).
- **Date:** 2026-11-02.
- **Build:** `vite build --outDir critic/c28_dist`, exit 0 (`critic/c28_build.log`); **byte-identical to run 27's build**
  (`diff -rq critic/c27_dist critic/c28_dist`: no difference). Served by `vite preview` on 127.0.0.1:**5299**. Because
  HEAD's source equals run 27's commit, the "before" of every re-run case is run 27's own file (`critic/c27_*`), or run
  26's (`critic/c26_*`, commit `33c84306`) for the probes run 27 did not re-run; no worktree was needed. Chromium through
  Playwright, headless, 1600 × 900 (1400 × 800 for menus), 390 × 844 touch for the phones.
- **Runs:** run 27's and run 26's probe suites re-run on HEAD (`critic/scripts/c28_suite1.sh`, `c28_suite2.sh`,
  `c28_clicks.sh`, `c28_misc.sh`, `c28_new.sh`, `c28_page.sh`, `c28_tail.sh`; headless `c28_hq.sh`). The JSON of each
  re-run probe against the last run that had it: `critic/c28_cmp.txt` (**69 identical**; the rest differ only in
  live-speed timing, below). New this run (`c28_hq2.sh`, `c28_loy.ts`, `c28_pg2_played.mjs`, `c28_rw.mjs`,
  `c28_an_ainuke.mjs`, `c28_phz.mjs`, `c28_pup_panel.mjs`, the builder's `tools/diag/diploInvariants.ts` on three new
  seeds): a played game, the title-screen path into the random world, an AI hydrogen bomb met in the page, every zoom
  tier on a phone, puppet loyalty over 3 × 30 years, two new seeds × 30 years, integrity and bonded Force wars on new
  seeds.
- Every path below was made in this run (`c28`) unless it names `c26` / `c27`.

## Verdict

**No blocking issue. Every dimension at its bar; no score moves.** The game is the same game as run 27 (byte-identical
build), and it reproduces: 7019 × 20 years headless **20 of 20 yearly hashes equal** to run 27's, every deterministic
probe identical, the ten-year page watch the same world at 59.8–60 fps. The new seeds and the new probes found no new
blocking fault. They did find two things the last reports under-weighted, both non-blocking:

1. **No AI puppet ever revolts.** Over 3 seeds × 30 years (43,101 puppet-months, 242 puppets made), the lowest loyalty a
   puppet with autonomy ≥ 10 ever had was **30.5**; the SPEC's revolt line is 20; **0 revolts**. By the SPEC's own
   numbers it cannot happen: loyalty relaxes toward 40 + 0.6 × autonomy, at most 25 lower while the overlord loses, so
   at autonomy ≥ 10 the floor is 21. The war of independence that runs 26–27 fought over exists only through God's
   loyalty slider.
2. **R27-N2 (a bonded Force war calling a nation in beside its enemy) is not one-in-1,602:** on new seed 1777 it shows
   in 3 of the bonded Force wars tried (days 200 and 350), and the builder's own ADR-803 checker reports **7 broken
   pairs** on new seed 8209 (random diplomacy, heroes). Still a command's (God / player) only: the AI reaches no
   such state in 5 seeds × 730 days (BOTH: 0 findings).

## Scores

| Dimension | Run 27 | Run 28 | |
|---|---|---|---|
| Map visuals and readability | 7 | 7 | rescored |
| Diplomacy, war, alliance, puppet, revolt depth | 7 | 7 | rescored |
| Emergent world dynamics over long runs | 7 | 7 | rescored |
| God Mode | 7 | 7 | rescored |
| Editor and scenarios | 7 | 7 | rescored |
| Stats and history | 7 | 7 | rescored |
| UI/UX and polish | 7 | 7 | rescored |
| Performance | 7 | 7 | rescored |
| Stability | 7 | 7 | rescored |
| Semantic zoom to unit level (needs 8) | 8 | 8 | rescored |
| Naval warfare (needs 8) | 8 | 8 | rescored |
| Tanks (needs 8) | 8 | 8 | rescored |
| Aircraft (needs 8) | 8 | 8 | rescored |
| AI nuclear use (needs 8) | 8 | 8 | rescored |

**No score moves**: the build is byte-identical to run 27's and every case that scored it reproduces on the same seeds
(table below). The two findings above are counted on new seeds (or by a new measure, LOY) and are "new seeds, not
compared" in the sense of the brief; they hold Diplomacy at 7 (not 8) rather than move it.

## Run 27's cases re-run

| Run 27 case | On HEAD | Evidence |
|---|---|---|
| R26-B1, PR: Manchukuo / Albania Force war on the overlord; God's revolt (7019, day 30) | **Identical** to run 27: `WarLeft` rows, `PuppetReleased`, `BondsBroken`, `WarDeclared MAN JAP`; the revolt's war of independence. Still fixed. | `critic/c28_pr_head_7019_{MAN,ALB}.json` (identical to `c27_`) |
| R26-B1, PZ (4 seeds × 365 days) | **Identical**: 0 refusals for `Beside` on 7019, 2207, 5113, 9241. | `critic/c28_pz_{7019,2207,5113,9241}.json` |
| R26-B1, PP / FW / FW2 in the page | **Identical** (menus, ticker rows, "Your overlord · fights beside you", Force war live). | `critic/c28_pp_head_7019_{MAN,ALB}.json`, `critic/c28_fw2_2207.json`, `critic/shots/c28pp_head_7019_MAN_menu_after.png` |
| R25-B1, EXIT (3 seeds), ES, ES2 (3 seeds), COBEL | **Identical**; Poland's war on France still refused, menus as run 27. | `critic/c28_exit_head_{7019,2531,8467}.json`, `critic/c28_es2_head_*_d10.json`, `critic/c28_cobel_head_GER_ITA_POL.json` |
| R27-N1, BX: the bond's exit resets a front, no truce | **Identical** (Germany out of the Polish war with 383 cells back both ways; Italy's peace on day 37; Poland on Romania stays in its other war). Unchanged. | `critic/c28_bx_head_7019_GERatk_ITA.json`, `critic/c28_bx_head_7019_POL_ROM.json`, `critic/c28_bx_head_2531_POL_ROM.json` |
| R27-N2, OR / OR2: Mongolia on Romania (7019 day 300); every bonded Force war on 4 seeds | **Identical**: 1,602 tried, 1,592 clean, 9 `Overrun`, 1 broken; OR2 the same war lists for 60 days. **New seeds: worse** (next table). | `critic/c28_or_{7019,2207,5113,9241}.json`, `critic/c28_or2_head_7019_MON_ROM.json` |
| R27-N3, AL: live "Propose alliance" the sim refuses | **Identical at run 27's stride (7)**: POL>REP and SWI>REP at day 30. **Every pair (stride 1): 4 of 10,148 at day 30 (POL, SWI, BEL, LUX > Spanish Republic) and 1 of 10,178 at day 120 (Portugal > Brazil)**; 0 greyed but acceptable. | `critic/c28_al_7019_s7.json`, `critic/c28_al_7019_all.json` |
| R27-N4: one Force war floods the ticker | Unchanged (PP identical, five rows at once). | `critic/shots/c28pp_head_7019_MAN_menu_after.png` |
| R27-N5, BS: guarantees only the start's (4 seeds × 365 days) | **Identical** on 7019, 2531, 8467, 3739. | `critic/c28_bs_head_*.json` |
| BOTH: war-list integrity in AI play (5113, 6151, 9241 × 730 days) | **Identical**: 0 findings. | `critic/c28_both_head_*.json` |
| World dynamics, 7019 × 20 headless | **Bit-identical: 20 of 20 yearly hashes equal**; 176 war-years, 197 sea battles, 9 bursts, 82 revolts, 96 → 83 living. | `critic/c28_dyn.json`, `critic/c28_headless_7019.json` |
| LW: 10 years in the page (6151) | Same world (nation counts equal in 9 of 10 years, the closing fight at the same spot within 0.2 cells); **59.8–60 fps every year, longest frame gap 83 ms, none over 500 ms, no page error**, beside headless runs. | `critic/c28_lwdef_6151.json`, `critic/shots/c28lwdef_6151_y10_world.png` |
| BT, GU, K2, K3, DR, PG, TD | Identical. | `critic/c28_cmp.txt` |
| Run 26's probes run 27 carried (Q, A, K, Z, C, CB, CB2, WW, SB, W, PL, FO, HV, HS, SX, SXG ×2, SXT, HU, P, P2, P3, PH, TG, U, OS, OS2, FT, FP2, EX2, DL, HI, PF) | **Identical** to run 26 for Q, K, CB, CB2, SX, SXG, SXT, HU, HS, P, P2, P3, PH, TG, PL, PT, OS2 (c10), DL, HI, EX2, FT, FP2. **Live-speed timing only** for A (a random seed number on the title), C (one sortie more in two views), Z (one camera rounding), FO (0.2 px), SB (ticks one later), W (the 250 m/px samples one tick later), HV (samples at speed), OS2 (load time). G ends in the same 900 s wait at its 120-day mark as run 26 (likely the default pause on a nuclear strike, since the probe gives Poland warheads; not verified, and the same on run 26's build). PF: the same save and fight as run 26, the same frame rates within noise (120 m/px 38.9 / 36.9, 30 m/px 37.9 / 39.5 balls / Classic; run 26: 40.5 / 37.5, 38.9 / 39.9; 3000–600 m/px 60). | `critic/c28_cmp.txt`, `critic/c28_pf_7019.json` against `critic/c26_pf_7019.json`, `critic/c28_g_4877.json` |

## New in this run

| Case | What happened | Evidence |
|---|---|---|
| **LOY: can an AI puppet revolt? 3 seeds (7019, 3163, 1777) × 30 years, every month** | 12,249 / 13,418 / 17,434 puppet-months; **0 months with loyalty under 20; lowest loyalty at autonomy ≥ 10: 30.5 / 31.2 / 31.6** (Manchukuo under Japan each time); `PuppetCreated` 64 / 76 / 102, `PuppetReleased` 42 / 38 / 46, `PuppetIntegrated` 10 / 8 / 6, **`PuppetRevolt` 0 / 0 / 0**. `src/sim/systems/puppets.ts`: loyalty changes only by relaxing 0.2 a month toward `40 + 0.6 × autonomy − (25 if the overlord is losing)`, so at autonomy ≥ 10 it never goes under 21. | `critic/c28_loy_{7019,3163,1777}.json` |
| **OR on new seeds: every bonded Force war, 1777 and 8209, days 60 / 200 / 350** | 1777: **3 broken** (day 200: Turkey on Yugoslavia leaves Bulgaria + Romania and Greece + Romania on both sides; day 350: Romania on Finland and Mongolia on Finland, both Soviet puppets, call Norway and Poland in beside the Soviet Union while at war with it, 8 pairs each). 8209: 0 broken. | `critic/c28_or_new_1777.json`, `critic/c28_or_new_8209.json` |
| **The builder's ADR-803 checker on 3 new seeds, 400 days, 20 a kind** | 1777 (scenario diplomacy): 0 broken. 5521 (random world): 0 broken. **8209 (random diplomacy, heroes): 7 broken**: "HUN forceWar on POL: realm: SOV and NOR beside each other in war 27 and at war" (and ROM, CZS, YUG, SIN, MON, TAN with NOR). | `critic/c28_diploinv_8209r.log`, `critic/c28_diploinv_1777.log`, `critic/c28_diploinv_5521w.log` |
| **BOTH on new seeds: 1777, 8209 × 730 days, AI only** | 0 findings on both. The AI does not reach R27-N2's state. | `critic/c28_both_new_{1777,8209}.json` |
| **New seeds 1777 and 8209 × 30 years (new seeds, not compared)** | 1777: 97 → 72 nations, 1–13 wars a year, 248 sea battles, 3 bursts, 75 revolts, 300 declarations. 8209: 96 → 86, 2–12 wars, 180 sea battles, **19 bursts**, 120 revolts, 337 declarations; Czechoslovakia 9.2 % of the land at year 20, Germany 14.8 % at 30. The Soviet Union first or second on every seed at years 10, 20, 30 (33.6 % on 1777 at the end). Mean tick 3.1–3.3 ms (several runs at once, unpinned), longest 209–227 ms. | `critic/c28_headless_{1777,8209}.json` |
| **PG2: a played game. Italy on new seed 4583, war on Yugoslavia from the Actions tab, 24 months at Max** | The war button and standing work ("Neutral" → war; Germany "Allied · fights beside you", alliance greyed "they are allies."). With every AI box ticked (ADR-759), Italy's own AI then declares on Colombia (June 1938), and its alliance drags it into the Soviet–German war; **Italy's men fall from 958,706 to 21,048**, the Soviet Union takes Rome on 1 May 1939, its land falls from 3.66 M to 2.62 M km²; at war with 32 nations at the end. Peace offered on months 8, 12, 16, 20, 24 (the first war row each time, Italy's own or its alliance's): never accepted, and no refusal line in the Actions tab in the shot taken seconds after (`c28pg2_4583_ITA_m12_panel.png`; the war row stays). No page error in 24 months. | `critic/c28_pg2_4583_ITA.json`, `critic/shots/c28pg2_4583_ITA_00_actions.png`, `critic/shots/c28pg2_4583_ITA_m12_panel.png`, `critic/shots/c28pg2_4583_ITA_end_region.png` |
| **RW: the first-run path, title screen → random world (6143, 80 nations), 3 years at Max** | Title shows "World, 1938", "Random world", "Scenario file"; the random world's form (seed, nations, size, looping, aggression…) and Start; boot **3.1 s**; 80 nations, 78 after 3 years; **59.9–60 fps** each year (longest gap 17–100 ms); the zoom series down to 25 m/px over a fight shows countryballs in the random nations' flags; a click opens the formation panel. No page error. The form's options read "As in the scenario" on a world that has no scenario. | `critic/c28_rw_6143.json`, `critic/shots/c28rw_6143_01_random_detail.png`, `critic/shots/c28rw_6143_y1_world.png`, `critic/shots/c28rw_6143_zoom_00025.png` |
| **AN: an AI nuclear strike met in the page (7019's year-20 save, default "pause on a strike")** | On 8 December 1958 the game pauses itself: "**United Kingdom struck United States with a hydrogen bomb near Suez: 7,000 civilians killed; 79,348 men and 289 guns lost**", Go to / ×; Go to flies to the Gulf of Suez, the scorched area and its ash over a 146.9 k American stack; the ticker carries the same row. One strike in the 400 days run. | `critic/c28_an_7019y20.json`, `critic/shots/c28an_7019y20_0_alert.png`, `critic/shots/c28an_7019y20_0_goto.png`, `critic/shots/c28an_7019y20_0_z00600.png` |
| **PHZ: every zoom tier on a phone (2671, day 40, the China front)** | 30,000 → 25 m/px: no horizontal overflow at any tier; elements drawn from 800 m/px (1,095) down; a tap at the centre opens the formation panel (Chinese Light infantry division 447, "In contact ⚔ To its fight"). At 60 m/px the formation tags stack over each other down the screen; at 800 m/px counters' numbers are clipped by their neighbours. | `critic/c28_phz_2671.json`, `critic/shots/c28phz_2671_00060.png`, `critic/shots/c28phz_2671_tap.png` |
| **PUP: what the player reads of a puppet bond (4583, day 60)** | Manchukuo: "PUPPET OF Japan · Autonomy 21 · Loyalty 52 · Integration 7 %"; Japan: "PUPPETS Manchukuo, Mengjiang". Clear, as AoC's integration bar. | `critic/c28_pup_4583.json`, `critic/shots/c28pup_4583_MAN_panel.png` |

## Dimensions

### Map visuals and readability: 7
- **Tested:** Z, CB, CB2, TG, HV, HS, SX, SXG (identical or timing only), RW's random world, PG2's played map, AN's strike,
  PHZ. **Evidence:** `critic/c28_z_5861.json`, `critic/shots/c28rw_6143_y1_world.png`,
  `critic/shots/c28pg2_4583_ITA_end_region.png`, `critic/shots/c28phz_2671_00060.png`.
- Readable political map with curved names, flags, hatched occupation, a legend; the random world as clean as 1938.
- **What AoC does better:** its pixel map reads at a glance with fewer overlaps (`reference/screens/steam-screenshot-03.jpg`);
  here the phone's 60 m/px tags pile up and counters clip each other at 800 m/px (PHZ); the United States' light blue in
  the Sinai sits close to the sea's colour (`c28an_7019y20_0_z00600.png`). **Fix:** collision-avoid formation tags on
  narrow screens.

### Diplomacy, war, alliance, puppet, revolt depth: 7
- **Tested:** PR, PZ, PP, FW, FW2, EXIT, ES, ES2, COBEL, BX, OR (4 + 2 seeds), OR2, AL (two strides), BS, BOTH (5 seeds),
  GU, PG, DR, the builder's checker (3 new seeds), LOY (3 × 30 years), PG2, PUP.
- **Why 7:** every case of runs 25–27 holds (bonds break into wars, the partner with no bond is refused, menus name the
  bond). Not 8: no AI puppet revolts in 30 years (LOY), guarantees only shrink (BS), the bond's exit costs no truce (BX),
  and a bonded Force war can still put a nation on both sides (OR, the checker).
- **What AoC does better** (text only, lower confidence: `reference/text/AOC_TEXT_NOTES.md` §1.8): its puppets rebel when
  disloyal or when land is demanded, and are released if they win; here that only happens by God's hand.
- **Fix:** non-blocking 1–5.

### Emergent world dynamics over long runs: 7
- 7019 × 20 bit-identical; two new seeds × 30 years: busy (1–13 wars a year, 180–248 sea battles, 75–120 revolts, 3–19
  bursts) and different (Czechoslovakia and Germany rise on 8209; a single peace hands the United States ~7 % of the
  world from the Soviet Union in 7019's year 20). LW and RW watched in the page.
- **What AoC does better:** the Soviet Union is first or second on every seed (1777, 8209, 7019 at 10, 20, 30 years) and
  swallowed Europe in 16 months in the played game (PG2); in AoC no nation is privileged by the map. No score change: the
  same was true in runs 25–27.

### God Mode: 7
- Q (raze, revolt, found city, spawn, all identical to run 26), A (God's A- and H-bomb, identical but a title seed), K,
  K2, K3, PUP's God tab (place, rename, treasury, CE lock, AI switch, nukes, revolts mode, diplomacy). God's Force war
  between bonded partners breaks the war lists on 1777 and 8209 (non-blocking 2).

### Editor and scenarios: 7
- G (place, warheads, export, reload, play) as run 26, ending in the same probe wait; OS / OS2 / old-save as before; RW:
  the random world from the title screen boots in 3.1 s and plays clean for 3 years. **What AoC does better:** its
  scenario editor has more painting and city tools (text, lower confidence). Minor: "As in the scenario" on the random
  world's form.

### Stats and history: 7
- HI and DL identical to run 26 (3,717 rows, CSV and JSON); the land chart of 7019 shows the year-20 swing
  (`critic/shots/c28hi_7019_charts.png`); PUP's panel shows autonomy, loyalty, integration. Non-blocking 4 (five rows for
  one Force war) unchanged.

### UI/UX and polish: 7
- U, P, P2, P3, PH, PT, TD, BT identical; PG2's played game and RW's first-run path new; PHZ on a phone. Clear: the
  Actions tab, the standing line, the AI boxes. Weak: a refused peace offer says nothing in the Actions tab (PG2), a
  greyed button's reason is a title only (no hover on a phone), the phone's overlapping tags.

### Performance: 7
- LW 59.8–60 fps for ten years beside headless runs; RW 59.9–60 fps for three; PF identical to run 26 within noise (60 fps
  at 3000–600 m/px, 37–39 at 120 and 30 m/px over a fight); headless 2.3–4.4 ms a tick. **What AoC does better:** nothing
  measured; the unit-level zooms stay under 60 over a fight.

### Stability: 7
- No page error in any of the page runs (24 months played, 10 + 3 years watched, the strike, the phone tiers); no crash in
  any headless run (3 × 30 years twice, 20 years, 1–2-year probes). Deterministic: 69 probe JSONs identical, 20 of 20
  hashes equal. A God / player command still reaches a forbidden war list (non-blocking 2); the AI does not (BOTH, 5
  seeds × 2 years).

### Semantic zoom to unit level: 8
- **Evidence of superiority:** one continuous zoom from the world to men on the ground: Z identical to run 26
  (`critic/c28_z_5861.json`); C's armour and infantry at 3000 → 10 m/px with tracers and aircraft
  (`critic/shots/c28c_7019_arm_0025m.png`); the same in the random world (`critic/shots/c28rw_6143_zoom_00025.png`) and on
  a phone (`critic/shots/c28phz_2671_00060.png`). AoC's unit visuals are cosmetic markers on a tile map
  (`AOC_TEXT_NOTES.md`: "Unit visuals were added in v4.5.0 and are cosmetic only"). Not 9: tag clutter at the deepest
  zooms on a phone.

### Naval warfare: 8
- SB (ships at 250 / 60 / 25 m/px in both looks; ticks one later than run 26), 180–248 sea battles in 30 years on the new
  seeds, carrier strikes ashore and on ships in every ticker watched. AoC has no navy (text). **Evidence:**
  `critic/shots/c28sb_7019_60m_balls.png`, `critic/c28_headless_{1777,8209}.json`.

### Tanks: 8
- C (armoured division at every zoom), FT / FP2 identical to run 26. **Evidence:** `critic/shots/c28c_7019_arm_0025m.png`.

### Aircraft: 8
- W (wings, sorties, missions from the Actions tab; timing only), PL identical; air battles monthly in every ticker
  ("Germany and Soviet Union fought in the air this month: Germany lost 106 aircraft", PG2). **Evidence:**
  `critic/c28_w_5557.json`, `critic/shots/c28w_5557_x1_250_1.png`, `critic/c28_pg2_4583_ITA.json`.

### AI nuclear use: 8
- **Fresh evidence this run:** the AI's hydrogen bomb met in the page, with the pause, the alert, Go to, and the strike's
  scar (AN); 3 and 19 bursts in 30 years on the new seeds; God's bombs (A) identical. AoC has no nuclear weapons
  (text). **Evidence:** `critic/shots/c28an_7019y20_0_alert.png`, `critic/shots/c28an_7019y20_0_goto.png`.

## Blocking issues, in priority order

None. This is a full run with no blocking issue.

## Non-blocking issues

1. **No AI puppet ever revolts (new measure, LOY).** SPEC § puppets: "Loyalty < 20 with autonomy ≥ 10 means a revolt and
   a war of independence"; "Puppets can be … integrated, or revolt". Over 3 seeds × 30 years, 43,101 puppet-months: the
   lowest loyalty at autonomy ≥ 10 is 30.5; 0 revolts (`critic/c28_loy_*.json`). The relaxation rule (`loyaltyTarget`,
   pull 0.2) cannot take loyalty under 21 at autonomy ≥ 10, so the rule is reachable only by God's slider. Not blocking:
   `docs/PARITY.md` rows 9 and 10 are both "partial", and row 10 names the gap ("Missing: loyalty from donations and
   lost land"); row 9's "revolt by low loyalty → war of independence" is a mechanism the AI never reaches. Fix: something
   in AI play that lowers a puppet's loyalty (tribute paid, land lost, the overlord's defeats counted, a long war), so
   that a puppet of a beaten overlord rises now and then.
2. **R27-N2, a bonded Force war can call a nation in beside its enemy: more often than run 27 counted.** 1777: 3 broken
   in the bonded Force wars tried on days 200 and 350 (`critic/c28_or_new_1777.json`); the builder's ADR-803 checker: 7
   broken pairs on 8209 random diplomacy, day 200, Hungary on Poland (`critic/c28_diploinv_8209r.log`). Command only;
   the AI reaches no such state (BOTH, 5 seeds × 730 days). Fix: as run 27 (in `declareWar`'s `add`, skip a nation at
   war with a member of the side it would join).
3. **R27-N1, the bond's exit is a front reset with no truce** (unchanged, `critic/c28_bx_head_7019_GERatk_ITA.json`).
4. **R27-N3, live "Propose alliance" buttons the sim refuses** (unchanged; counted over every pair this time: 4 of
   10,148 at day 30, 1 of 10,178 at day 120, `critic/c28_al_7019_all.json`). **R27-N4**, five ticker rows for one Force war
   (unchanged). **R27-N5**, guarantees only the start's (unchanged, `critic/c28_bs_head_*.json`).
5. **A refused peace offer is not told in the Actions tab** (new, PG2; medium confidence: one shot seconds after, not a
   frame-by-frame watch): offered on months 8, 12, 16, 20, 24 of Italy's wars; the war row stays and no line says why in
   `critic/shots/c28pg2_4583_ITA_m12_panel.png` (the SPEC's "told in words" is for the nation menu). Fix: the menu's
   refusal line in the Actions tab too.
6. **Phone clutter at deep zoom** (new, PHZ): at 60 m/px the formation tags of a front stack down the screen; at
   800 m/px counters' numbers are cut by their neighbours.
7. **Unchanged from runs 25–26** (identical probes): Japan's armies at peace in China after random diplomacy's white
   peace; Breakthrough's refusal only in God's tab; own counters in mixed stacks; level-3 plasters read as ✕; the
   player's war behind "+1" on the phone; land "To its fight" off its formation; hero markers at T1; a greyed button's
   reason a title only.

## Design objections (none blocking, no score lowered)

- **The puppet numbers make the SPEC's revolt unreachable** (non-blocking 1 is the execution; the cause is the SPEC's own
  constants: base 40, 0.6 per autonomy, −25 when losing, revolt under 20 from autonomy 10).
- **The played nation's AI declares its own wars** (ADR-759, the user's decision): Italy, played, declared on Colombia
  by itself and was ground down in a war it did not choose (PG2). Readable with the Diplomacy box, but a new player will
  not know to untick it.
- **A junior member's peace ends the whole war** (run 26's), and run 25's objections stand.

## Notes

- No 529x port was listening at the start. This run used only 5299 (`critic/c28_dist`) and stopped it at the end. No
  worktree was made.
- The first LOY run read the event stride wrong (kind at offset 0; it is offset 1) and was stopped; every LOY figure
  above is from the corrected `critic/scripts/c28_loy.ts`.
- AL's first HEAD run used stride 4 (`c28_al_7019.json`); the re-run at run 27's stride 7 (`c28_al_7019_s7.json`) is the
  one compared with run 27, and `c28_al_7019_all.json` tries every pair.
- Fps-measuring probes ran beside headless sims (LW, RW, PF); all read the same as runs 26–27, so no re-run alone was
  needed.

## Strengths, verified

- **Determinism you can bisect against:** a byte-identical build reproduced 69 probe JSONs and 20 of 20 yearly hashes of
  a 20-year world, and the ten-year page watch is the same world.
- **The nuclear moment is well told:** the AI's H-bomb pauses the game, names who, where and the toll in one line, and
  Go to lands on the scar (`critic/shots/c28an_7019y20_0_goto.png`).
