# Critic report, run 24

- **Commit:** `82d428c11e99152c221c5df7064f4a0138508557` (HEAD at the start, `critic/c24_commit.txt`). Run 23 was on
  `81beca11`; 24 commits since. What changed for a player: **new-game option "Alliances and wars": the 1938 start's
  diplomacy drawn by the seed** (PLAN 7.182, ADR-785); **new-game option "Heroes"**: 14 named super-units (Bismarck,
  Maus, Yamato …) with their own counters, an Overview block, healing and a 60-day return (PLAN 7.184, ADR-787–796; the
  heroes' AI closed "not done" by the user's decision); **the camera follows any formation clicked** (PLAN 7.183,
  ADR-786); **T0 countryballs and planes' balls drawn once and copied** (PLAN 7.181, ADR-784).
  **The default sim did not change:** seed 7019's 20 yearly hashes on HEAD equal run 23's, 20 of 20
  (`critic/c24_headless_7019.json` against `critic/c23_headless_7019.json`).
- **Date:** 2026-11-02.
- **Build:** `vite build --outDir critic/c24_dist`, exit 0 (`critic/c24_build.log`), served by `vite preview` on
  127.0.0.1:**5299**; run 23's build (`critic/c23_dist`, `81beca11`) on **5298** for before/after. Both stopped at the
  end (no listener left on 5298/5299). Chromium through Playwright, headless, 1600 × 900; 390 × 844 touch for the phone probes.
- **Runs:** run 23's three page suites and its misc probes re-run on HEAD (`c24_suite1.sh`, `c24_suite2.sh`,
  `c24_clicks.sh`, `c24_misc.sh`), CB/CB2/PL on the same frozen moment as run 23, PL on both builds; PF alone at the end;
  an A-B-A-B draw-cost probe (DC) on both builds on one save. New: DP/DR/OCC (seed-drawn diplomacy, headless and page),
  HV/HS/HEROES/HERODEATH/HEROPOS (heroes), FO (camera follow), GU/SOVCZS (a guarantee in war), a 10-year page watch with
  both new options on (seed 6197), two new seeds × 30 years headless (3739, 6197).
- Every path below was made in this run (`c24`) unless it names `c23`. Scripts are in `critic/scripts/c24_*`.
  The re-run comparison of every probe JSON is `critic/c24_cmp.txt` / `critic/c24_cmp.json`.

## Verdict

**One new blocking issue, in a new feature.** With "Alliances and wars: random" the scenario's Japan–China war is let
go, but **Japan's occupation of 1,345 Chinese cells is not**: from the first frame Peiping, Tientsin and the Shanghai
pocket are hatched as Japanese-held land while China's panel reads "At peace", and on seed 8821 it is still so after 900
days (`critic/c24_occ_8821.log`, `critic/shots/c24dr_rnd_8821_d1_china.png`, `..._d180_china.png`). On all three
seeds tried the hold is there at day 0; it ends only when a new war between the two happens to come
(`critic/c24_dp.json`). SPEC says occupation (`controller`) only changes owner through a peace and a white peace returns
it (SPEC §"Occupation vs owner", §"Terms"); the option creates a state the sim otherwise never produces and ADR-785 says
the scenario's diplomacy goes "without a trace". Diplomacy goes 7 → 6 for it.

Everything else re-run returned run 23's result: 24 probe JSONs identical after dropping timings, the rest differing only
in the new option rows of the forms and live counts at Max speed. The ball cache (ADR-784) changes no plane or ball to the
eye: 7–170 px of 1.44 M differ between builds at the same moment, all anti-aliasing (`critic/c24_pldiff.json`,
`critic/shots/c24pl_3000m_pair_c23left_c24right.png`). The camera follow works as specified in every step tried (FO).
The heroes are drawn and listed as ADR-789/791 say, but over ten years they mostly stand (below; design objection).

## Scores

| Dimension | Run 23 | Run 24 |
|---|---|---|
| Map visuals and readability | 7 | 7 |
| Diplomacy, war, alliance, puppet, revolt depth | 7 | **6** |
| Emergent world dynamics over long runs | 7 | 7 |
| God Mode | 7 | 7 |
| Editor and scenarios | 7 | 7 |
| Stats and history | 7 | 7 |
| UI/UX and polish | 7 | 7 |
| Performance | 7 | 7 |
| Stability | 7 | 7 |
| Semantic zoom to unit level (needs 8) | 8 | 8 |
| Naval warfare (needs 8) | 8 | 8 |
| Tanks (needs 8) | 8 | 8 |
| Aircraft (needs 8) | 8 | 8 |
| AI nuclear use (needs 8) | 8 | 8 |

**Diplomacy 7 → 6:** R24-B1 (above), new code, not present on run 23's build (the option did not exist; the default
path is byte-identical). It is the only score that moves.

## Run 23's cases re-run

| Run 23 case | On HEAD | Evidence |
|---|---|---|
| R22-B1 fix, CB2: helmeted balls at 10 m/px (7019, GER v POL, day 1) | **Identical** to run 23 (marker code changed for heroes; the helmet fix survives). | `critic/c24_cb2_7019_GER_POL_10.json` |
| CB: the same moment at ten zooms, both looks | **Identical** JSON; T1 pairs as run 23. | `critic/c24_cb_7019.json`, `critic/shots/c24cb_7019_arm_1200m_balls.png` |
| Non-blocking 5 (fixed in 23): planes as silhouettes, PL on both builds | **Same to the eye**; JSON identical on both builds; 7–170 differing px a screen (sub-pixel), none a plane changed. | `critic/c24pl_7019_GER_POL_5299.json`, `critic/c24_pldiff.json`, `critic/shots/c24pl_0250m_pair_c23left_c24right.png` |
| Non-blocking 1: freed puppet on both sides (FW2, 2207) | **Unchanged** (identical). | `critic/c24_fw2_2207.json` |
| Non-blocking 6: "Propose alliance" to an enemy (FW, 2207) | **Unchanged** (identical). | `critic/c24_fw_2207.json` |
| Non-blocking 2: Breakthrough refusal only in God's tab (K, K2, K3, 2203) | **Unchanged** (identical). | `critic/c24_k2_2203.json`, `critic/c24_k3_2203.json` |
| Non-blocking 3: own counters in mixed stacks (SX, SXT, SXG 6827/3917) | **Unchanged** (identical; 3917 still 1 of 12). EX2 differs only in a live count (3 vs 2 German within 14 px). | `critic/c24_sxg_3917_ITA.json`, `critic/c24_ex2_4441.json` |
| Non-blocking 4: level-3 plasters read as ✕ (HU) | **Unchanged** (identical). | `critic/c24_hu_7019_d12.json` |
| Non-blocking 5: own war behind "+1" on the phone, bar 24 % (TD, PH, P) | **Unchanged** (TD identical). | `critic/c24_td_3391.json` |
| Old files at the preview (OS2 c10, run 23's scenario file), format-1 save | Unchanged: c10 refused with its reason, run 23's file loads; only the title page's text gained the new options. | `critic/c24_os2_c10.json`, `critic/c24_os2_c23.json`, `critic/c24_os_c10fmt1.json` |
| Non-blocking 7: editor fleets' long wait (G, 4877) | Run 23's probe timed out waiting for day 120 at Max; this run reached it. Different load on the machine; **not compared**, no score moves. Placements and the land refusal unchanged. | `critic/c24_g_4877.json` |
| Fights, fleets, God tools, nukes, zoom, tags, wing mark, widths, touch, play | FT, FP2, Q, PL(6011), PT, SX* identical; A, Z, W, SB, C differ only in live tick / sortie counts and the new form rows. No page error in any. | `critic/c24_cmp.txt` |
| History (7019 y20), export | **Identical** JSON (3,652 events). | `critic/c24_hi_7019.json`, `critic/c24_dl_7019.json` |
| PF: frame rate by look (7019 y20, Max), alone | Same as run 23: 60 fps at 3000/1200/600 m/px both looks; 120 m/px 41.1 / 42.6, 30 m/px 44.7 / 41.7 (balls / Classic). | `critic/c24_pf.log` |
| World dynamics | Same sim (20 of 20 hashes). | `critic/c24_headless_7019.json` |

## New in this run

| Case | What happened | Evidence |
|---|---|---|
| **DP: seed-drawn diplomacy, 3 seeds × {scenario, random}, days 0–180** | Random: Japan holds 1,345 Chinese cells at peace on all 3 seeds from day 0 (scenario mode: 0 at every sample). Drawn shapes are odd but per ADR (Iran–CCP–Afghanistan, Bolivia–Siam–Paraguay pacts; Tibet guaranteeing Greece). No puppet against its overlord, no allies on opposite sides. | `critic/c24_dp.json` |
| **OCC: how long it lasts** | 8821: 1,345 cells at peace every 90 days through day 900. 1517: to day 540, then a JAP–CHI war starts with Japan already holding them. | `critic/c24_occ_8821.log`, `critic/c24_occ_1517.log` |
| **DR: what the player sees** | Day 1 and day 180 on 8821: hatched "occupied land" round Peiping/Tientsin and Shanghai with Japanese 41.2k stacks inside it; China's panel "AT WAR WITH: At peace" (day 1); history shows only the two drawn wars. | `critic/shots/c24dr_rnd_8821_d1_china.png`, `critic/shots/c24dr_rnd_8821_d180_china.png`, `critic/c24_dr_rnd_8821.json` |
| **SOVCZS/GU (default path, pre-existing): the Soviet Union at war with the nation it guarantees** | On 3 of 3 seeds the Soviet Union declares on Romania on day 4–11, CZS is called in as Romania's ally, and the Soviet guarantee of CZS stands through the war. Guarantees appear in no nation panel, so a player does not see the contradiction; the predictability (same opening war on every seed) is what a watcher notices. Same sim as run 23: new finding, not a change. | `critic/scripts/c24_sovczs.ts` output in this report, `critic/c24_dp.json` (`odd` at d30, all scenario rows), `critic/c24_gu_3739.json` |
| **FO: camera follows any clicked formation (observer)** | A German formation clicked at 250 m/px is centred (0 px) after 48 h and after an off-centre wheel zoom; a Polish one clicked takes the follow; a click on ground ends it; a fleet is followed 48 h; an arrow-key pan ends it. As ADR-786 says. | `critic/c24_fo_7019.json`, `critic/shots/c24fo_7019_*` |
| **HV: heroes on the map and in the panel (3739)** | T0: each hero a large named counter; at world zoom the 14 names are the largest labels on the map after nation names (`c24lwhd_6197_y10_world.png`). T1: the hero's marker shows its crew ("6" for the Maus, "8" for the TOG II, "2.2k" for the Bismarck) where the T0 counter shows its name. T2: the Maus at 120 m/px is a ~10 px ball next to 30-figure infantry blocks. The Overview's Heroes block works; a row click opens and follows the hero (0 px); "returns in 52 days" shown for a sunk Bismarck. | `critic/c24_hv_3739.json`, `critic/shots/c24hv_3739_1475_120m.png`, `critic/shots/c24hv_3739_1475_1200m.png`, `critic/shots/c24hv_3739_gone_row.png`, `critic/shots/c24hv_3739_maus_click.png` |
| **HS: a hero over its own stack** | Germany's battle squadron, destroyer and submarine flotillas sit at the Bismarck's spot; at 1200 m/px the marker there carries "×4", and five clicks open the Bismarck five times: the squadron cannot be opened there. Same for Infantry division 1 under the Maus at Berlin. ADR-789 accepts that a hero covers its neighbours. | `critic/c24_hs_3739.json`, `critic/shots/c24hs_3739_1474_1200m.png` |
| **HEROES: 14 heroes × 10 years, 2 seeds (headless)** | Land heroes in battle on 1–24 % of their nation's war days (O-I 79 of 3,416 on 3739), standing still (< 1 cell a day) on 50–97 % of them; sea heroes in battle on 0.4–3 % and lost 8–35 times in ten years (Sovetsky Soyuz alive 1,229 of 3,650 days on 8821). | `critic/c24_heroes_3739.json`, `critic/c24_heroes_8821.json` |
| **HERODEATH (8821, 500 days)** | Sea heroes are lost in battle (0 h since engaged), mostly in hours full of air strikes; the Maus, Bismarck, T-28 and T-42 were each also lost 200–3,500 hours after their last fight (air strikes with no battle). | `critic/c24_herodeath_8821.log` |
| **LW-HD: 10 years in the page with heroes on and random diplomacy (6197)** | 27–42 s a year, 59.8–60 fps, longest gap 125 ms, no page error; 6 wars on the banner each year; by 1948 the US, China and the Soviet Union lead. Hero positions checked headless: each sea hero at sea. | `critic/c24_lwhd_6197.json`, `critic/shots/c24lwhd_6197_y10_world.png`, `critic/c24_heropos_6197.log` |
| **DC: draw cost, both builds, one save, A-B-A-B** | Means 1.8–3.3 ms (HEAD, first pass), 2.1–6.0 (c23), 2.3–5.4 (HEAD, second), 1.9–6.0 (c23); the spread between passes of one build is larger than between builds. No measurable change either way on this instrument. | `critic/c24_dc_head1.json`, `critic/c24_dc_c23.json`, `critic/c24_dc_head2.json`, `critic/c24_dc_c23b.json` |
| New seeds 3739 and 6197 × 30 years (new seeds, not compared) | 3739: 76–97 nations living, 4–11 wars a year, nuclear use by Germany, the UK, China and the US; the US 23.9 % of land at y30. 6197: 2–10 wars a year, nuclear use by the UK only; the US 33.6 % at y30. Mean tick 2.7 ms (three at once, unpinned). | `critic/c24_headless_3739.json`, `critic/c24_headless_6197.json` |

## Dimensions

### Map visuals and readability: 7 (unchanged)
- **Tested:** CB, CB2, PL on run 23's moment, both builds; heroes at four zooms.
- **Evidence:** `c24pl_0250m_pair_c23left_c24right.png`, `c24_cb_7019.json`, `c24hv_3739_1475_120m.png`.
- **What AoC does better:** counters in the nation's colour (as run 23). **Fix:** none new; hero T1 marker see non-blocking 8.

### Diplomacy, war, alliance, puppet, revolt depth: 6 (was 7)
- **Tested:** DP on 3 seeds, OCC to 900 days, DR in the page; FW/FW2 re-run (identical); SOVCZS on 3 seeds.
- **Evidence:** `c24_dp.json`, `c24_occ_8821.log`, `c24dr_rnd_8821_d1_china.png`, `c24dr_rnd_8821_d180_china.png`.
- **What AoC does better:** (text) occupation exists only in a war; peace returns or cedes land.
- **Fix:** R24-B1. Also non-blocking 1, 6, 9.

### Emergent world dynamics over long runs: 7 (unchanged)
- Same sim; new seeds busy and global; the Soviet day-4–11 war on the Little Entente on every seed tried is a sameness a watcher of several games will see (non-blocking 9). LW-HD with both options: busy, global.

### God Mode: 7 (unchanged)
- Q, A, K, K2, K3 identical. **Fix:** non-blocking 2.

### Editor and scenarios: 7 (unchanged)
- Editor placements and refusal as before (`c24_g_4877.json`); old files as before. The two new options are offered in
  the form and the settings (`c24u_1600_11_settings.png`); one of them is R24-B1 (scored under Diplomacy, where its effect is).

### Stats and history: 7 (unchanged)
- History and export identical. The heroes' Overview block reads well (`c24hv_3739_gone_row.png`).

### UI/UX and polish: 7 (unchanged)
- Follow of any formation works in every step (FO). Costs: a hero covers its stack at T1 (HS), mixed-stack clicks (3917: 1 of 12), the phone bar.
- **Fix:** non-blocking 3, 8.

### Performance: 7 (unchanged)
- PF alone equals run 23's; DC finds no difference between builds; LW-HD at 60 fps for ten years with heroes on.

### Stability: 7 (unchanged)
- No page error in any probe; default sim deterministic across builds (20 of 20). R24-B1 is a state inconsistency, scored once under Diplomacy.

### Semantic zoom to unit level: 8 (unchanged)
- Z re-run within 30 elements of run 23 at every step (`c24_z_5861.json`); CB identical.

### Naval warfare: 8 (unchanged)
- SB as before; sea battles every year on new seeds. Sea heroes add little (in battle on 0.4–3 % of war days).

### Tanks: 8 (unchanged)
- Armour unchanged. The land heroes (super-heavy tanks) stand most of their wars (design objection).

### Aircraft: 8 (unchanged)
- Planes unchanged to the eye after the cache (PL pairs); air war as before.

### AI nuclear use: 8 (unchanged)
- New seeds: four nations use the bomb on 3739, one on 6197 (`c24_headless_*.json`); God nukes as before (`c24_a_4219.json`).

## Blocking issues, in priority order

1. **R24-B1: "Alliances and wars: random" leaves Japan occupying 1,345 cells of China at peace, for years.**
   Evidence: `critic/c24_dp.json` (all 3 random seeds, day 0; 0 in scenario mode), `critic/c24_occ_8821.log` (900 days),
   `critic/shots/c24dr_rnd_8821_d1_china.png`, `critic/shots/c24dr_rnd_8821_d180_china.png` (hatched, China "At peace").
   Fix: when `randomDiplomacy` drops the scenario's wars, end them as a peace would: occupied land goes back to its owner
   (controller = owner) and foreign armies inside leave, before the drawn wars are declared.

## Non-blocking issues

1. **A freed puppet fights on both sides** (unchanged; `c24_fw2_2207.json`).
2. **Breakthrough's refusal shown only in God's tab** (unchanged; `c24_k2_2203.json`).
3. **Own counters in mixed stacks** (unchanged; `c24_sxg_3917_ITA.json`: 1 of 12).
4. **Level-3 plasters read as ✕** (unchanged; `c24_hu_7019_d12.json`).
5. **The player's own war behind "+1" on the phone; bar 24 %** (unchanged; `c24_td_3391.json`).
6. **"Propose alliance" offered to an enemy** (unchanged; `c24_fw_2207.json`).
7. **Unchanged:** land "To its fight" off its formation (ADR-775).
8. **Hero markers (new):** at T1 a hero's marker shows its crew ("6", "8") where its counter shows its name, and it
   carries the "×4" of the stack it covers while only the hero opens there (`c24hs_3739_1474_1200m.png`,
   `c24_hs_3739.json`). Fix: the name on the T1 marker too; a second click on a hero's spot opens the formation under it.
9. **The Soviet Union fights the nation it guarantees, and does so in the same opening on every seed** (default path,
   pre-existing): SOV on Romania on day 4–11 on 3 of 3 seeds, CZS called in against its guarantor, the pledge kept
   (`c24_dp.json` scenario rows' `odd` at day 30; SOVCZS). Fix: a guarantor is torn (stays out, or its declaration is refused) where the declaration would call its guaranteed nation against it; or the pledge lapses.

## Design objections (none blocking, no score lowered)

- **The heroes' AI (ADR-793–796, closed "not done" by the user):** a player who turns Heroes on watches 14 named
  super-units that, over ten years, stand still on 50–97 % of their nation's war days, fight on 1–24 % (land) and 0.4–3 %
  (sea) of them, and sea heroes are sunk and reborn 8–35 times (`c24_heroes_3739.json`, `c24_heroes_8821.json`,
  `c24_herodeath_8821.log`). A "hero" that is mostly a parked counter or a recurring loss is not what the name promises.
- **A hero covers its neighbours at T1 (ADR-789):** Germany's main fleet at its base cannot be opened by click with heroes on (`c24_hs_3739.json`).
- **Hero counters at world zoom (HERO_SCALE 2):** the 14 hero names are the largest labels on the world map after nation names and crowd it (`c24lwhd_6197_y10_world.png`).
- **The seed-drawn diplomacy's shapes (ADR-785):** pacts of nations a world apart in kind (Iran–CCP–Afghanistan; Tibet guaranteeing Greece) read as noise, not history (`c24_dp.json`).
- Run 23's objections stand (ADR-773, ADR-777, ADR-782, ADR-783, ADR-771).

## Notes

- `metresPerPx * cam.scale` in HV/FO logs is metres per cell, constant; zoom changes are read from the shots, not those numbers.
- Preview servers on 5298 and 5299 stopped at the end (no listener); no browser left.

## Strengths, verified

- **A large feature set landed without touching the default world:** 20 of 20 yearly hashes equal run 23's, and 24 page probes return byte-identical results.
- **The camera follow is right in every case tried** (click, wheel, switch, ground, fleet, keyboard pan; `c24_fo_7019.json`).
