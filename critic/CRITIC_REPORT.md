# Critic report, run 29 (full) — the R5a heroes run

**This is ROADMAP R5a: the critic run on the heroes feature** (PLAN 7.184, the new-game option `heroes`), asked for by
the user on 2026-11-03 after R1–R4 of batch 1. Heroes get their own section (below "Verdict"); every dimension is also
scored, as a full run requires.

- **Mode: full.** Decided from git before anything else (CRITIC_PROMPT, ADR-804): the last report (run 28, full, on
  `73c531b6`) has **no blocking issue and no score under its bar**, so the first condition for a focused run fails,
  whatever the commits since are. (They are R0a–R0i, R1a/R1b, R2, R3, R4a–R4e: `src/sim/systems/puppets.ts`,
  `war.ts`, the relations panel, the checkers.) Every dimension is scored afresh; nothing is carried.
- **Commit:** `823cbf1b668cdd349b958702af7bc50b1b1bf378` (HEAD at the start, `critic/c29_commit.txt`). **Date:** 2026-11-03.
- **Build:** `vite build --outDir critic/c29_dist`, exit 0 (`critic/c29_build.log`), served by `vite preview` on
  127.0.0.1:**5299**. Chromium through Playwright, headless, 1600 × 900 (390 × 844 touch for phones).
- **Baseline:** run 28's own files (`critic/c28_*`, commit `73c531b6`) are the "before" of every re-run case; no
  worktree was needed. The sim changed since (ADR-807 puppets, ADR-808 `declareWar`, ADR-810 no puppet of a puppet), so
  every probe that runs a 1938 world for weeks differs from run 28 by construction; each difference below is attributed.
- **Runs:** run 28's headless queue and page suites re-run on HEAD (`critic/scripts/c29_jobs1.txt` through
  `c29_run_jobs.sh`, 8 at a time; `c29_pagesuites.sh`; `c29_tail2.sh`). New for heroes: `c29_ho.ts` (on vs off, 10 seeds
  × 20 years each arm), `c29_hl_herolost.ts`, `c29_hw2_herowait.ts`, `c29_hd_heroloss.mjs`, `c29_hw_herowound.mjs`,
  `c29_ht_herotitle.mjs`, `c29_hn_heroannex.mjs`, `c29_hc_herocounters.mjs`, `c29_hcc_heroclick.mjs`,
  `c29_hsl_saveload.mjs`, `c29_hsc_heroscen.ts`; for R1 `c29_rg_relations.mjs`; the builder's checkers on new seeds
  with `--heroes`. The comparison of every re-run JSON with run 28's: `critic/c29_cmp.txt`.

## Verdict

**Three blocking issues, all in the heroes feature. `mapVisuals` and `uiUxPolish` fall under their bar (6).** The
batch's other work holds up on my own counts: AI puppets now rise (R2), the bonded Force war calls no one in beside its
enemy (R3: run 28's broken cases on 1777 and 8209 are gone), the new checkers report 0 broken on new seeds with heroes
on, and every rule-level probe of runs 25–28 is identical or differs only where the sim was changed on purpose.

The heroes are a good idea carried out in a way a player cannot read:

1. **At the opening view the map puts six of the fourteen heroes on the wrong continent** — Roma in French Equatorial
   Africa, P.100 Ercole 5,000 km from Rome, the TOG II in Morocco — and a click on those counters opens the nation
   under them, not the hero.
2. **A hero changes sides with its nation's land and drops out of every list.** Annexed or integrated, Italy's Roma and
   P.100 fight for Britain, Germany's Maus for the United States (2 of 10 seeds in AI play), listed in no Overview; a
   destroyed one never returns.
3. **"They come back 60 days after they are lost" (the option's own hint) is false for the sea heroes in every seed:**
   Richelieu, Roma, Bismarck, Sovetsky Soyuz and Yamato wait 2–12 years while their nations live, because a sea hero
   returns only at a naval base its nation holds (the Soviet Union of seed 4253 holds 149,484 cells and 12 ports, none a
   naval base).

And the feature is silent: a hero's loss and return appear in no ticker row and no History row; the formation panel of
a hero at 35 % health reads "Men 2,200 of 2,200"; the map tag of the Maus reads "6".

## Heroes (R5a)

### What it is, as built
`heroes` is a 1938-only new-game option (`opt-heroes`, off by default; `?heroes=on`). Fourteen formations of one
element each (`data/units/heroes.json`), raised at start (`addHeroes1938`): a sea hero at its nation's first naval base,
a land hero at the capital. Never built, queued or placed (`tick.ts` refuses `spawnFormation`/`spawnFleet`/`queue`
with a hero template; God's placing list and the editor's fleet list omit them, `PlaceSection.tsx:40`,
`EditorPanel.tsx:197`, `critic/c29_ht_desk.json` editor templates). Never disbanded, laid up or folded. Heals 5 % a day
out of battle; destroyed, returns whole 60 days later at its start place or the nearest held naval base / capital
(`heroes.ts`). AI: a sea hero sails with its nation's largest fleet at war (ADR-793), a land hero joins its army's
nearest fight (ADR-794/795); the rest of the land-hero AI was closed "not done" by the user (ADR-796).

### How a player meets it (page)
| Case | What happened | Evidence |
|---|---|---|
| Title screen | "Heroes Off / On" in the 1938 form between "Alliances and wars" and "Starting gold". Its explanation (the 14 names, "They heal, and come back 60 days after they are lost") is a `title` attribute only: hover on a desk, nothing on a phone. Not offered for the random world or a scenario file (by design: 1938 roster). Start with it on: URL `heroes=on`, 14 heroes, boot 3.6 s. | `critic/c29_ht_desk.json`, `critic/shots/c29ht_desk_01_form1938.png`, `critic/c29_ht_phone.json` |
| Settings in game | Heroes row present, reads "On". | `critic/shots/c29ht_desk_06_settings.png` |
| `?scenario=random&heroes=on` | 0 heroes; no row in the form or settings. Consistent. | `critic/c29_ht_desk.json` (`randomHeroes: 0`) |
| **World zoom (start view, 19.6 km/px)** | Heroes drawn as large named counters, flag-ball and name — easy to spot. **But a hero whose counter would cover another's steps down below it, as often as it takes** (`counters.ts:491–504`): in Europe ten heroes within a few hundred px cascade south. Measured drawn box against the hero's place: **HMS Hood 2,485 km off, TOG II 2,524, Richelieu 3,131, Char 2C 3,757, Roma 3,777, P.100 Ercole 5,009 km**; O-I, T-42 and Maus ~630 km. Same on the phone. **A click on a displaced counter opens the nation underneath** (Roma → French Equatorial Africa, TOG II → France, Maus → Austria, Richelieu and Char 2C → French West Africa). At 6000 m/px only the Maus is off (33 px); at 3000 m/px all are in place. | `critic/c29_hc_5521_desk.json`, `critic/c29_hc_5521_phone.json`, `critic/c29_hcc_5521.json`, `critic/shots/c29ht_desk_05_start.png`, `critic/shots/c29ht_phone_05_start.png`, `critic/shots/c29hv_3739_1475_3000m.png` |
| T1 (1200 m/px) | Yamato's counter in Tokyo Bay is twice the size of the fleets' and reads "2.5k" (its men); the Maus in Berlin reads **"6"** beside 12.5k divisions. Five clicks on the Bismarck's marker in Kiel open the Bismarck each time, never the three battle squadrons stacked with it (unchanged from runs 26–28, `c29_hs_3739.json` identical). | `critic/shots/c29hv_3739_1468_1200m.png`, `critic/shots/c29ht_desk_09_click_maus_1200.png`, `critic/c29_hs_3739.json` |
| T2/T3 (250–25 m/px) | The Maus as a countryball tank about twice an infantry ball, its tag "6 Maus"; Bismarck "2.2k Bismarck" beside a "13.4k Battle squadron" — the strongest ship on the sea reads as a sixth of a squadron. Readable as special at 25 m/px. | `critic/shots/c29hv_3739_1475_25m.png`, `critic/shots/c29hd_4111_bis_before.png`, `critic/shots/c29ht_desk_09_click_maus_150.png` |
| Overview's Heroes block | First block of Germany's Overview: names, health bars ("Bismarck 35 %"), "returns in 60 days" when gone, "waits to return"; a click selects and follows (HV: camera within 0 px after 1–3 days, a pan ends the follow). Good. | `critic/c29_hv_3739.json`, `critic/shots/c29hd_4111_bis_lost.png`, `critic/shots/c29hv_3739_gone_row.png` |
| **Formation panel of a hero** | Bismarck at 35 % health (Overview): its panel reads **"Men 2,200 of 2,200 · Supply 100 % · Org 100 % · 1 of 1"** — nothing says it is hurt (health is the element's `wound`, men stay whole: ADR-787; the panel shows men only). The starving TOG II at 11 %: "Men 8 of 8 · Supply 0 % · Org 0 % · On the march". | `critic/c29_hw_4111_bis.json`, `critic/shots/c29hw_4111_bis_panel.png`, `critic/c29_hw_4111_tog.json`, `critic/shots/c29hw_4111_tog_250m.png` |
| **A hero lost and back (Bismarck, seed 4111)** | Sunk on tick 2,485 (14 April 1938) by the Royal Navy, to the hour the headless run says (the page is the same world). **Ticker:** nothing about it (rows "Sea battle: United Kingdom against Germany", "Carrier strike: United Kingdom on Germany's ships"). **History:** 184 rows, none names Bismarck; the day's row reads "United Kingdom and Germany fought at sea: United Kingdom lost 0 ships, Germany 1". The Overview row: "returns in 60 days". Back on tick 3,925 at Kiel, whole: again no row anywhere. History has no hero kind in its filter. | `critic/c29_hd_4111_bis.json`, `critic/shots/c29hd_4111_bis_lost.png`, `critic/shots/c29hd_4111_bis_history.png`, `critic/shots/c29hd_4111_bis_returned.png` |
| Save and load with a hero gone | Saved at tick 2,500 (Bismarck "returns in 60 days"), run 1,500 h, loaded, run again: the same hash (2299536962) and heroes both times; the block reads the same after loading. | `critic/c29_hsl_4111.json` |
| Scenario file | A scenario exported from a heroes game carries the roster (state) into a game started with heroes off: 11 alive, 3 returning, and they return (headless). | `critic/c29_hsc_4111.log` |
| **God's Annex (France into Germany, day 2)** | Richelieu and Char 2C become German formations (panel "Nation Germany"), sail and fight with Germany (day 60: Richelieu beside Bismarck). Germany's Heroes block still lists two; France's heroes are listed nowhere. God removes the Char 2C: it never returns (its roster nation, France, is dead), and nothing says so. | `critic/c29_hn_4111.json`, `critic/shots/c29hn_4111_ger_block.png`, `critic/shots/c29hn_4111_ger_block_d122.png` |
| Relations graph | Shows no hero (none expected). | `critic/shots/c29rg_4111_desk_d365.png` |

### What it does to the world (headless, 10 new seeds × 20 years, heroes on vs off on the same seed, HEAD)
Seeds 4111, 4253, 4637, 5023, 5449, 5867, 6299, 6733, 7177, 7603; paired difference on − off, mean ± se over the 10
seeds (`critic/c29_ho_sum.txt`, `critic/c29_ho_sum.json`, `critic/c29_ho_{on,off}_<seed>.json`). New seeds, not
compared with run 28 (run 28 measured no heroes-off pair).

| Over 20 years | Off | On | On − off |
|---|---|---|---|
| Sea battles | 180.8 | 338.1 | **+157 ± 15 (+87 %, every seed)** |
| Ships sunk | 1,954 | 2,676 | **+722 ± 105 (+37 %)** |
| Major land battles | 171.7 | 142.5 | **−29 ± 12 (−17 %)** |
| Wars declared / peaces | 227 / 218 | 248 / 239 | +21 ± 9 each (borderline, 2.3 se) |
| Capitals taken, eliminations, revolts, puppets, bursts | — | — | within noise (≤ 1.2 se) |
| Living nations at year 20 | 75.6 | 79.4 | +3.8 ± 3.2 |
| Land of the seven hero nations at year 10 / 20 | 50.2 % / 50.0 % | 55.5 % / 53.4 % | +5.3 ± 3.2 / +3.4 ± 2.6 |

So the heroes make a busier sea and a slightly quieter land war; they do not tip the world to the great powers beyond
noise. The Soviet Union is still first or second.

| Hero (10 seeds × 20 years) | Alive | In battle, of its war days | Lost per 20 years | Lost out of battle (no fight in its last 24 h) | Days waiting past its hour, nation alive | Served another nation |
|---|---|---|---|---|---|---|
| Yamato / O-I | 78 % / 89 % | 1.1 % / 5.0 % | 25.2 / 13.9 | 3 of 252 / **84 of 139** | 831 / 0 | — |
| USS Iowa / T28 | 97 % / 97 % | 0.5 % / 3.9 % | 3.9 / 3.9 | 0 of 39 / 25 of 39 | 0 / 0 | — |
| Sovetsky Soyuz / T-42 | 68 % / 90 % | 1.5 % / 6.4 % | **30.0** / 12.0 | 1 of 300 / 60 of 120 | **5,551** / 0 | — |
| Bismarck / Maus | 70 % / 88 % | 1.3 % / 7.0 % | 23.9 / 12.1 | 3 of 239 / 54 of 121 | **4,888** / 0 | Maus: USA 1,033 days (7603) |
| HMS Hood / TOG II | 73 % / 90 % | 1.6 % / 3.0 % | **31.4** / 12.1 | 2 of 314 / 63 of 121 | 809 / 0 | — |
| Richelieu / Char 2C | **57 %** / 87 % | 1.7 % / 4.5 % | 26.0 / 16.3 | 1 of 260 / 84 of 163 | **16,123** / 0 | — |
| Roma / P.100 | **58 %** / 83 % | 1.6 % / 5.2 % | 24.9 / 12.1 | 0 of 249 / 67 of 121 | **11,218** / 0 | Both: UK 822 / 333 days (4637) |

- **A sea hero is sunk about every eight months** (24–31 times in 20 years; Iowa 3.9, the United States fights little
  at sea) and is in battle on ~1–2 % of its nation's war days: nearly every time it meets the enemy in force, it goes
  down. All 38 sea-hero losses of `c29_hl_4111.json` and `c29_hl_6863r.json` came in a sea-battle or air-strike hour;
  bombs fell on the hero itself in its last hour in 7 of the 38 — the mechanism (fire picked by hit points, ADR-605/606,
  drawing the enemy's guns to the biggest ship) is my guess, **low confidence, not shown**. The AI's sail-with-the-fleet
  rule is the user's decision (ADR-793); the record is the execution: a unit the option calls "far stronger than any
  other" is lost more often than a battle squadron is.
- **Land heroes die of hunger about half the time** (437 of 824 losses with no fight in the 24 h before; HL: all such
  losses on 4111 and 6863 at supply 0, org 0). The TOG II marches into Nationalist Spain and starves there **three times
  in a year** (days 87, 272, 439 on seed 4111), each time coming back to London and doing it again; the US T28 stood
  its whole life since raising (326 days) in Greece without a fight and wasted away; Japan's O-I 121 days in Soviet
  land. The 5 % daily heal meant for
  a hero out of battle is outrun by attrition to death. The land hero's movement is the user's decision (ADR-796); its
  dying of hunger on repeat, unseen, is execution. (`critic/c29_hl_4111.json`, `critic/c29_hl_6863r.json`.)
- **Sea heroes wait years to return in every seed**: Richelieu 16,123 days over 10 seeds (4.4 years a seed, 22 % of the
  run), Roma 11,218, Sovetsky Soyuz 5,551, Bismarck 4,888, Yamato 831, Hood 809, while their nations live. HWAIT: on
  4253 at the hero's hour the Soviet Union holds 149,484 cells and 12 ports but **0 naval bases** (its four of the 1938
  data, Kronstadt, Sevastopol, Vladivostok, Murmansk, are lost); on 4111 Germany holds one port and neither of its two
  bases. The data gives France 4 naval bases, Germany 2, the Soviet Union 4, Italy 7; a sea hero returns only at one of
  its own nation's held bases (`returnPlace`). The Overview says "waits to return" with no reason, for years.
  (`critic/c29_hwait_4253_SOV.json`, `critic/c29_hwait_4111_GER.json`, `data/scenarios/1938/ports.json`.)
- **Heroes change sides in AI play**: on 4637 Britain annexes Italy and fields Roma and P.100 for 822 / 333 days; on
  7603 the United States fields the Maus 1,033 days. The roster row keeps the dead nation, so the stats list them under
  no living nation (`server.ts:848–865`), the overlord's Overview omits them, and once destroyed they never return
  (their nation is dead). Paths: `puppets.ts:170` (integration) and `annexNation`'s transfer (`puppets.ts:148`).

### Whether its rules agree with the others (checkers)
| Checker, new seeds, heroes on | Result | Evidence |
|---|---|---|
| `diploInvariants.ts 8209 random 400 60,200,350 20 --heroes` (run 28: 7 broken) | **0 broken** | `critic/c29_diploinv_8209r.log` |
| `diploInvariants.ts 4421 random …--heroes`, `6863 scenario …--heroes`, `9907 random …--heroes`; `1777 scenario` | 0 / 0 / 0 / 0 broken | `critic/c29_diploinv_4421r_h.log`, `c29_diploinv_6863s_h.log`, `c29_diploinv_9907r_h.log`, `c29_diploinv_1777.log` |
| `worldInvariants.ts 4421 730 --heroes`, `6863 730 --heroes --diplomacy random`, `9907 730 --heroes`, `3331 3650 --heroes` | 0 broken each (economy, navy, air, nukes, bonds) | `critic/c29_wi_*.log` |

The checkers have **no rule for the heroes themselves** (one alive per row, serving its roster's nation, back within
its hour when it has a place), so the side-changing hero (B2) and the years-long wait (B3) pass them green.

### Heroes: blocking
- **B1. The world view draws six heroes 2,500–5,000 km from where they are, and a click on a displaced counter opens the nation it was pushed onto.**
- **B2. A hero changes nation with its land (annexation, integration) and disappears from every list; destroyed, it
  never returns.**
- **B3. Sea heroes "wait to return" for years while their nations live (10 of 10 seeds), against the option's promise
  of 60 days.**

### Heroes: non-blocking
- H-N1. Loss and return are silent: no ticker row, no History row, no History kind; the sea-battle row counts the
  Bismarck as "1 ship".
- H-N2. The formation panel shows men, not health: a hero at 35 % reads whole.
- H-N3. Map tags read men: "6" for the Maus, "2.2k" for Bismarck next to "13.4k" squadrons.
- H-N4. Land heroes starve in about half their losses, on repeat, out of sight (TOG II in Spain thrice).
- H-N5. Sea heroes are lost every ~8 months; "far stronger than any other" does not read in play.
- H-N6. The option's explanation is a hover title only (nothing on a phone); in a stack at T1 the hero hides the fleets.
- H-N7. No checker rule covers the heroes.

## Scores

| Dimension | Run 28 | Run 29 | |
|---|---|---|---|
| Map visuals and readability | 7 | **6** | down: B1 (the start view misplaces six heroes; clicks open the wrong nation), H-N3 |
| Diplomacy, war, alliance, puppet, revolt depth | 7 | 7 | R2, R3 fixed on my counts; B2 new; BX, BS, AL unchanged |
| Emergent world dynamics over long runs | 7 | 7 | rescored |
| God Mode | 7 | 7 | rescored (God's Annex shows B2) |
| Editor and scenarios | 7 | 7 | rescored |
| Stats and history | 7 | 7 | rescored (H-N1) |
| UI/UX and polish | 7 | **6** | down: H-N2, the relations graph's "X is at war beside X", the unreadable graph on a phone, the hint on hover only, the bar wrapping at 1024 px |
| Performance | 7 | 7 | rescored |
| Stability | 7 | 7 | rescored |
| Semantic zoom to unit level (needs 8) | 8 | 8 | rescored; the hero's T2/T3 drawing is good |
| Naval warfare (needs 8) | 8 | 8 | rescored; B3, H-N5 recorded |
| Tanks (needs 8) | 8 | 8 | rescored; H-N4 recorded |
| Aircraft (needs 8) | 8 | 8 | rescored |
| AI nuclear use (needs 8) | 8 | 8 | rescored |

## Run 28's cases re-run

| Run 28 case | On HEAD (`823cbf1b`) | Evidence |
|---|---|---|
| R28-N1, LOY: no AI puppet revolts (7019, 3163, 1777 × 30 years) | **Fixed (ADR-807).** `PuppetRevolt` 2 / 0 / 5 (run 28: 0 / 0 / 0) for 72 / 61 / 107 puppets made; lowest loyalty at autonomy ≥ 10: 18.4 / 30.2 / 18.1 (run 28: 30.5 / 31.2 / 31.6). The R2 AT (risings in ≥ 2 of 3 seeds, ≤ 1 in 10 of puppets made) passes on my count. On 3163 I count 0 risings, the builder 2 (`tools/diag/puppetLoyalty.ts`); I count `PuppetRevolt` events. | `critic/c29_loy_{7019,3163,1777}.json` |
| R28-N2, OR / OR2 / the checker: a bonded Force war calls a nation in beside its enemy | **Fixed (ADR-808).** OR on 7019, 2207, 5113, 9241 (days 30/120/300) and 1777, 8209 (60/200/350): **0 broken of 2,372 tried** (run 28: 1 on 7019, 3 on 1777). OR2, Mongolia on Romania (7019 day 300): no break (run 28: until day 60). The checker on 8209, random diplomacy, heroes: 0 broken (run 28: 7). | `critic/c29_or_*.json`, `critic/c29_or2_head_7019_MON_ROM.json`, `critic/c29_diploinv_8209r.log` |
| R28-N3, BX: a bond's exit resets the front, no truce | **Unchanged** (JSON identical to run 28). | `critic/c29_bx_head_7019_GERatk_ITA.json` |
| R28-N4: live "Propose alliance" the sim refuses (AL, every pair, days 30 and 120) | **Unchanged** (identical to run 28): every pair, 4 of 10,148 live buttons refused at day 30 (Poland, Switzerland, Belgium, Luxembourg > Spanish Republic), 1 of 10,178 at day 120 (Portugal > Brazil); none greyed but acceptable. | `critic/c29_al_7019_all.json` |
| R28-N4: guarantees only the start's (BS, 4 seeds × 365 days) | **Unchanged**: no guarantee given in a year, the start's lapse; the hashes differ (the sim changed). | `critic/c29_bs_head_*.json` |
| R28-N4: five ticker rows for one Force war (PP) | Unchanged (PP identical). | `critic/c29_pp_head_7019_MAN.json` |
| R28-N5, PG2: refused peace untold in the Actions tab (Italy, 4583, 24 months) | The same game to its end (Italy 2.62 M km², at war with 32 nations), no page error; the Actions tab unchanged. | `critic/c29_pg2_4583_ITA.json` |
| R28-N6, PHZ: phone clutter at 60 and 800 m/px | Identical. | `critic/c29_phz_2671.json` |
| PR, PZ, PP, FW, FW2, EXIT ×3, ES, ES2 ×3, COBEL, BOTH ×5, GU, PG ×2, TD, K, K2, K3, DR, BT ×2, CB, CB2, HU, HS, SX, SXT, EX2, FT, FP2, PL, P2, PH | **Identical** to run 28 (52 JSONs in all, with AL, OS2 of run 10, PHZ and PUP). BOTH: 0 findings on 5113, 6151, 9241, 1777, 8209 × 730 days. | `critic/c29_cmp.txt` |
| World dynamics, 7019 × 20, 1777 × 30, 8209 × 30 headless | Differ (the sim changed): 7019 144 war-years (run 28: 176), 182 sea battles (197), 4 bursts (9), 72 revolts (82), 1 puppet rising (0), 96 → 78 living; 1777 186 war-years (129), 15 bursts (3), 5 risings (0); 8209 232 war-years (194), 35 bursts (19), 118 revolts (120), 5 risings (0), 97 → 75 living. Mean tick 2.9–3.8 ms (eight sims at once, unpinned), longest 198–255 ms. | `critic/c29_headless_{7019,1777,8209}.json` |
| HI, DL (7019's year-20 save) | Work as before on HEAD's world: 3,494 rows (run 28: 3,717, another world), CSV and JSON. | `critic/c29_hi_7019.json`, `critic/c29_dl_7019.json` |
| AN: an AI strike met in the page (7019's year 20, 400 days) | **Not re-met**: HEAD's 7019 world has no strike in those 400 days (its 4 bursts come earlier). AI bursts headless: 4 / 15 / 33 (7019 / 1777 / 8209) and 6.5 per 20 years on the ten heroes seeds. | `critic/c29_an_7019y20.json`, `critic/c29_ho_sum.txt` |
| RW: title screen → random world (6143, 80 nations), 3 years | As before: boot 2.4 s, 60 / 60 / 59.9 fps, longest gap 83 ms, no page error. | `critic/c29_rw_6143.json` |
| LW: ten years in the page (6151) | Heroes off: **59.9–60 fps every year, longest frame gap 83 ms, none over 500 ms, no page error** (run 28: 59.8–60, 83 ms); another world (the sim changed): 70 nations at year 10 as run 28. Heroes on, same seed: 59.8–60 fps, 83 ms, no error. And 4111 off / on: 59.9 / 59.8 fps lowest, 83 ms, no error. | `critic/c29_lwdef_6151.json` |
| PF: frame rates over a fight (7019's year 20) | **Not measured**: HEAD's 7019 year-20 world has no formation engaged at the saved hour, so the probe finds no fight to frame (`fatal` in the JSON). Not compared. | `critic/c29_pf_7019.json` |
| OS (run 10's old save, `c10_seed4877_y20.bin`) | **Not re-runnable**: the file was deleted with the untracked probe output (ROADMAP R0a). OS2 (run 10's and 25's scenario files) and OS load as before. | `critic/c29_os_c10fmt1.json`, `critic/c29_os2_c10.json`, `critic/c29_os2_c25.json` |
| Timing-only differences | C (one sortie fewer in three views), FO (1 px of camera), SB (ticks one later), W (a sample one tick off), Z (element counts ±1.5 % at speed), PT (0.01 cell), TG (one tag), WW, Q (the sim's ticker). | `critic/c29_cmp.txt` |
| UI change from R1 | The bottom bar gained "Relations": at 1024 × 768 it now wraps to two rows (998 px wide, 56 px high; run 28: 956 / 27); 1180 px and wider stay one row. | `critic/c29_p3_widths.json` |

## New in this run (besides heroes): the relations graph (R1)

| Case | What happened | Evidence |
|---|---|---|
| RG, 4111 with heroes, days 0 and 365, desk | Opens in 0.2 s. Day 0: 67 nodes; 7 war, 11 alliance, 8 guarantee, 40 puppet edges — equal to my own count from the statistics message (wars' sides 7, puppets 40, guarantees 8). Day 365: 86 nodes; 107 war, 22 alliance, 8 guarantee, 44 puppet, 17 truce edges (my count of truce pairs: 18; likely one with a nation not drawn — not verified, not filed). Toggling a kind removes its edges and **moves no node**; focus on Germany: 24 nodes, 35 edges. | `critic/c29_rg_4111_desk.json`, `critic/shots/c29rg_4111_desk_d0.png`, `critic/shots/c29rg_4111_desk_d365.png`, `critic/shots/c29rg_4111_desk_d365_focus.png` |
| A war line's text | **"Japan is at war beside Japan, against China"**, **"Nationalist Spain is at war beside Nationalist Spain, against Spanish Republic"**: a nation alone on its side fights beside itself. Alliance, guarantee, puppet and truce lines read right ("Germany and Austria are at truce, 401 days left"). | `critic/c29_rg_4111_desk.json` (`clicks`) |
| Readability | At a year on a desk: a hairball around the United Kingdom and the Soviet Union, overlapping labels ("United States" over "Czechoslovakia"). On a phone (390 px) the graph is a 360 × 230 px box with labels about 5 px tall, unreadable, with no zoom or pan. | `critic/shots/c29rg_4111_desk_d365.png`, `critic/shots/c29rg_4111_phone_d365.png` |

## Dimensions

### Map visuals and readability: 6 (was 7)
- **Tested:** HT, HC, HCC, HV, HS, HD, HW (heroes at every tier, desk and phone), Z, CB, CB2, TG, PHZ, RW, PG2.
- **Why down:** the opening view of a heroes game puts Roma, P.100, Char 2C, Richelieu, TOG II and HMS Hood
  2,500–5,000 km from their units, and a click on a displaced counter opens the country it was pushed onto (B1,
  `critic/c29_hc_5521_desk.json`, `critic/c29_hcc_5521.json`, `critic/shots/c29ht_desk_05_start.png`). Tags read men:
  the strongest tank on the map is "6" (`critic/shots/c29ht_desk_09_click_maus_1200.png`). Outside heroes the map is
  run 28's (Z, CB, CB2, PHZ identical or timing only).
- **Fix:** B1; a hero's tag shows its health (or its name only), not its men.

### Diplomacy, war, alliance, puppet, revolt depth: 7
- **Tested:** LOY ×3, OR ×6 seeds, OR2, PR, PZ, PP, FW, FW2, EXIT ×3, ES, ES2 ×3, COBEL, BX ×3, BS ×4, BOTH ×5, GU, PG,
  DR, AL, the checkers on five new seeds with heroes, HN, the relations graph.
- **Better than run 28:** AI puppets rise (2 / 0 / 5), no bonded Force war breaks the war lists (0 of 2,372). **Not 8:**
  B2 (a hero fights for whoever takes its nation, unlisted), guarantees still only the start's, the bond's exit still
  costs no truce (BX identical), the relations graph's war text.

### Emergent world dynamics over long runs: 7
- Heroes on vs off, 10 seeds × 20 years: sea battles +87 %, ships sunk +37 %, major land battles −17 %, the rest within
  noise; the seven powers +3–5 points of land, not significant. The three long headless runs are busy (144–216
  war-years, 4–33 bursts, 1–5 puppet risings). The Soviet Union or the United States leads everywhere, as in run 28.

### God Mode: 7
- Q, K, K2, K3, A identical or ticker-only. God's Annex of France hands Germany two more heroes that no list shows, and
  God's removal of one is permanent once its nation is dead (`critic/c29_hn_4111.json`, B2). Heroes are absent from
  the placing list, as designed.

### Editor and scenarios: 7
- G as run 28 (place, warheads, export, reload); OS2 and OS as before; heroes travel inside a scenario file and return
  in a game started without the option (`critic/c29_hsc_4111.log`). Run 10's old save could not be re-run (deleted).

### Stats and history: 7
- HI, DL work on HEAD's world; PUP identical. Heroes are absent from History, the ticker and the charts: a hero sunk
  thirty times in a game leaves no row (H-N1, `critic/c29_hd_4111_bis.json`). Held at 7: the Overview does tell
  "returns in N days".

### UI/UX and polish: 6 (was 7)
- **Why down:** both of the batch's features read wrong in their panels: a hero's formation panel says it is whole at
  35 % (`critic/shots/c29hw_4111_bis_panel.png`); the relations graph says "Japan is at war beside Japan" and is
  unreadable on a phone (`critic/shots/c29rg_4111_phone_d365.png`); the heroes option explains itself on hover only;
  the bottom bar wraps at 1024 px since Relations. Unchanged from run 28: a refused peace untold in the Actions tab.
- **Fix:** H-N2; the war line's text (the side's other members, or "alone"); a zoomable graph or a list on a phone; the
  option's hint as visible text.

### Performance: 7
- Four ten-year page watches (6151 and 4111, heroes off and on): 59.8–60 fps every year, longest frame gap 83 ms, none over 500 ms; heroes on cost nothing measurable. PF not measured this run (no fight in HEAD's 7019 year-20 save). RW 60 fps for three years. Headless 2.9–3.8 ms a tick with eight sims at once.

### Stability: 7
- No page error in any page probe (the 24-month played game, the ten-year watches, the heroes probes on desk and
  phone). No crash in 65 headless jobs. Deterministic: 52 probe JSONs identical to run 28; the page's Bismarck sinks on
  the hour the headless run says; a save loaded in the page reproduces the hash.

### Semantic zoom to unit level: 8
- Z, C, PHZ as run 28; the heroes at T2/T3 are drawn twice their kind and read as special at 25 m/px
  (`critic/shots/c29hv_3739_1475_25m.png`). The T0 misplacement is counted under map visuals (B1). Not 9: T1 tags, the
  phone's deep-zoom clutter.

### Naval warfare: 8
- SB and G's sea battles as run 28; heroes on nearly double the sea battles (338 vs 181 in 20 years, every seed). Held,
  not lowered: the sea rules outside the heroes are run 28's, the heroes' sea AI is the user's decision (ADR-793), and
  their broken return (B3) and silent losses (H-N1) are filed where they read.

### Tanks: 8
- C, FT, FP2 identical to run 28. Land heroes starve on repeat (H-N4): recorded, not scored down — their movement is the
  user's decision (ADR-796), and their drawing at T2/T3 is good.

### Aircraft: 8
- W (timing only), PL identical; monthly air wars in every ticker read. Evidence: `critic/c29_w_5557.json`,
  `critic/c29_pl_6011.json`.

### AI nuclear use: 8
- AI bursts in every long headless run (4 / 15 / 33 on 7019 / 1777 / 8209; 6.5 per 20 years on the heroes seeds); the
  nukes checker 0 broken on four seeds. The page's strike alert was not re-met on HEAD's 7019 world (no strike in the
  400 days probed); that evidence is run 28's (`critic/shots/c28an_7019y20_0_alert.png`).

## Blocking issues, in priority order

Ids as in `CRITIC_REPORT.json`: B1–B3 are R29-B1–R29-B3; H-N1–H-N7 are R29-N1–R29-N7, R1-N1 is R29-N8, the unchanged list is R29-N9.

1. **B1. At the world's zoom six heroes are drawn 2,500–5,000 km from where they are, and a click on a displaced counter opens the
   nation it was pushed onto.** (A click on a well-placed hero counter at this zoom was not tested.) `counters.ts:491–504` steps a hero's counter below any hero counter it would cover, "as many
   times as it takes": at the start view (19.6 km/px) Europe's ten heroes cascade into Africa (Roma over French
   Equatorial Africa, P.100 Ercole 5,009 km off, TOG II over Morocco). This is the view a heroes game opens on. Evidence:
   `critic/c29_hc_5521_desk.json`, `critic/c29_hc_5521_phone.json`, `critic/c29_hcc_5521.json`,
   `critic/shots/c29ht_desk_05_start.png`, `critic/shots/c29ht_phone_05_start.png`; ten years on, Bismarck still drawn over the Sahara (`critic/shots/c29lwhon_6151_y10_world.png`). **Fix:** fold heroes that would
   overlap into one counter ("Bismarck +3", opening a list), or keep each at its place and drop the name at the world
   zoom; never move a counter more than its own height from its place; a click on a hero counter opens the hero.
2. **B2. A hero changes nation with its land and vanishes from every list; destroyed, it never returns.** Integration
   (`puppets.ts:170`) and annexation (`annexNation`, `puppets.ts:148`) move every formation of the dead nation, heroes
   included, while `world.heroes` keeps the dead nation's roster row: the taker fields up to four heroes, its Overview
   lists two, the stats list the others under no living nation (`server.ts:848–865`), and once lost they wait for a
   revival. AI play: Britain fields Roma and P.100 (seed 4637), the United States the Maus (7603, 1,033 days).
   Contradicts ADR-791 (a nation's heroes in its Overview) and PLAN 7.184a (each power its one hero a row). Evidence:
   `critic/c29_ho_on_4637.json`, `critic/c29_ho_on_7603.json`, `critic/c29_hn_4111.json`,
   `critic/shots/c29hn_4111_ger_block.png`. **Fix:** a hero is not handed over (gone with its nation, its row waiting
   for a revival, as now), or the roster row moves with it and the Overview lists it; and a checker rule: a hero's
   formation is its roster nation's.
3. **B3. Sea heroes wait years to return while their nations live, in every seed, against the option's promise of 60
   days.** The hint (`en.json:934`): "They heal, and come back 60 days after they are lost." A sea hero returns only at
   a naval base its nation holds (`returnPlace`); the 1938 data gives France 4, Germany 2, the Soviet Union 4, and
   losing them is common: Richelieu waits 16,123 days over 10 seeds × 20 years, Roma 11,218, Sovetsky Soyuz 5,551,
   Bismarck 4,888; the Soviet Union of 4253 holds 149,484 cells and 12 ports, none a base. ADR-791 names "waits to
   return" as a state; the design did not foresee it as the usual one. Evidence: `critic/c29_ho_sum.txt`,
   `critic/c29_hwait_4253_SOV.json`, `critic/c29_hwait_4111_GER.json`, `data/scenarios/1938/ports.json`. **Fix:**
   with no naval base held, return at any port the nation holds (or its capital's nearest coast); say why in the row
   while it waits.

## Non-blocking issues

1. **H-N1. A hero's loss and return are told nowhere but its Overview row**: no ticker row, no History row or kind; the
   day's sea battle reads "Germany lost 1 ship" (`critic/c29_hd_4111_bis.json`, `critic/shots/c29hd_4111_bis_history.png`).
   Fix: ticker and History rows ("Bismarck was sunk near …", "Bismarck is back at Kiel") with Go to.
2. **H-N2. A hero's formation panel shows men, not health** ("Men 2,200 of 2,200" at 35 %; ADR-787 keeps men whole;
   the design covers the Overview's bar, not this panel): `critic/shots/c29hw_4111_bis_panel.png`. Fix: a health row.
3. **H-N3. Hero tags read men** ("6", "2.2k") beside "12.5k" divisions and "13.4k" squadrons. Fix: name and a health pip.
4. **H-N4. Land heroes starve in about half their losses** (437 of 824 with no fight in their last 24 h; supply 0, org
   0 at the end): the TOG II dies in Nationalist Spain three times in a year (`critic/c29_hl_4111.json`). The march is
   the AI's (ADR-796); the execution side: the 5 % daily heal is outrun by attrition to death, unseen. Fix: a hero out
   of supply for days falls back to supply, or is told in the ticker.
5. **H-N5. Sea heroes are lost about every eight months** (24–31 times in 20 years) and fight on 1–2 % of their war
   days; "far stronger than any other" does not show in play (`critic/c29_ho_sum.txt`). Cause not shown (low
   confidence: fire picked by hit points draws the enemy's guns to the biggest ship).
6. **H-N6.** The option explains itself on hover only; at T1 a hero hides the fleets stacked with it
   (`critic/c29_hs_3739.json`).
7. **H-N7.** The checkers carry no rule for the heroes (one per row, its roster's nation, back within its hour when it
   has a place); B2 and B3 pass them green.
8. **R1-N1. The relations graph says "X is at war beside X"** for a nation alone on its side; it is unreadable on a
   phone; the bottom bar wraps at 1024 px since its button (`critic/c29_rg_4111_desk.json`,
   `critic/shots/c29rg_4111_phone_d365.png`, `critic/c29_p3_widths.json`).
9. **Unchanged from run 28:** the bond's exit costs no truce (BX); guarantees only the start's (BS); five ticker rows for
   one Force war; a refused peace untold in the Actions tab; phone clutter at 60 / 800 m/px; live "Propose alliance" refused by the sim (AL identical).

## Design objections (none blocking, no score lowered)
- **The heroes' AI** (ADR-793–796, the user's decisions): a sea hero tied to the largest fleet goes wherever that fleet
  meets the enemy in force, and dies there; a land hero marched toward the nearest fight with no regard to supply dies
  of hunger. A unit "far stronger than any other" would read better spent like one: with the main force but out of
  hopeless fights, brought home when cut off.
- **Returns only at a naval base** is the plan's rule; with 2–4 bases a nation it makes a sea hero's absence the normal
  state of a long war (B3 is the execution side).
- Run 28's objections stand (the played nation's AI declares its own wars; a junior member's peace ends the whole war).

## Ideas from other games (not scored)
- Named units in grand-strategy games announce themselves: a news line when a named ship is sunk or a general falls,
  the ship's name in the battle report. A "Heroes" list in Statistics (lives, losses, sinkings) would make them a story
  rather than a block in an Overview.

## Notes
- No 529x port was listening at the start; this run used only 5299 and stopped it at the end. No worktree.
- The fps probes (LW ×4, PF, RW) ran while the last headless jobs (AL, 8209 × 30) were still running; run 28 found
  such runs read the same as quiet ones.
- `c29_ho.ts` counts a hero "in battle" on a day if `engaged` at any hour; "lost out of battle" = no `engaged` hour in
  its last 24. HL's `sinceEng` starts at 9,999 for a hero never engaged since raised.
- The heroes figures are HEAD only (on vs off, same seed): run 28 measured no heroes-off pair, "new seeds, not compared".

## Strengths, verified
- **The batch's rule fixes hold on my own counts:** 0 broken of 2,372 bonded Force wars on six seeds (run 28 found 4),
  AI puppets rising on two of three seeds, the war checker clean on 8209 where run 28 counted 7.
- **A hero is findable and followable from its nation:** the Overview's Heroes block with health and "returns in N
  days", a click that selects and follows it (`critic/c29_hv_3739.json`), a save that keeps a hero's return to the tick
  (`critic/c29_hsl_4111.json`).
