# Critic report, run 25

- **Commit:** `e438647868ff15f829d3f4e5f92570e1b27471b3` (HEAD at the start, `critic/c25_commit.txt`). Run 24 was on
  `82d428c1`; 5 commits since. What changed for a player: **random diplomacy ends the scenario's wars as a white peace**
  (PLAN 7.187, R24-B1); **in `declareWar` a pledge binds as a bond, a pledge between the sides lapses, and an attacker that
  stood beside a defender in an older war leaves that war** (PLAN 7.188, ADR-797); **no "Propose alliance" to an enemy**
  in the nation menu (greyed in the Actions tab). ADR-798 lowered a test floor (no sim change). **The default sim
  changed** (seed 99's pin moved): seed 7019's 20 yearly hashes differ from run 24's on all 20 years
  (`critic/c25_dyn.json`).
- **Date:** 2026-11-02.
- **Build:** `vite build --outDir critic/c25_dist`, exit 0 (`critic/c25_build.log`), served by `vite preview` on
  127.0.0.1:**5297**; run 24's build (`critic/c24_dist`, `82d428c1`) on **5296** for before/after. Ports 5298/5299 were
  taken: **run 24's own preview servers were still listening** (started 09:03 today, serving `c23_dist` and `c24_dist`),
  though run 24's report says they were stopped. I did not start them and left them alone. Run 24's commit was also
  checked out in a worktree (`critic/wt`) for the headless before/after runs, and removed at the end. Chromium through
  Playwright, headless, 1600 × 900 (1400 × 800 for the menu probes); 390 × 844 touch for the phone probes.
- **Runs:** run 24's page suites and misc probes re-run on HEAD (`c25_suite1.sh`, `c25_suite2.sh`, `c25_clicks.sh`,
  `c25_misc.sh`, `c25_new.sh`); DP/OCC/DR/GU/SOVCZS (R24-B1 and non-blocking 9) on HEAD; FW/FW2 (non-blocking 1 and 6).
  New: LEAVE (the new leave rule in AI play, 5 seeds × 2 years, both commits), COBEL/EXIT (the rule reached by a
  declaration, headless, both commits), ES/ES2 (the same from the player's menu, both builds), a 10-year page watch on a
  new seed with random diplomacy (4402), two new seeds × 30 years headless (2531, 8467), PF alone at the end.
- Every path below was made in this run (`c25`) unless it names `c24`. Scripts are in `critic/scripts/c25_*`.
  The re-run comparison of every probe JSON is `critic/c25_cmp.txt`.

## Verdict

**Run 24's blocking issue and the three diplomacy defects behind its score are fixed, and the fix for one of them opened
a worse hole.** PLAN 7.188 makes "an attacker that stood beside a defender in an older war" leave that older war at once,
with every occupied cell going back both ways, no peace signed, no truce, and no line in the ticker or the history. The
AI never triggers it (0 times in 5 seeds × 2 years, `critic/c25_leave_head_*.json`), but **the player does, with one
click**: a nation whose peace offer is refused ("They refuse: lead the war score by 25 (now +1)…") declares war on its
own partner in that war and is out of the war it could not leave, every hatch gone; and it can declare on the old enemy
again the same hour with the slate wiped. Shown in the page on 3 of 3 seeds on HEAD, on 0 of 1 on run 24's build, and
headless on 3 of 3 seeds on HEAD against 0 of 3 on run 24's commit (`critic/c25_exit_*`). SPEC's peace is refusable
(§ Actions tab: "peace is accepted when the offering side leads by ≥ 25 or the other side's exhaustion is > 40"); this
makes the refusal a speed bump. **R25-B1, blocking.** Diplomacy stays at 6, now for R25-B1 instead of R24-B1.

## Scores

| Dimension | Run 24 | Run 25 |
|---|---|---|
| Map visuals and readability | 7 | 7 |
| Diplomacy, war, alliance, puppet, revolt depth | 6 | 6 |
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

**No score moves.** Diplomacy would have gone back to 7 on the fixes (R24-B1: 0 cells held at peace on 5 seeds, to day
1,080 on 8821; non-blocking 9: no guarantor at war with its own on 5 of 5 seeds; non-blocking 1 and 6 fixed in the page),
but R25-B1, new in the same commit, holds it at 6.

## Run 24's cases re-run

| Run 24 case | On HEAD | Evidence |
|---|---|---|
| **R24-B1: random diplomacy leaves Japan occupying 1,345 Chinese cells at peace** (DP 3739/8821/1517 + new 4402/5113; OCC 8821; DR 8821 in the page) | **Fixed.** Cells held at peace 0 at days 0, 1, 30, 90, 180 on 5 of 5 seeds (run 24: 1,345 on 3 of 3); 0 every 90 days to day 1,080 on 8821 (run 24: 1,345 to day 900). Day 1 in the page: no hatching round Peiping, Tientsin or Shanghai. What is left: Japan's 19 formations stand in China at peace on days 0–1 and 8 still on day 30 (0 by day 90) while they walk home; the Japanese 60.9k / 40.6k counters are visible deep in China on the day-1 shot (non-blocking 2). | `critic/c25_dp.json`, `critic/c25_occ_8821.log`, `critic/shots/c25dr_rnd_8821_d1_china.png`, `critic/c25_dr_rnd_8821.json` |
| **Non-blocking 9: the Soviet Union at war with the nation it guarantees** (SOVCZS, GU 3739) | **Fixed.** No SOV–CZS war to day 60 on 5 of 5 seeds (run 24: 3 of 3); in the page Czechoslovakia's panel no longer lists the Soviet Union ("AT WAR WITH: Bulgaria"; run 24: Bulgaria, Soviet Union, Xinjiang, Mongolia, Tannu Tuva). DP's guarantor check is empty at every sample. The Soviet war on Romania still opens 3 of 5 games (days 4, 11, 25). | `critic/c25_sovczs.log`, `critic/c25_gu_3739.json`, `critic/shots/c25gu_3739_czs.png`, `critic/c25_leave_head_*.json` (`decl`) |
| **Non-blocking 1: a freed puppet fights on both sides** (FW2 2207) | **Fixed.** Albania, freed by its war on Italy, is in one war (against Italy, Germany, Poland); run 24: also on Italy's side against Japan. | `critic/c25_fw2_2207.json` against `critic/c24_fw2_2207.json` |
| **Non-blocking 6: "Propose alliance" offered to an enemy** (FW 2207) | **Fixed.** Italy's menu at war: "At war / Offer peace / Take control". | `critic/c25_fw_2207.json`, `critic/shots/c25fw_2207_A_ita_menu.png` |
| CB, CB2 (helmets at 10 m/px), PL (planes), FO (follow), HS (hero over its stack) | **Identical** JSON to run 24. | `critic/c25_cb_7019.json`, `critic/c25_cb2_7019_GER_POL_10.json`, `critic/c25_pl_6011.json`, `critic/c25_fo_7019.json`, `critic/c25_hs_3739.json` |
| Non-blocking 2–5, 7, 8 (refusal in God's tab, own counters in mixed stacks, level-3 plasters, phone "+1", "To its fight", hero markers) | **Unchanged** (K, K2, K3, SX, SXG 3917 / 6827, SXT, HU, TD, PH, P, HS identical). | `critic/c25_k2_2203.json`, `critic/c25_sxg_3917_ITA.json`, `critic/c25_hu_7019_d12.json`, `critic/c25_td_3391.json` |
| God tools, nukes, zoom, fights, fleets, editor, UI, widths, touch, tags, old files | Q, K, FT, FP2, U, P, P2, P3, PH, TG, OS, OS2 identical; A, Z, C, SB, W, WW, G, HV, PT differ only in live counts (sorties, elements within 30, a camera 0.01 off, hero rows, a title-image hash) of a changed sim; no page error in any probe. | `critic/c25_cmp.txt` |
| History (7019 y20), export | Same function on a different history (the sim changed): 3,596 events (run 24: 3,652), all exported as CSV and JSON. | `critic/c25_hi_7019.json`, `critic/c25_dl_7019.json` |
| World dynamics, 7019 × 20 | 0 of 20 hashes equal (expected: the pin moved). Same shape: 96 → 79 nations living (run 24: 96 → 88), 173 war-years (135), 13 bursts (10), 216 sea battles (180); the Soviet Union, the US and Canada on top. One seed: reported, no score moves. | `critic/c25_dyn.json` |
| PF: frame rate by look (7019 y20, Max), alone | Same as run 24 within its own spread: 60 fps at 3000/1200/600 m/px both looks; 120 m/px 41.2 / 39.2, 30 m/px 45.3 / 47.9 (balls / Classic; run 24: 41.1 / 42.6, 44.7 / 41.7), over a busier fight (12 engaged formations, run 24: 4). The first PF read 0 fps because a Soviet bomb on day 16 of the save paused the game (the nuke pause, as designed; `critic/c25_pfchk_7019.json`, `critic/shots/c25pfchk_7019_y20.png`); re-run with the pause off. First run kept as `critic/c25_pf_nukepaused.log`. | `critic/c25_pf.log` |

## New in this run

| Case | What happened | Evidence |
|---|---|---|
| **LEAVE: PLAN 7.188's leave rule in AI play, 5 seeds × 730 days** | Pairs that stopped being at war in an hour with a declaration, filtered to a member on the new war's attacking side that stood beside one of its defenders: **0 on 5 of 5 seeds** (209 declarations). The AI never reaches the rule; only declarations the AI does not make (the player's, God's) do. | `critic/c25_leave_head_*.json`, `critic/scripts/c25_leave_summ.py` |
| **COBEL: Germany, losing to Poland, force-declares on its ally Italy (forceWar), headless, both commits** | HEAD: an hour later Germany is at peace with Poland; Germany's 133 Polish cells and Poland's 250 German cells all back to their owners; Italy fights on against Poland. Run 24's commit: Germany at war with both, the hold unchanged (133 → 111 after 30 more days). The only event: "WarDeclared GER ITA". | `critic/c25_cobel_head_GER_ITA_POL.json`, `critic/c25_cobel_c24_GER_ITA_POL.json` |
| **ES: the same from the player's right-click menu (playing Germany), both builds** | HEAD: "Force war" on Italy; the hatching on both sides of the German–Polish border is gone in the next shot; the banner goes from "Germany +5 ⚔ Poland +9" to "Italy +4 ⚔ Poland +9"; Poland's menu reads "Neutral / Declare war"; the ticker says "Germany broke its alliance with Italy", "Germany declared war on Italy", nothing about Poland. Run 24's build: Germany at war with Poland and Italy, Poland's menu "At war / Offer peace". | `critic/shots/c25es_head_7019_d61_before.png`, `critic/shots/c25es_head_7019_d61_after.png`, `critic/c25_es_head_7019.json`, `critic/c25_es_c24_7019.json` |
| **ES2: the losing side's exit, playing Poland, 3 seeds; run 24's build on one** | Day 10 of Germany's war, Poland's "Offer peace" is greyed: "They refuse: lead the war score by 25 (now +1), or wear them out (war weariness 3 of 40)". Poland declares war on France (its partner in that war, standing "Neutral"); 2 h later Germany is "Neutral" and Poland at war with France. Poland then declares on Germany again: accepted the same hour (no truce). **3 of 3 seeds on HEAD; on run 24's build Poland stays at war with Germany and the peace stays refused.** | `critic/c25_es2_head_{7019,2531,8467}_d10.json`, `critic/c25_es2_c24_7019_d10.json`, `critic/shots/c25es2_head_7019_germenu_refused.png`, `critic/shots/c25es2_head_7019_germenu_after.png`, `critic/shots/c25es2_c24_7019_d10_germenu_after.png` |
| **EXIT: ES2 headless at day 45, 3 seeds, both commits** | HEAD: Poland at war with Germany → not, in one hour, on 3 of 3; held cells 377 + 60 (7019), 249 + 39 (2531), 342 + 42 (8467) → 0; the new declaration on Germany accepted, the slate clean. `82d428c1`: 0 of 3; the war and the hold unchanged. | `critic/c25_exit_head_*.json`, `critic/c25_exit_c24_*.json` |
| **New seeds 2531 and 8467 × 30 years (new seeds, not compared)** | 2531: 93 → 79 nations, 5–10 wars a year, 35 bursts by the Soviet Union, the US, Japan, France and the UK; the US 24.1 %, Japan 16.1 % at y30. 8467: 99 → 85 nations, 4–10 wars, 13 bursts (France, the US, Belgium, the Soviet Union); the US 21.9 %. 200 and 237 sea battles. Mean tick 3.5 / 3.3 ms (three runs at once, unpinned), longest 268 / 545 ms. | `critic/c25_headless_2531.json`, `critic/c25_headless_8467.json` |
| **LW: 10 years in the page with random diplomacy (4402)** | 1938 → 16 January 1948: 28–35 s a simulated year at Max, 59.9–60 fps every year, longest frame gap 83 ms, no gap over 500 ms, no page error; 100 → 81 nations; six wars on the banner at the end (UK–Soviet Union, Japan on the Philippines, the Soviet Union and Tibet). By 1948 the UK, the US and Japan each hold about 16–17 M km². | `critic/c25_lwrnd_4402.json`, `critic/shots/c25lwrnd_4402_y10_world.png` |

## Dimensions

### Map visuals and readability: 7 (unchanged)
- **Tested:** CB, CB2, PL, HV, HS, Z, C re-run; DR and ES shots. **Evidence:** `c25_cb_7019.json` (identical), `c25es_head_7019_d61_before.png`.
- **What AoC does better:** counters in the nation's colour (as before). **Fix:** run 24's non-blocking 8 (hero T1 marker) stands.

### Diplomacy, war, alliance, puppet, revolt depth: 6 (unchanged; R24-B1 fixed, R25-B1 new)
- **Tested:** DP on 5 seeds, OCC to day 1,080, DR in the page, SOVCZS on 5 seeds, GU, FW, FW2, LEAVE (5 seeds × 2 years), COBEL and EXIT (both commits), ES and ES2 (both builds).
- **Evidence:** `c25_dp.json`, `c25_occ_8821.log`, `c25_fw2_2207.json`, `c25_exit_head_7019.json`, `c25es2_head_7019_germenu_after.png`.
- **What AoC does better:** (text only, lower confidence) a war there ends by peace or annexation; there is no unilateral exit.
- **Fix:** R25-B1; non-blocking 1 and 9. The four run-24 defects are fixed and verified.

### Emergent world dynamics over long runs: 7 (unchanged)
- 7019 × 20 on the new rules keeps the same shape (`c25_dyn.json`); two new seeds × 30 years are busy and global, with nuclear use by four or five nations each; LW 4402 with random diplomacy. The AI never reaches the new leave rule (LEAVE: 0), so R25-B1 does not touch the AI world.

### God Mode: 7 (unchanged)
- Q, A, K, K2, K3 as before. God's Force war is one of the two doors into R25-B1 (COBEL); it is scored under Diplomacy.

### Editor and scenarios: 7 (unchanged)
- G (editor fleets, the land refusal) as before but live counts; old files and the format-1 save as before (`c25_os2_c10.json` identical).

### Stats and history: 7 (unchanged)
- History and export work on the new history (`c25_hi_7019.json`, `c25_dl_7019.json`). A war left under R25-B1 gets no row (non-blocking 1); scored with R25-B1 under Diplomacy.

### UI/UX and polish: 7 (unchanged)
- The nation menu at war now offers only "Offer peace" (FW, fixed). Unchanged costs: phone "+1", mixed stacks, a hero over its stack.

### Performance: 7 (unchanged)
- PF alone equals run 24 within its spread (60 fps at 3000–600 m/px, 39–48 at 120 and 30 m/px over a 12-formation fight); LW 4402 at 59.9–60 fps for ten years, longest gap 83 ms; mean headless tick 3.2–3.5 ms (three runs at once, unpinned). **What AoC does better:** nothing measured here. The 120 m/px reading under a big fight stays under 60 (as before).

### Stability: 7 (unchanged)
- No page error in any probe; no crash in 5 headless runs of 2 years, 3 of 20–30 years and 12 short case runs.

### Semantic zoom to unit level: 8 (unchanged)
- Z within 30 elements of run 24 at every step (`c25_z_5861.json`); CB and CB2 identical; C's views of one battle as before.

### Naval warfare: 8 (unchanged)
- SB as before; 200–237 sea battles in 30 years on the new seeds. ADR-798's fleet floor (design objection) is a test bar, not something a player sees.

### Tanks: 8 (unchanged)
- Armour unchanged (C, FT, FP2 identical or live counts only).

### Aircraft: 8 (unchanged)
- PL identical; W and C differ only in sortie counts of a changed sim.

### AI nuclear use: 8 (unchanged)
- New seeds: the bomb used by five nations on 2531 and four on 8467 (`c25_headless_*.json`); God's nuke as before (`c25_a_4219.json`).

## Blocking issues, in priority order

1. **R25-B1: a refused peace is escaped in one click: declaring war on one's partner in a war ends that war at once,
   all occupation undone, no peace, no truce, no log line.**
   Evidence: `critic/c25_es2_head_7019_d10.json` (Poland, peace refused "lead the war score by 25 (now +1)", declares on
   France; Germany "Neutral" an hour later, then at war again by Poland's own declaration), `critic/shots/c25es2_head_7019_germenu_refused.png`
   (greyed "Offer peace"), `critic/shots/c25es2_head_7019_germenu_after.png` (Germany "Neutral", hatching gone, banner
   "Germany +5 ⚔ France +8"; ticker says only "Poland declared war on France"); the same on run 24's build leaves Poland at
   war with Germany and the offer still refused (`critic/c25_es2_c24_7019_d10.json`,
   `critic/shots/c25es2_c24_7019_d10_germenu_after.png`); headless 3 of 3 seeds on HEAD, 0 of 3 on `82d428c1`
   (`critic/c25_exit_head_{7019,2531,8467}.json`, `critic/c25_exit_c24_*.json`: 377 + 60 held cells to 0 in an hour on
   7019); the attacker's side: Germany, losing to Poland (250 German cells held against 133), force-declares on its ally
   Italy and leaves the Polish war with all 383 cells reverted (`critic/c25_cobel_head_GER_ITA_POL.json` against
   `critic/c25_cobel_c24_GER_ITA_POL.json`; page `critic/shots/c25es_head_7019_d61_before.png` /
   `..._d61_after.png`).
   When it bites: while the enemy refuses peace (from day 10 in ES2; by days 100–130 on 2531 and 8467 the offer was
   accepted and the war ended in a truce, `critic/c25_es2_head_{2531,8467}_d90.json`), and at any time for a side that is
   losing (COBEL, ES).
   Fix: a nation must not leave a war by declaring a new one. When an attacker would stand against a nation it fights
   beside, refuse the declaration (or keep it out of the new war) rather than pull it out of the old one; if it must leave,
   leave only as a peace would (the enemy's acceptance, a truce, the log row "X left the war with Y").

## Non-blocking issues

1. **A war left under R25-B1 leaves no trace:** no ticker row, no history row, no peace and no truce; the war banner just
   swaps its leader ("Germany +5 ⚔ Poland +9" → "Italy +4 ⚔ Poland +9") and Poland's panel drops Germany
   (`c25es_head_7019_d61_after.png`, `c25_es_head_7019.json`). Even where a leave is wanted, the player has to be told.
2. **After random diplomacy's white peace, Japan's armies stand in China at peace for weeks:** 19 formations on days 0–1,
   8 on day 30, 0 by day 90, on 5 of 5 seeds (`c25_dp.json`, `guestsAtPeace`; visible on `c25dr_rnd_8821_d1_china.png`).
   It is the ordinary walk home after a peace, but here the game opens with it. Fix: start them at home.
3. **Breakthrough's refusal shown only in God's tab** (unchanged; `c25_k2_2203.json`).
4. **Own counters in mixed stacks** (unchanged; `c25_sxg_3917_ITA.json`: 1 of 12).
5. **Level-3 plasters read as ✕** (unchanged; `c25_hu_7019_d12.json`).
6. **The player's own war behind "+1" on the phone; bar 24 %** (unchanged; `c25_td_3391.json`).
7. **Unchanged:** land "To its fight" off its formation (ADR-775).
8. **Hero markers at T1** (unchanged; `c25_hs_3739.json`).
9. **Guarantees are still shown nowhere,** so neither "a pledge binds" nor a pledge that lapses when a guarantor
   declares on its own (ADR-797) is visible to the player (the GU panels list allies, puppets and wars only:
   `c25_gu_3739.json`).

## Design objections (none blocking, no score lowered)

- **ADR-798 lowered the ten-year runs' fleet floor (25 → ceil(start / 10) = 20)** to pass the review's red after PLAN
  7.188 (seed 1 stood 24). It is the user's decision, but it is a test bar lowered to fit the result. Recorded here; no
  score moved.
- **Run 24's objections stand** (the heroes' AI, a hero covering its neighbours, hero labels at world zoom, the drawn
  diplomacy's shapes; ADR-773, ADR-777, ADR-782, ADR-783, ADR-771).

## Notes

- **Run 24's preview servers were left running** (5298: `c23_dist`, 5299: `c24_dist`, both started 09:03), although
  its report says they were stopped. This run used 5296/5297 and stopped both at the end. It did not start the two old
  servers and did not stop them; at the end 5299 (`c24_dist`) was still listening and 5298 was not.
- The worktree `critic/wt` (`82d428c1`) had its `node_modules` junction removed before `git worktree remove`.
- One probe file (`c25_es_head_7019.json`) was overwritten mid-run by ES2's first version. It was made again by
  re-running ES on the same seed (deterministic; the same three steps).

## Strengths, verified

- **The diplomacy fixes are real and narrow:** R24-B1's occupation is gone on 5 seeds × 180 days and to day 1,080; the
  guarantor, freed-puppet and alliance-menu defects are gone in the page; 26 re-run probes return byte-identical results (`c25_cmp.txt`).
- **Clean in the browser:** no page error in any probe, including the 10-year page watch.
