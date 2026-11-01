# Critic report, run 23

- **Commit:** `81beca11c0155229b44b5fa6b4c3615ce618acb9` (HEAD at the start, `critic/c23_commit.txt`). Run 22 was on
  `4a977fdb`; 3 commits since. What changed for a player: **the flag is drawn whole below the infantry helmet's brim**
  (PLAN 7.179, ADR-782, against R22-B1) in the shader (T2/T3) and on the 2D overlay (T0 counters, T1 markers); **planes
  in the ball look are their silhouette in the nation's colour with a small flag ball on it** (PLAN 7.180, ADR-783, the
  user's choice). Only `src/render/units/{ballShader,ball2d,sorties}.ts` and a comment in `MapView.ts` changed in
  `src/`. **The sim did not change:** seed 7019's 20 yearly state hashes on HEAD equal run 22's, 20 of 20
  (`critic/c23_headless_7019.json` against `critic/c22_headless_7019.json`).
- **Date:** 2026-11-01.
- **Build:** `vite build --outDir critic/c23_dist`, exit 0 (`critic/c23_build.log`), served by `vite preview` on
  127.0.0.1:**5299**; run 22's build (`critic/c22_dist`, `4a977fdb`) on **5298** for before/after on the same moment.
  Both stopped at the end. Chromium through Playwright, headless, 1600 × 900 (900 × 600 for the flag sheet), 390 × 844
  with touch for the phone probes.
- **Runs:** run 22's three page suites re-run on HEAD (`c23_suite1.sh`, `c23_suite2.sh`, `c23_clicks.sh`) and its
  new probes (`c23_misc.sh`: FW, FW2, K2, K3, TD, HU, SB, OS2); CB and CB2 (the helmet case) on the same frozen moment;
  new: PL (planes, HEAD against run 22's build, same moment), FL (24 nations' helmeted infantry), PF alone after every
  other job, a 10-year page watch of a new seed (2468), and two new seeds × 30 years headless (2468, 5113).
- **Reference:** `reference/screens/`, `reference/text/AOC_TEXT_NOTES.md`. AoC has no unit sprites at this level; what
  I say of AoC's units is from text and the trailer frames only.
- Every path below was made in this run (`c23`) unless it names `c22`. Scripts are in `critic/scripts/c23_*`.

## Verdict

**R22-B1 is fixed, on the same case, and seen fixed at every tier.** On the same frozen moment of seed 7019 (Germany v
Poland, day 1 for CB2 and day 4 for CB, same formations picked on both builds), German infantry now carry the whole
black-white-red under the helmet and Polish the white-red: at 10 m/px the dark share of the German disc below the brim
went 0.071 → **0.354** while Poland's stayed 0.047 → 0.030 (`critic/c23_cb2_7019_GER_POL_10_pixels.json` against
`critic/c22_cb2_7019_GER_POL_10_pixels.json`); at 1200 and 600 m/px the T1 markers read as two nations
(`critic/shots/c23cb_7019_arm_1200m_pair_c22left_c23right.png`, `..._0600m_pair_...`). Austria (red-white-red),
Yugoslavia, Latvia, Estonia and Hungary all keep their identifying stripe under the helmet (`critic/shots/c23fl_sheet_10m.png`).
The planes no longer read as a swarm of units: at 250 m/px they are blue French silhouettes with a roundel-like ball,
the same planes as run 22's winged balls (`critic/shots/c23pl_250m_crop_5299_balls.png` vs
`critic/shots/c23pl_250m_crop_5298_balls.png`). Nothing else moved: every other re-run probe on HEAD returned the same
result as run 22, most byte for byte. No new blocking issue. Map visuals return to 7; nothing passes parity that did
not before.

## Scores

| Dimension | Run 22 | Run 23 |
|---|---|---|
| Map visuals and readability | 6 | **7** |
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

**Map visuals 6 → 7:** the one defect that took it down, the helmet hiding the stripe that names the ball, is gone on
the same case (above), and the planes at T2 are aircraft again. It returns to parity, not past it: AoC's counters in the
nation's own colour still cannot be mistaken at a glance, and at T1 the balls' boxes are dark where Classic's carried
the map colour (a helmeted Polish ball and a helmeted Austrian ball are still white-red and red-white-red on the same
dark box; told apart by the stripe order only, `critic/shots/c23fl_sheet_10m.png`).

## Run 22's cases re-run

| Run 22 case | On HEAD | Evidence |
|---|---|---|
| **R22-B1, CB2: helmeted balls at 10 m/px (7019, GER v POL, day 1, formation 15)** | **Fixed.** Same moment (36 elements on screen on both). German helmeted balls: dark share below the brim 0.071 → **0.354** (max 0.47), 14 clear balls; Polish 0.047 → 0.030, 8 balls. German reads black-white-red, Polish white-red, and the unhelmeted German guns keep the whole flag. | `critic/c23_cb2_7019_GER_POL_10.json`, `critic/c23_cb2_7019_GER_POL_10_pixels.json`, `critic/shots/c23cb2_7019_GER_POL_10_0.png`, `critic/shots/c23cb2_7019_artillery_crop.png`, `critic/shots/c23cb2_7019_polish_crop.png` |
| **R22-B1, CB: the same moment at ten zooms, both looks (day 4, armour 40, infantry 11)** | **Fixed at T1:** at 1200 and 600 m/px German helmeted markers show the black band under the brim; Polish do not. Classic unchanged. T0 counters at 3000 m/px keep the whole German flag (as before). At 25 m/px the German infantry read black-topped among Polish white-topped. | `critic/c23_cb_7019.json`, `critic/shots/c23cb_7019_arm_1200m_pair_c22left_c23right.png`, `critic/shots/c23cb_7019_arm_0600m_pair_c22left_c23right.png`, `critic/shots/c23cb_7019_arm_0025m_balls.png`, `critic/shots/c23pl_3000m_germany_zoom.png` |
| CB3: start flags alike under the helmet (Germany–Austria, Germany–Yugoslavia …) | **Moot:** the whole flag is now drawn (squashed to the disc below the brim), so a helmeted pair is as alike as the full flags. Seen on 17 nations' infantry at 10 m/px: every one keeps its stripes or emblem (Turkey's crescent, Portugal's arms, Greece's cross and stripes). | `critic/c23fl.json`, `critic/shots/c23fl_sheet_10m.png`, `critic/shots/c23fl_*_1200m.png` |
| **Non-blocking 5: planes the most visible balls at T0–T2** | **Fixed.** Same moment on both builds (seed 7019, hour 2, the same 7 sortie marks at 250 m/px): run 22's French planes were tricolour balls with grey wings, larger than the infantry stacks under the tags; HEAD's are blue silhouettes with a ball a few px across. At 600 and 1200 m/px German planes are light silhouettes with a small ball; at 3000 m/px they read as aircraft round Berlin. | `critic/c23pl_7019_GER_POL_5299.json`, `critic/c23pl_7019_GER_POL_5298.json`, `critic/shots/c23pl_250m_crop_5299_balls.png`, `critic/shots/c23pl_250m_crop_5298_balls.png`, `critic/shots/c23pl_250m_crop_5299_classic.png`, `critic/shots/c23pl_0600m_crop_5299.png` |
| Non-blocking 1: freed puppet on both sides (FW2, 2207) | **Unchanged** (output identical to run 22's): Albania stays Italy's co-belligerent against Japan after breaking its bond. | `critic/c23_fw2_2207.json` |
| Non-blocking 7: "Propose alliance" to an enemy (FW, 2207) | **Unchanged** (identical). | `critic/c23_fw_2207.json` |
| Non-blocking 2: Breakthrough refusal only in God's tab (K2, K3, K, 2203) | **Unchanged** (all three identical). | `critic/c23_k2_2203.json`, `critic/c23_k3_2203.json`, `critic/c23_k_2203.json` |
| Non-blocking 3: ADR-773 in mixed stacks (SX, SXT, SXG 6827, SXG 3917, EX2 4441) | **Unchanged**, all five identical byte for byte: 3917's knot still 1 of 12 own clicks; EX2 still dies on `release-control` as in run 22. | `critic/c23_sx_4441.json`, `critic/c23_sxt_4441.json`, `critic/c23_sxg_6827_JAP.json`, `critic/c23_sxg_3917_ITA.json`, `critic/c23_ex2_4441.json` |
| Non-blocking 4: level-3 plasters read as ✕ (HU, 7019 d12) | **Unchanged**: same counts (1,007 in view: 723 / 221 / 46 / 17); the two crossed plasters now sit over the squashed flag under the helmet, still an ✕ at a glance. | `critic/c23_hu_7019_d12.json`, `critic/shots/c23hu_7019_d12_8m_balls.png` |
| Non-blocking 6: own war behind "+1" on the phone; bar 24 % (TD, PH, P) | **Unchanged** (identical). | `critic/c23_td_3391.json`, `critic/c23_ph.json`, `critic/c23_p.json` |
| Old files refused at the preview (OS2 c10); run 22's file loads | **Unchanged:** c10 refused with the reason; run 22's scenario file starts in 2.9 s. | `critic/c23_os2_c10.json`, `critic/c23_os2_c22.json` |
| Format-1 save (OS c10fmt1) | Unchanged: refused with "cannot be continued". | `critic/c23_os_c10fmt1.json` |
| Fights, fleets, editor, God tools, nukes, zoom, tags, UI, wing mark, phone widths, touch | Unchanged: FT, FP2, Q, PL, TG, U, P2, P3, PT identical; A, Z, W, SB, G differ only in boot ms, frame counts and live x1 positions (a few px). Editor probe ends on its 15-minute wait as in runs 21–22. | `critic/c23_ft_5381_d21.json`, `critic/c23_fp2_4877.json`, `critic/c23_q_6421.json`, `critic/c23_a_4219.json`, `critic/c23_z_5861.json`, `critic/c23_w_5557.json`, `critic/c23_sb_7019.json`, `critic/c23_g_4877.json`, `critic/c23_u_1600_5557.json` |
| History (7019 y20), export | Same: 3,652 of 3,652 events, 121 ms (was 116); CSV names both nations. | `critic/c23_hi_7019.json`, `critic/c23_dl_7019.csv` |
| PF: frame rate by look (7019 y20 save, Max), run alone | Same shape as run 22: 60 fps at 3000/1200/600 m/px in both looks; 120 m/px 40.6 / 41.8, 30 m/px 44.3 / 41.7 (balls / Classic). Planes' two passes cost nothing measurable. (CB's 52 fps at 3000 m/px was again taken beside three headless sims and is superseded.) | `critic/c23_pf.log`, `critic/c23_cb_7019.json` |
| World dynamics (1213, 3301, 7019) | **Same sim:** 7019's 20 yearly hashes equal run 22's; the other seeds were not re-run (no sim input changed). | `critic/c23_headless_7019.json` |

## New in this run

| Case | What happened | Evidence |
|---|---|---|
| FL: 24 nations' infantry at the 1938 start, 10 and 1200 m/px | 17 found and shot (the other 7: none found by the probe's filter, a title matching "Infantry" with a position). Every flag reads under the helmet; horizontal tricolours (Hungary, Bulgaria, Lithuania, Estonia, Latvia, Austria, Yugoslavia) are told apart by stripe order. Squashing to the lower two-thirds of the disc makes emblems oval; nothing seen lost. On German balls the black stripe now carries the eyes: a "masked" face, white eyes only. | `critic/c23fl.json`, `critic/shots/c23fl_sheet_10m.png` |
| PL: planes, both builds, same moment, seven zooms | Above. At 60 and 25 m/px a plane is still its ~10 px symbol, smaller than an infantry ball (the same on run 22's build). | `critic/shots/c23pl_7019_GER_POL_5299_0060m_balls.png` |
| New seeds 2468 and 5113 × 30 years, headless (new seeds, not compared) | 2468: 85–100 nations living, 4–13 wars a year, 22 bursts (UK 10, Germany 9), 14 interceptions, the United States 27 % of land at y30. 5113: 66 living at y30, the Soviet Union ~31 % throughout, 21 bursts by four nations. Mean tick 3.2 and 2.7 ms (three at once, unpinned). | `critic/c23_headless_2468.json`, `critic/c23_headless_5113.json` |
| LW: page watch of seed 2468, 10 years at Max | 24–39 s a year, 59.9–60 fps, longest frame gap 83 ms, no page error. By 15 Jan 1948 a coalition war on the Soviet Union (the UK +16, Poland +10, Mexico +10, China +2 against it), France has the bomb, Belgium holds Congo and half of Brazil's east; 4–6 wars on the banner row each year. Busy and global, as on run 22's seeds. | `critic/c23_lw_2468.log`, `critic/shots/c23lw_2468_y10_world.png` | `critic/c23_lw_2468.json` |

## Dimensions

### Map visuals and readability: 7 (was 6)

- **Tested:** CB and CB2 on run 22's frozen moment; FL across 17 nations; planes on both builds at the same moment.
- **Evidence:** `c23cb2_7019_GER_POL_10_0.png`, `c23cb_7019_arm_1200m_pair_c22left_c23right.png`,
  `c23cb_7019_arm_0600m_pair_c22left_c23right.png`, `c23fl_sheet_10m.png`, `c23pl_250m_crop_5299_balls.png`.
- **What AoC does better:** its counters are the nation's colour; here a T1 box is dark for every nation, so a
  helmeted Polish ball and a helmeted Austrian one differ only by stripe order on a ball 14–20 px across.
- **Why not 8:** the fix removes a defect; nothing here reads better than AoC's colour blocks at the front.
- **Fix:** none; see Design objections (ADR-782 chose the squash over a map-colour rim).

### Diplomacy, war, alliance, puppet, revolt depth: 7 (unchanged)

- Nothing changed (FW, FW2 identical). The freed puppet on both sides and "Propose alliance" to an enemy stand.
- **What AoC does better:** (text) a nation leaving a bond leaves its wars. **Fix:** non-blocking 1 and 6.

### Emergent world dynamics over long runs: 7 (unchanged)

- The sim is byte-identical to run 22's (7019's hashes). Two new seeds: busy, global, 4–13 wars a year, a new
  leader at y30 on 2468 (the United States), a static Soviet giant on 5113.
- **What AoC does better:** long runs end in a few large empires a watcher can follow. **Fix:** none new.

### God Mode: 7 (unchanged)

- Q, A, K, K2, K3 identical or equal; Breakthrough's refusal still unseen from the bar.
- **What AoC does better:** its tools act or say why wherever clicked. **Fix:** non-blocking 2.

### Editor and scenarios: 7 (unchanged)

- Editor placements and the land refusal as before (`c23_g_4877.json`); old files refused at the preview, run 22's
  file loads (`c23_os2_c10.json`, `c23_os2_c22.json`).
- **What AoC does better:** painting a scenario is quicker (text). **Fix:** none new.

### Stats and history: 7 (unchanged)

- History 3,652 events in 121 ms; export names both sides (`c23_hi_7019.json`, `c23_dl_7019.csv`).
- **What AoC does better:** nothing measured. **Fix:** none new.

### UI/UX and polish: 7 (unchanged)

- All UI probes identical to run 22's (U, P, P2, P3, PH, PT, TD, TG, SX*, EX2). Run 22's costs stand: own counters in
  mixed stacks (3917: 1 of 12), the phone bar's 24 %, the player's war behind "+1".
- **What AoC does better:** none of these costs. **Fix:** a second click that cycles a stack.

### Performance: 7 (unchanged)

- PF run alone: 60 fps at world, T1 and 600 m/px in both looks; 40–44 fps at 120–30 m/px on a year-20 world at Max,
  equal between looks (`c23_pf.log`). Headless ticks 2.7–3.5 ms (unpinned).
- **What AoC does better:** nothing measured. **Fix:** none.

### Stability: 7 (unchanged)

- No page error in any probe (`errors: []` in every `c23_*.json`). Sim deterministic across the two builds.
- **What AoC does better:** no inconsistent war sides seen (text). **Fix:** non-blocking 1.

### Semantic zoom to unit level: 8 (unchanged)

- Zoom series as run 22's (`c23_z_5861.json`, element counts per step within 10 of 4,450). The helmet fix makes T3
  infantry legible as nations (`c23cb2_7019_GER_POL_10_0.png`). One ball an element (ADR-777) stays a design objection.
- **What AoC does better:** nothing at this level. **Fix:** none new.

### Naval warfare: 8 (unchanged)

- SB as before (`c23_sb_7019.json`); sea battles every year on the new seeds (2468: 291 logged, 5113: 240).
- **What AoC does better:** nothing here. **Fix:** none new.

### Tanks: 8 (unchanged)

- Armour balls untouched by the change; whole flag, treads and barrel (`c23hu_7019_d12_8m_balls.png`).
- **What AoC does better:** nothing here. **Fix:** none new.

### Aircraft: 8 (unchanged)

- The planes now read as aircraft at T0–T2 in the default look (`c23pl_250m_crop_5299_balls.png`,
  `c23pl_3000m_germany_zoom.png`); air war as before (1,000–3,000 air battles a year headless).
- **Why not 9:** the change returns the default look to what Classic already showed; the air war itself is unchanged.
- **What AoC does better:** nothing here. **Fix:** none.

### AI nuclear use: 8 (unchanged)

- New seeds: 22 bursts by four nations with 14 interceptions (2468), 21 bursts by four nations (5113)
  (`c23_headless_2468.json`, `c23_headless_5113.json`). God nukes as before (`c23_a_4219.json`).
- **What AoC does better:** nothing here. **Fix:** none new.

## Blocking issues, in priority order

None. R22-B1 is fixed on its own case (above).

## Non-blocking issues

1. **A freed puppet fights on both sides** (unchanged; `c23_fw2_2207.json`). Fix: a broken bond takes it out of the
   overlord's wars.
2. **Breakthrough's refusal shown only in God's tab** (unchanged; `c23_k2_2203.json`). Fix: say it by the bar.
3. **ADR-773's cost in mixed stacks** (unchanged; `c23_sxg_3917_ITA.json`: 1 of 12). See Design objections.
4. **Level-3 plasters read as ✕** (unchanged; `c23hu_7019_d12_8m_balls.png`).
5. **The player's own war behind "+1" on the phone; bar 24 %** (unchanged; `c23_td_3391.json`, `c23_ph.json`).
6. **"Propose alliance" offered to an enemy** (unchanged; `c23_fw_2207.json`).
7. **Unchanged:** land "To its fight" off its formation (ADR-775); the editor fleets' long wait (`c23_g_4877.json`).

## Design objections (none blocking, no score lowered)

- **What is drawn wins (ADR-773):** the player cannot click its own division in a knot (3917: 1 of 12).
- **One ball an element at T3 (ADR-777):** T3 shows less than the 64-figure battalions did.
- **The flag squash over a map-colour rim (ADR-782, option a):** it works, but a helmeted Polish and Austrian ball still differ
  only by stripe order on the same dark T1 box; a rim in the map colour would read at the first glance
  (`c23fl_sheet_10m.png`, `c23cb_7019_arm_1200m_pair_c22left_c23right.png`).
- **A plane is a silhouette with a small ball (ADR-783):** it works; the ball at ~2 px radius at T2 is a colour dot,
  not a readable flag, so a plane's nation is read from the silhouette's colour, as in Classic.
- **The wing mark on its hourly point (ADR-771)** and run 21's other objections stand.

## Notes

- EX2's observer arm still dies on `release-control` (as in run 22); the panel figures rest on SX and SXG.
- Preview servers on 5298 and 5299 and every browser were stopped at the end (`netstat`: no listener left, only TIME_WAIT).

## Strengths, verified

- **A blocking defect fixed in one commit and seen fixed on its own case at every tier**, with the sim untouched
  (20 of 20 hashes): `c23cb2_7019_GER_POL_10_pixels.json` against run 22's, and the 1200/600 m/px pairs.
- **The default look costs nothing:** PF run alone, both looks within noise at five zooms (`c23_pf.log`).
