# Critic report, run 22

- **Commit:** `4a977fdbc373e591a71c04c328336f8817b33dca` (HEAD at the start, `critic/c22_commit.txt`). Run 21 was on
  `bd7940de`; 45 commits since. What changed for a player: **units are countryballs by default** (PLAN 7.174, ADR-777,
  ADR-778; Classic is a setting), losses shown as cracks and plasters (7.178); **"Force war"** breaks alliances, puppet
  bonds and truces (7.175, ADR-780); the right-click menu carries standing, God's diplomacy, Take/Release control
  (7.175b–f, 7.177); the played nation in the title bar (7.176a); Place at once moved to God's tab (7.176b, 7.177);
  "what is drawn under a click wins" (7.163, ADR-773); and run 21's non-blocking list (7.164–7.171). **The sim
  changed:** at war, full suppression keeps the war's reserve (ADR-776, pin b22bcdd1 → dc41c283), plus `forceWar`.
- **Date:** 2026-11-01.
- **Build:** `vite build --outDir critic/c22_dist`, exit 0 (`critic/c22_build.log`), served by `vite preview` on
  127.0.0.1:**5299**. Run 21's build (`critic/c21_dist`, `bd7940de`) served on **5298** for before/after on the same
  clicks. Both stopped at the end. Chromium through Playwright, headless, 1600 × 900 (1400 × 800 for menus), 390 × 844
  with touch.
- **Runs:** seeds 1213, 3301 × 30 years and 7019 × 20 years headless on HEAD, against run 21's files for the same seeds
  (`critic/c22_dyn.json`); run 21's page suites re-run (`c22_suite1.sh`, `c22_suite2.sh`, `c22_clicks.sh`); new probes
  CB/CB2/CB3 (countryballs against Classic, the helmet), HU (losses), SB (a sea battle), PF (frame rate by look), FW/FW2
  (Force war), TD (war from the map on touch), K2 (Breakthrough's refusal), and a 10-year page watch of 8243.
- **Reference:** `reference/screens/`, `reference/text/AOC_TEXT_NOTES.md`. AoC has no unit sprites at this level and no
  countryballs; what I say of AoC's units is from text and the trailer frames only.
- Every path below was made in this run (`c22`). Scripts are in `critic/scripts/c22_*`.

## Verdict

**The new default look has one execution defect that hits the first war of the default scenario: the infantry
helmet sits over the top third of the flag, and every nation whose flag is a horizontal tricolour loses the stripe that
names it.** German, Austrian and Polish infantry, as T1 markers and as T2/T3 balls, all read as a white-over-red ball
under a helmet (`c22cb_7019_arm_1200m_balls_crop.png`, `c22g_4877_01_after_places.png`,
`c22cb2_helmet_pair_GER_left_POL_right.png`). Classic told the two sides apart by the marker's box in the nation's
map colour (`c22cb_7019_arm_0600m_classic.png`); the balls dropped that cue and kept a flag that no longer shows.
This is blocking (R22-B1). Everything else that moved moved the right way: most of run 21's non-blocking items are
resolved and seen resolved, war from the map now works on touch, old files are refused with a reason, and the balls
cost no frame rate.

## Scores

| Dimension | Run 21 | Run 22 |
|---|---|---|
| Map visuals and readability | 7 | **6** |
| Diplomacy, war, alliance, puppet, revolt depth | 7 | 7 |
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

**Map visuals 7 → 6:** the same frozen moment in both looks on HEAD (seed 7019, Germany v Poland, day 4–5), so the
before/after is the same case: Classic's T1 boxes read German grey against Polish red at a glance; the default balls read
white-red against white-red (`c22cb_7019_arm_0600m_classic.png` vs `c22cb_7019_arm_0600m_balls.png`). No other score
moved: UI/UX lost most of its listed defects but gained the cost of ADR-773 in mixed stacks and two small new ones
(below), and the sim change shows as a quieter world, not a better or worse one, on three seeds.

## Run 21's cases re-run

| Run 21 case | On HEAD | Evidence |
|---|---|---|
| Seeds' yearly hashes (1213, 3301 × 30) | **Not comparable:** the sim changed (ADR-776, forceWar). 1 of 80 world-years equal (3301 y1). Compared instead by what a watcher sees, below. | `critic/c22_dyn.json`, `critic/c22_headless_{1213,3301,7019}.json` |
| R20-B1 invariant (panel = selection, 4441) | **Holds:** 12 of 12 clicks, `mismatch 0`, `idMismatch 0`. But own clicks now select 7 of 12 (run 21: 12): five opened a Polish or Italian panel drawn over the German counter (ADR-773). | `critic/c22_sx_4441.json` |
| Same on the phone (SXT, 12 taps) | 9 of 12 select (run 21: 12), panel = selection 9 of 9; the other three show a Polish or Italian panel. | `critic/c22_sxt_4441.json` |
| **Non-blocking 1: enemy clicks open one's own panel (EX2, 4441, scale 12)** | **Resolved on this front:** HEAD 7 of 12 open the clicked Polish formation, **0** a German panel, 0 select; run 21's build on 5298, same script: 5, 3, 3. At scale 120: 12 of 12 on both. | `critic/c22_ex2_4441.json`, `critic/c22_ex2old_4441.json` |
| Same on Japan v China (6827) | Enemy clicks: a Chinese panel 8 of 12 (run 21's build 5), own 4 (7); the clicked formation's own panel 0 of 12 on both. | `critic/c22_sxg_6827_JAP.json`, `critic/c22_sxgold_6827_JAP.json` |
| Same on Italy v Yugoslavia (3917) | **Own clicks select 1 of 12** (run 21's build 12 of 12): the Vienna–Bratislava knot draws German, Romanian and Yugoslav counters over Italy's; 11 clicks opened their panels. Different worlds (the sim changed), same rule change. | `critic/c22_sxg_3917_ITA.json`, `critic/shots/c22sxg_3917_ITA_own_0.png` |
| Non-blocking 2: fallback panel ≠ selection | No case in 72 clicks and taps. | `c22_sx_4441.json`, `c22_sxg_*` |
| **Non-blocking 3: old scenario file offered then refused** | **Resolved:** refused at the preview, "Could not load: it was made by an older version of Warism, and this one cannot start it", no Start. A run 21 file still loads in 2.8 s. | `critic/c22_os2_c10.json`, `critic/shots/c22os2_c10_chosen.png`, `critic/c22_os2_c21.json` |
| Broken format-1 save offered again | **Resolved:** the title says "from an older version … cannot be continued", no Continue. Run 21's own autosave (`bd7940de`, 7019 y20, format 1) **continues** on HEAD to 27 Dec 1957. | `critic/c22_os_c10fmt1.json`, `critic/c22_os_c21save_f1.json` |
| Phone bar and God tools clipped (390 × 844) | **Resolved:** `off: []`, `clipped: []`; the bar wraps to three rows. Cost: the bar is 83 px tall (was 32); covered share at start 0.11 → 0.16, at day 60 0.18 → 0.24. | `critic/c22_p.json`, `critic/c22_ph.json`, `critic/shots/c22p_phone_03_god.png` |
| 28 identical air rows | **Resolved:** each row names its wing and base ("Fighter group 1252 · at Tempelhof"). | `critic/shots/c22u_1600_05c_actions_air.png` |
| Diplomacy select on Afghanistan | **Resolved:** "Choose a nation…". | `critic/c22_pl_6011.json` |
| Identical carrier rows in the ticker | **Resolved on 8243:** rows are grouped ("Carrier strike ashore: Japan on China ×3"); no repeated rows in 10 years. | `critic/c22_lw_8243.json`, `critic/shots/c22hu_7019_d12_8m_balls.png` |
| Export a/b raw | **Resolved:** `SeaBattle,19,France,24,Spanish Republic`. | `critic/c22_dl_7019.csv` |
| God revolt told as a war | **Resolved:** "Free Saxony broke away from Germany". | `critic/c22_q_6421.json` |
| Breakthrough silent (2203) | **Partly:** with God's tab open, "Not done: it is at war with no one: there is no front to break through." From the bar's Map tools with the panel on Overview, two clicks: nothing anywhere on the page, the tool disarms. | `critic/c22_k3_2203.json`, `critic/shots/c22k3_godtab.png`, `critic/c22_k2_2203.json`, `critic/shots/c22k2_overview.png` |
| New-seed watch (3301, run 21's WW) | Re-run on HEAD, finished without page errors; a different world (sim changed), not compared. | `critic/c22_ww_3301.json` |
| No war from the map on touch | **Resolved:** Diplomacy, a tap on Italy: the menu, in view (186,430 178 × 118), "Declare war" makes the war. | `critic/c22_td_3391.json`, `critic/shots/c22td_02_menu.png`, `critic/shots/c22td_03_war.png` |
| Land "To its fight" off its formation (5381 d21), fleet "To its fight" (4877) | Same results as run 21 (ADR-775 keeps it). | `critic/c22_ft_5381_d21.json`, `critic/c22_fp2_4877.json` |
| Wing mark on its hourly point (5557) | Same shape (250 m/px median 68 px, p90 586). The user's decision (ADR-771): moved to design objections. | `critic/c22_w_5557.json` |
| Editor fleets and refusal (4877) | Same: placements hold, "no water of a sea is near the place". | `critic/c22_g_4877.json` |
| God nukes (4219), zoom series (5861) | Same results; zoom series identical (element counts per step). | `critic/c22_a_4219.json`, `critic/c22_z_5861.json` |
| History panel (7019 y20) | 3,652 of 3,652 events in 116 ms (run 21: 4,154 in 112 ms; a different world). | `critic/c22_hi_7019.json` |
| Page watch of 8243, 10 years at Max | 27–53 s a year (53 s in year 6 while another suite ran), 59.8–60 fps, longest gap 83 ms; run 21: 31–41 s, gap 100 ms. | `critic/c22_lw_8243.json` |

## New in this run

| Case | What happened | Evidence |
|---|---|---|
| **CB: balls against Classic, the same frozen moment at ten zooms** (7019, Germany v Poland, armour in contact) | T0: the flag chip becomes a ball with eyes; readable, the German ball keeps its black stripe. **T1: infantry markers wear a helmet over the flag's top third; German infantry read white-red like Poland's.** Classic's boxes are filled with the nation's colour; the balls' boxes are dark. T2 at 250–120 m/px: battalions are a few px, the most visible balls on screen are planes. T3 at 25–5 m/px: charming and clear for armour (tracks, barrel, the full German tricolour), less so for infantry. | `critic/c22_cb_7019.json`, `critic/shots/c22cb_7019_arm_*_{balls,classic}.png`, `critic/shots/c22cb_7019_arm_0025m_balls_crop.png`, `critic/shots/c22cb_7019_arm_0005m_balls.png` |
| **CB2: what the pixels show at 10 m/px** | Every element on screen with its nation (`view.elementNation`); 10 clear German helmeted balls and 6 Polish. Below the brim: dark pixels 7.1 % of the disc (German) vs 4.7 % (Polish; eyes and outline make most of both); mean red (190, 5, 5) vs (195, 20, 55). Scarlet against crimson, on a 40 px ball, is the only difference. | `critic/c22_cb2_7019_GER_POL_10.json`, `critic/c22_cb2_7019_GER_POL_10_pixels.json`, `critic/shots/c22cb2_7019_GER_POL_10_0_annot.png` (yellow dot German, cyan Polish), `critic/shots/c22cb2_helmet_pair_GER_left_POL_right.png` |
| CB3: a census of the 102 start flags under the helmet | A crude 4 × 4 colour signature of the visible disc: 20 pairs whose full flags differ but whose helmeted balls nearly match, among them **Germany–Austria** (neighbours), Germany–Yugoslavia, Netherlands–El Salvador. Germany–Poland is not in it (the metric is coarser than the eye: CB2 is the evidence for that pair). | `critic/c22_cb3_census.json` |
| HU: losses at a real front (7019, day 12) | Of 1,007 elements in view: 723 whole, 221 cracked, 46 one plaster, 17 two. At 8 m/px the cracks and crossed plasters read well. A level-3 ball's two crossed plasters, under the eyes, read as an ✕ at a glance. | `critic/c22_hu_7019_d12.json`, `critic/shots/c22hu_7019_d12_8m_crops.png` |
| PF: frame rate by look, 7019 y20 save, Max, three alternating pairs per zoom | No cost: 3000 m/px 60.1 / 60.1 fps; 1200: 60.0 / 59.6; 600: 60.1 / 60.1; 120: 41.0 / 42.1; 30: 45.4 / 43.8 (balls / Classic). The 52 fps CB read at 3000 m/px was taken beside three headless sims and is not repeated idle. | `critic/c22_pf_7019.json`, `critic/c22_cb_7019.json` |
| SB: a sea battle (7019, France v Spanish Republic, hour 290) | Ships are balls on hulls with the flag; readable at 250 m/px, gunfire as before. | `critic/shots/c22sb_7019_250m_pair.png` |
| **FW: Force war, Japan on its ally Germany (2207)** | Standing "Allied", button "Force war"; after: Japan out of the Anti-Comintern, at war with Germany, Italy and Albania (Italy's puppet); ticker "Japan broke its alliance with Germany", then "declared war". Italy's menu then reads "At war" with Offer peace. Works as ADR-780 says. The menu still offers "Propose alliance" to a nation one is at war with. | `critic/c22_fw_2207.json`, `critic/shots/c22fw_2207_A_menu.png` |
| **FW2: Albania, Italy's puppet, forces war on Italy** | Standing "Your overlord", "Force war"; "Albania broke its puppet bond with Italy", war declared. **But Albania stays on Italy's side in Japan's war:** for at least 7 days it is a defender beside Italy and Germany against Japan while attacking Italy in its own war (`sameSideAsOverlord: 1` at day 1 and 7, and still at day 30 beside the Greek–Turkish war). | `critic/c22_fw2_2207.json`, `critic/shots/c22fw_2207_B_after.png` |
| TD: war from the map on a phone | Works (above). The player's own new war is not among the two banners shown; it sits behind "+1". | `critic/shots/c22td_03_war.png` |
| World dynamics, same seeds, run 21's commit against HEAD | Wars declared over the run: 1213 395 → 356, 3301 398 → 279, 7019 291 → 241. Cells changing hands: 3301 1.89 M → 1.07 M (−43 %), 1213 and 7019 −3 % and −10 %. Living nations at the end: 97 → 77, 85 → 72, 101 → 88; founded statelets 24 → 10, 18 → 9, 23 → 8. Revolts mixed: 119 → 133, 131 → 57, 104 → 74. Wars every year on every seed (4–10 at a time). ADR-776 did what it says (fewer statelets); the world is somewhat quieter. Three seeds, unpinned headless runs three at a time. | `critic/c22_dyn.json` |

## Dimensions

### Map visuals and readability: 6 (was 7)

- **Tested:** the default look against Classic at ten zooms on one frozen front; pixel sampling of the balls; a census
  of all start flags under the helmet; the world at year 10 of 8243; a sea battle.
- **Evidence:** `c22cb_7019_arm_0600m_balls.png` / `_classic.png`, `c22cb_7019_arm_1200m_balls_crop.png`,
  `c22g_4877_01_after_places.png` (Germany, Austria and Poland, three neighbours, all white-red helmets),
  `c22k_2203_00_breakthrough_clicked.png`, `c22ph_portrait_06_selected.png` (the phone at day 60: German and Polish
  markers alike), `c22cb2_helmet_pair_GER_left_POL_right.png`.
- **What AoC does better:** AoC's armies are blobs and counters in the nation's own colour; one cannot mistake the
  sides. The balls' charm is real at T3 (`c22cb_7019_arm_0005m_balls.png`), but at T1, where a player reads a front,
  the default look tells sides apart worse than Classic did.
- **Fix:** see R22-B1. Also: at T2 the planes are the largest balls on screen and read as units
  (`c22cb_7019_arm_0250m_balls_crop.png`).

### Diplomacy, war, alliance, puppet, revolt depth: 7 (unchanged)

- **Better (verified):** Force war breaks an alliance, a puppet bond, a truce, and the menu says the standing ("Allied",
  "Your overlord", "At war", "Neutral") (`c22_fw_2207.json`). God's diplomacy is in the menu.
- **Wrong (verified):** a freed puppet fights on both sides of its old overlord for days (`c22_fw2_2207.json`). "Propose
  alliance" is offered to an enemy at war.
- **Why not up:** the new depth is the player's; the AI's diplomacy is unchanged (ADR-780), and the one new
  inconsistency is in that new path.
- **What AoC does better:** (text only) a nation leaving a bond simply leaves its wars; no co-belligerent enemies.
- **Fix:** a broken puppet bond or alliance takes the nation out of the other's wars; hide "Propose alliance" at war.

### Emergent world dynamics over long runs: 7 (unchanged)

- Three seeds on both commits (`c22_dyn.json`): fewer statelets and fewer wars, 4–10 wars at a time every year,
  great powers shifting (3301: the Soviet Union 27.7 % → 31.5 % of land; 1213: the United States 20.2 % at y15). The
  8243 watch: Germany at war with France in Brazil, Japan taking Communist China's capital, Italy holding Africa
  (`c22lw_8243_y10_world.png`). Busy, global, not historical, as before. A difference this size on three seeds does
  not move the score.
- **What AoC does better:** long runs end in a few huge empires the player can follow; here 70–90 nations live at
  year 30, a busy map with less of a story. **Fix:** none needed for this run's change; watch the quieter trend.

### God Mode: 7 (unchanged)

- **Better (verified):** revolt told as a breakaway (`c22_q_6421.json`); Place at once for any nation from God's tab
  (`c22_u_1600_5557.json`: 31 icons, arm and Cancel work); tools whole on a phone (`c22_p.json`).
- **Still:** Breakthrough at peace refused silently from the bar unless God's tab is the one open
  (`c22k2_overview.png`). Nukes unchanged (`c22_a_4219.json`).
- **What AoC does better:** its tools act or say why at once, wherever clicked. **Fix:** show a refusal by the bar or
  in the ticker, not only in God's tab.

### Editor and scenarios: 7 (unchanged)

- Placements and the refusal on land hold (`c22_g_4877.json`); old files refused at the preview with the reason
  (`c22_os2_c10.json`); a run 21 file loads (`c22_os2_c21.json`).
- **What AoC does better:** painting a scenario is quicker (text). **Fix:** none new.

### Stats and history: 7 (unchanged)

- Export names both nations (`c22_dl_7019.csv`); ticker groups repeats; air list names wings and bases. History
  3,652 events in 116 ms (`c22_hi_7019.json`). These were defects; fixing them returns the score to parity, it does not
  pass it.
- **What AoC does better:** nothing measured here. **Fix:** none new.

### UI/UX and polish: 7 (unchanged)

- **Better (verified):** the phone bar whole; war from the map on touch; enemy clicks open the enemy (4441: 0 German
  panels of 12, was 3); the played nation in the title bar opens its panel; diplomacy lists start empty; Settings has
  "Unit look" (`c22cb_7019_settings.png`).
- **Worse or new (verified):** own counters in mixed stacks are harder to select (4441 7 of 12, was 12; 3917's knot 1 of
  12) — the user's rule, so a design objection, but the player feels it; the phone bar now covers 24 % of the screen at
  day 60 (was 18 %); a player's own new war hidden behind "+1" on the phone; Breakthrough's refusal unseen from the bar.
- **Why not 8:** the gains are fixes of defects; AoC's UI has none of these costs.
- **Fix:** a second click on a stack cycles it; the player's own war first among the phone's banners.

### Performance: 7 (unchanged)

- Balls cost nothing measured (`c22_pf_7019.json`, three alternating pairs at five zooms). The page at Max: 60 fps at
  world zoom for 10 years (`c22_lw_8243.json`); 41–45 fps at 120–30 m/px on a year-20 world with the sim at Max (both
  looks). Headless mean tick 2.5–2.9 ms on HEAD vs 2.9–3.4 ms on run 21's commit for the same seeds — unpinned, three
  at once, a trend only (`c22_headless_*.json`, `c21_headless_*.json`).
- **What AoC does better:** nothing measured. **Fix:** none.

### Stability: 7 (unchanged)

- No page error in any probe (`errors: []` in every `c22_*.json`). Saves: run 21's continues; old ones refused with a
  reason. The puppet on both sides is a state inconsistency, not a crash.
- **What AoC does better:** no inconsistent war sides seen in its footage (text only). **Fix:** non-blocking 1.

### Semantic zoom to unit level: 8 (unchanged)

- The zoom series is identical to run 21's (`c22_z_5861.json`). At T3 the balls show one ball an element, not the
  figures (ADR-777, the user's choice): still readable unit by unit with props and losses (`c22hu_7019_d12_8m_crops.png`).
  The helmet defect is scored under map visuals, not twice.
- **What AoC does better:** nothing at this level (AoC has none). **Fix:** R22-B1 for infantry balls.

### Naval warfare: 8 (unchanged)

- Ships as balls on hulls are readable (`c22sb_7019_250m_pair.png`); fleet "To its fight" as before (`c22_fp2_4877.json`).
  Sea battles per run: 203 → 252, 223 → 247, 183 → 180 on the three seeds.
- **What AoC does better:** nothing here. **Fix:** none new.

### Tanks: 8 (unchanged)

- Armour balls keep the whole flag (no helmet) and wear treads and a barrel; the German tricolour is plain at 25 and 5
  m/px (`c22cb_7019_arm_0025m_balls_crop.png`).
- **What AoC does better:** nothing here. **Fix:** none new.

### Aircraft: 8 (unchanged)

- Planes as winged balls; at T0–T2 they read as a swarm of units rather than aircraft (`c22cb_7019_arm_6000m_balls_crop.png`,
  `c22cb_7019_arm_0120m_balls.png`; Classic's silhouettes in `_classic.png`). Air list fixed. Not enough to move the score.
- **What AoC does better:** nothing here. **Fix:** a wing silhouette for planes in flight at T0–T2 in the ball look.

### AI nuclear use: 8 (unchanged)

- Bursts per run: 11 → 49 (1213), 49 → 13 (3301), 15 → 10 (7019): still used, a different world. God nukes as before.
- **What AoC does better:** nothing here. **Fix:** none new.

## Blocking issues, in priority order

1. **R22-B1: the infantry helmet hides the flag that names the ball; Germany, Austria and Poland read alike at T1–T3.**
   The default look draws a T1 infantry marker and every T2/T3 infantry ball as a flag ball with a helmet over
   uv.y < 0.3 of the flag. For horizontal tricolours that is the identifying stripe: German infantry (black-white-red)
   and Austrian (red-white-red) show white over red, like Poland. Classic's marker box was filled with the nation's map
   colour and told sides apart; the balls' box is dark. On the first war of the default scenario, at the zoom where a
   front is read, the sides are told apart only by scarlet against crimson.
   Evidence: `critic/shots/c22cb_7019_arm_1200m_balls_crop.png`, `critic/shots/c22cb_7019_arm_0600m_balls.png` vs
   `_classic.png`, `critic/shots/c22g_4877_01_after_places.png`, `critic/shots/c22cb2_7019_GER_POL_10_0_annot.png`,
   `critic/shots/c22cb2_helmet_pair_GER_left_POL_right.png`, `critic/c22_cb2_7019_GER_POL_10_pixels.json`,
   `critic/c22_cb3_census.json`.
   Fix: map the flag onto the part of the disc the helmet leaves (squash it below the brim), or draw the helmet as a
   thin cap, or give every ball (or every T1 box) a rim or fill in the nation's map colour as Classic's box had; then
   test with a pixel check that German and Polish infantry balls differ.

## Non-blocking issues

1. **A freed puppet fights on both sides:** Albania, after Force war on Italy, stays Italy's co-belligerent against Japan
   for 7+ days (`c22_fw2_2207.json`). Fix: a broken puppet bond takes the puppet out of the overlord's wars.
2. **Breakthrough's refusal is shown only in God's tab** (`c22k2_overview.png`). Fix: show it by the bar, or as a ticker row.
3. **The cost of ADR-773 (the user's rule, not a defect; see Design objections):** own counters in mixed stacks are
   hard to select (4441: 7 of 12; 3917: 1 of 12; `c22_sx_4441.json`, `c22_sxg_3917_ITA.json`).
4. **A level-3 hurt ball may be confused with a dead one:** its two crossed plasters sit on the cheeks under the eyes
   and read as an ✕ at a glance (`c22hu_7019_d12_8m_crops.png`; a dead ball was not shot beside it).
5. **Planes are the most visible balls at T0–T2** and read as units (`c22cb_7019_arm_0250m_balls_crop.png`).
6. **On a phone the player's own new war is behind "+1"** (`c22td_03_war.png`); the bar now covers 24 % of the screen at
   day 60 (`c22_ph.json`).
7. **"Propose alliance" offered to a nation at war with you** (`c22_fw_2207.json`, Italy's menu after the war).
8. **Unchanged:** land "To its fight" off its own formation (ADR-775), the editor fleets' long wait (`c22_g_4877.json`).

## Design objections (none blocking, no score lowered)

- **What is drawn wins (ADR-773):** right for reading the enemy; but in a knot such as Vienna–Bratislava (3917) the
  player cannot click its own division at T1 (1 of 12). A second click that cycles would keep both.
- **One ball an element at T3 (ADR-777):** T3 loses the 64 figures of a battalion and the ranks in contact (ADR-80,
  ADR-496); a ball cracks instead. The close tier now shows less than it did; that was a differentiator's strength.
- **The wing mark on its hourly point (ADR-771):** unchanged, 250 m/px median 68 px off the planes (`c22_w_5557.json`).
- Run 21's other objections stand (saves out of git; follow by hourly stats; gunmetal plates).

## Notes

- **Not re-run as before:** EX2's observing arm still dies on `release-control` (now in the right-click menu,
  PLAN 7.177); the observer's click rests on the diff. The editor probe ends on its 15-minute wait as in run 21.
- The CB frame rate at 3000 m/px (52 vs 60 fps) was taken under contention and is superseded by PF.
- Preview servers on 5298 and 5299 and every browser were stopped at the end.

## Strengths, verified

- **The countryballs cost nothing and look good close in:** no frame-rate difference at five zooms
  (`c22_pf_7019.json`); at 5–25 m/px the armour, treads, eyes and losses are a real step past AoC's look
  (`c22cb_7019_arm_0005m_balls.png`, `c22hu_7019_d12_8m_crops.png`).
- **Run 21's list was worked through:** most of its non-blocking items are gone (phone bar, air rows, diplomacy select, ticker repeats, export, God revolt, old files, touch war, enemy clicks), each seen gone on the same case.
