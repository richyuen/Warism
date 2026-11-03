# Critic report, run 31 (full) — ROADMAP R5b, after R13–R15 and R7

- **Mode: full.** Decided from git before anything else (CRITIC_PROMPT, ADR-804). The second condition of a focused run
  fails: `4c546398` ("ROADMAP R7 (ADR-819): a default says so") changes `src/` (`events.ts`, `history.ts`,
  `revival.ts`, `en.json`), and R7 is not an item that the commit adding run 30's report (`8eb82001`) filed — it filed
  R13–R15; R7 was an older ROADMAP item moved into the batch by `ea76c663`. The other commits since run 30's commit
  `d6e1bb1e` are `8eb82001` (the report), `ea76c663` (ROADMAP only), `fd722487` R13, `8b2757b4` R14, `15acf21e` R15.
  The whole brief applies: every dimension is scored afresh, none carried.
- **Commit judged:** `4c546398c6ff623092ddf07c378ac18cf21ffae5` (HEAD at the start, `critic/c31_commit.txt`).
  **Date:** 2026-11-03.
- **Build:** `vite build --outDir critic/c31_dist`, exit 0 (`critic/c31_build.log`), served by `vite preview` on
  127.0.0.1:**5299**. Chromium through Playwright, headless; desk 1600 × 900, phones 390 × 844 (touch, DPR 2).
- **Baseline:** run 30's own files (`critic/c30_*`, commit `d6e1bb1e`) are the "before" of every re-run case; no
  worktree was needed. With the heroes **off**, every world probe re-run here is identical to run 30 (R15's
  `carryWings` and R7's row change nothing a heroes-off probe reads). With the heroes **on**, R13 and R15 change the
  world by design, so heroes-on counts are compared as aggregates over the same ten seeds.
- **Runs:** run 30's headless queues (`critic/scripts/c31_jobs1.txt`, `c31_jobs2.txt`) plus new seeds
  (`c31_jobs3.txt`, `c31_jobs4.txt`): 110 headless jobs, 7 at a time, every one exit 0 (`critic/c31_jobs.log`,
  `critic/c31_jobs4.log`; jobs4's seven ran twice by a duplicated runner, the outputs are deterministic). Run 30's page
  suites (`c31_heroes_page2.sh`, `c31_heroes_page.sh`, `c31_pagesuites.sh`, `c31_tail2.sh`), then new page probes
  (`c31_extra.sh`, `c31_final.sh`). New scripts: `c31_df_default.mjs` (a default as the player meets it),
  `c31_def.ts` (every default and collapse over 20 years), `c31_basins.ts` (each sea hero's basin and ports),
  `c31_hfsum.py` (fold reachability), `c31_hist2.mjs` (an older build's save in HEAD's History). JSON comparison with
  run 30: `critic/c31_cmp.txt` (153 compared, 113 identical; every difference attributed below).

## Verdict

**R13, R14 and R15 fix what run 30 named, on the critic's own seeds, and R7 works in the page. No blocking issue.
Every score is at its bar; none moves from run 30.** The release is not held by this report.

- **R30-B2 fixed (R13).** No sea hero comes back on the Caspian or a lake: 1,792 returns over the ten heroes seeds
  (run 30: 1,740), none in the Caspian (46–55° E, 36–47.5° N) or on Lake Onega or Ladoga (`critic/c31_seareturns.txt`;
  run 30: Baku, Atyrau, Makhachkala, Petrozavodsk, 11,259 days). The checker's new "in its start's basin" rule is 0 broken
  over 20 years on the four AT seeds (4637, 7603, 4111; 9001 by heroWaits) and on four new seeds. Sovetsky Soyuz now
  fights: 83 engaged days on 4637 against 19 in run 30, lost 33 times instead of sitting 12.8 years in the Caspian.
- **R30-B1 fixed (R14).** At 5521's start view on a phone, by touch, every hero of every counter on screen opens (10 of
  10; run 30: 7 of 10, Hood, TOG II, Char 2C unreachable); closing the panel with × or Escape keeps the fold's round
  (`critic/c31_hft_5521.json`). No fold holds two nations on five views and three seeds (run 30: three such folds).
- **R30-B3 fixed (R15).** The air rules are 0 broken over **20 years** with heroes on 3373 (random diplomacy) and
  5591 (run 30: 2 and 2 in 2 and 10 years), and on 1201, 2417 (random), 6977 and the new random world 5653. The critic's
  own case (`c31_wingbase.ts`, days 575–605 on 3373 random): no wing off its carrier in any hour (run 30: three wings
  left behind at tick 13,955).
- **R7 works.** God sets Poland's treasury to −800 on 7019; on day 151 the History has "1 June 1938 Poland defaulted:
  its debts were voided", kind "Default" in the filter, nothing in the ticker, and a save at that hour reloads to the
  same hash (`critic/c31_df_7019_pol.json`, `critic/shots/c31df_pol_history.png`). The row does not say how much was
  voided, and in 6 seeds × 20 years of AI play no nation ever went below −100 gold, so the row is met only when God
  makes it (`critic/c31_def_*.json`).

What is not fixed or is new (non-blocking): Japan's heroes (and on 7019 at day 730 Sovetsky Soyuz) are still drawn
under the Ranking panel at a desk's start view, so a click opens a ranking row; two nations' hero counters overlap
and cut a name ("Ma" for the Maus under T-42, 4637 in 1953), which ADR-817's "every name reads" claims away; sea
heroes are still lost 7.6–36 times in 20 years; Richelieu now waits 1,638 days on 4637 for "a port on its sea" (as
R13 decides); the relations graph still eats the first tap after a drag.

## Scores

| Dimension | Run 30 | Run 31 | |
|---|---|---|---|
| Map visuals and readability | 7 | 7 | rescored: no fold of two nations; counters kept in the view. Not 8: hero counters cover Europe's tags on a phone, two nations' counters overlap and cut names, Japan's heroes under the Ranking panel |
| Diplomacy, war, alliance, puppet, revolt depth | 7 | 7 | rescored: 10 diploInvariants runs (4 new seeds, one random world) 0 broken; every heroes-off diplomacy probe identical to run 30 (BX, BS ×4, AL, OR ×6, OR2, PR ×2, PZ ×4, EXIT ×3, ES2 ×3, COBEL, BOTH ×5, LOY ×3, DR, PP ×2, PG ×2, GU, TD); run 30's unchanged list (R30-N6) stands |
| Emergent world dynamics over long runs | 7 | 7 | rescored: heroes on vs off, 10 seeds × 20 years, the same picture as run 30 (sea battles +92 %, major land battles −22 %, the rest within noise); heroes-off worlds identical; ten-year page watches read as before |
| God Mode | 7 | 7 | rescored: Q, K, K2, K3 identical, A ticker-only; the treasury tool now leads to a told default (R7) |
| Editor and scenarios | 7 | 7 | rescored: G (timing only), OS2 on run 25's scenario file identical, HSC identical; an older build's save loads on HEAD (below). Not 8: three of the editor probes time out on the same steps since run 29 (probe-side, not counted) |
| Stats and history | 7 | 7 | rescored: a new kind ("Default") that works; HI, DL, HG, HD identical. Not 8: the default row omits the sum; History and charts otherwise unchanged |
| UI/UX and polish | 7 | 7 | rescored: R14 by touch fixed; the graph's first tap after a drag eaten (unchanged); a hero still hides the fleets under it at T1 (unchanged) |
| Performance | 7 | 7 | rescored: six ten-year page watches 59.8–60 fps every year, no gap over 500 ms; alone, 6151's ten years in 283 s with an 83 ms longest gap (run 30: 297 s, 83 ms); headless 4.1–5.8 ms a tick with seven sims at once (run 30: 3.7–5.7) |
| Stability | 7 | 7 | rescored: no page error in any game probe; 110 headless jobs, none crashed; save and load reproduce the hash with a default row and with a hero gone |
| Semantic zoom to unit level (needs 8) | 8 | 8 | rescored: Z (new seed 1201 and 5861), C (2417 new, 7019 identical), TG and PHZ identical; T2/T3 battles read unit by unit at 15–25 m/px |
| Naval warfare (needs 8) | 8 | 8 | rescored: R30-B2 fixed; the heroes and navy rules 0 broken over 20 years on four seeds; SB timing-only. Sea heroes still lost every 7–16 months (N1) |
| Tanks (needs 8) | 8 | 8 | rescored: C, FT, FP2, CB, CB2 identical; armoured divisions fight at T3 on a new seed (2417); land heroes still starve in half their losses |
| Aircraft (needs 8) | 8 | 8 | rescored: R30-B3 fixed; air rules 0 broken over 20 years on 2 + 4 seeds; PL identical, W timing-only |
| AI nuclear use (needs 8) | 8 | 8 | rescored: AI bursts in the headless worlds as run 30 (59 over the ten heroes-off 20-year runs, identical); A identical; **three AI strikes met in the page on a new seed** (6299), each alerted, Go to on the burst |

## R13–R15 and R7, case by case

### R13, a sea hero comes back to the open sea (R30-B2)
| Case | Run 30 (`d6e1bb1e`) | Run 31 (HEAD) | Evidence |
|---|---|---|---|
| Where sea heroes come back, 10 seeds × 20 years | Sovetsky Soyuz at Baku (4637), Atyrau (7603), Makhachkala (9001), Petrozavodsk (4111); 11,259 days to the run's end | **No return on the Caspian or a lake.** Soviet returns at Leningrad (168), Murmansk (47), Sevastopol (37), Vladivostok (21), and ocean ports it held (Karachi, Bandar Abbas, Reykjavik, Anadyr) | `critic/c31_seareturns.txt`, `critic/c30_seareturns.txt` |
| Sovetsky Soyuz on 4637 | back at Baku day 2,640, never lost again, 19 engaged days | lost 33 times, engaged 83 days, waitPast 0 | `critic/c31_ho_on_4637.json`, `critic/c30_ho_on_4637.json` |
| Checker, heroes + navy rules, 20 years, heroes on | (rule absent) | 4637, 7603, 4111: 0 broken; heroWaits 9001, 4111, 4253, 4637, 7603: 0 broken | `critic/c31_wi_4637_h20_hn.log`, `critic/c31_wi_7603_h20_hn.log`, `critic/c31_wi_4111_h20_hn.log`, `critic/c31_herowaits_*.log` |
| Days waiting past the hero's day, nation alive, 10 seeds | 9,219 (Bismarck 3,560, Roma 3,040, Yamato 2,078, Richelieu 541) | 9,090 (Bismarck 3,067, Roma 3,040, Richelieu 2,178, Yamato 805) | `critic/c31_ho_sum.txt`, `critic/c31_hocmp.txt` |
| Richelieu on 4637 | came back on a lake, day 6,048 | **waits 1,638 days "no place"** (France alive, no port on its basin), then back; the Overview row says "waits for a port on its sea" | `critic/c31_herowaits_4637.log`, `critic/c31_hwp_4637_fra.json`, `critic/shots/c31hwp_4637_fra_132000.png` |
| The row's text (4111, tick 15,600) | "waits for a port to return to" | "waits for a port on its sea" | `critic/c31_hwp_4111_ger.json` |
| Six more seeds × 20 years (8011, 8423, 9001 random — run 30's Makhachkala case — 1201, 2417 random, 6977) | — | **944 sea-hero returns, none on the Caspian or a lake** | `critic/c31_seareturns_hx.txt` |
| New seeds 1201, 2417 (random), 6977, heroes on, 20 years | — | Soviet hero waitPast 0 on each, returns at Sevastopol, Leningrad, Okhotsk, Murmansk; full checker 0 broken | `critic/c31_hx_on_1201.json`, `critic/c31_hx_on_2417.json`, `critic/c31_hx_on_6977.json`, `critic/c31_wi_1201_h20.log`, `critic/c31_wi_2417r_h20.log`, `critic/c31_wi_6977_h20_bk.log` |
| HPOS, 4637, Sovetsky Soyuz every 150 days from day 2,600 to 7,250 | always at 47–53° E, 37.5–40.2° N (the Caspian); 0 Soviet fleets within 600 km in 32 samples | **Alive in 27 of 32 samples, at 16 different places on the ocean** (Yellow Sea, Arabian Sea, Kamchatka, Baltic, Andaman Sea, off Chile, off Egypt, Black Sea, Marmara, off Iceland, off Mauritius, North Sea); Soviet fleets within 600 km in 21 of them; it lingers (Andaman coast 600 days, off Iceland 450) but sails | `critic/c31_hpos_4637.log`, `critic/c31_hpos_4637_SOV.json`, `critic/c30_hpos_4637.log` |
| Ports by basin (4637 start) | — | 541 ports on the world ocean, 36 with no lane water, 16 on ice-closed water, the Caspian (5 ports) and eleven small basins (US Gulf-coast lagoons: 15 of the US's 59 ports are off the ocean basin) | `critic/c31_basins.4637.log` |

### R14, every folded hero reachable by touch (R30-B1)
| Case | Run 30 | Run 31 | Evidence |
|---|---|---|---|
| HFT, 5521 start view, phone, touch: tap, tap again / × then tap / Escape then tap | Sovetsky Soyuz +1 [yes, no], Bismarck +2 [yes, no, no] | Folds are "Richelieu +1" (Char 2C) and "Roma +1" (P.100): **each member reached all three ways** | `critic/c31_hft_5521.json`, `critic/shots/c31hft_5521_Roma1.png` |
| HF, 5521 phone (mouse) | 7 of 10 heroes reached; folds of nations [10, 20], [1, 19, 20], [1, 15, 19] | **10 of 10**; every fold one nation's | `critic/c31_hf_5521_phone_d0_0.json`, `critic/shots/c31hf_5521_phone_d0_0.png` |
| HF, 5521 desk | 12 of 14 (Yamato, O-I under the Ranking panel) | 12 of 14, **the same two under the Ranking panel** (a click opens Anglo-Egyptian Sudan, Belgian Congo) | `critic/c31_hf_5521_desk_d0_0.json`, `critic/shots/c31hf_5521_desk_d0_0.png` |
| HF at 9000 m/px, 4111 day 365, 7019 day 730 (desk) | all reached but O-I | 10 of 10; 7 of 8 (O-I under the panel); **10 of 12 on 7019 day 730: O-I and Sovetsky Soyuz ("Sovet…", cut by the Ranking panel) open nothing** | `critic/c31_hf_5521_desk_d0_9000.json`, `critic/c31_hf_4111_desk_d365_0.json`, `critic/c31_hf_7019_desk_d730_0.json`, `critic/shots/c31hf_7019_desk_d730_0.png` |
| New: HF and HFT on 1201 (start, phone and desk) and 6977 day 365 (phone) | — | phone 10 of 10, 7 of 7; touch folds reached all ways; desk 12 of 14 (Japan's two under the panel) | `critic/c31_hf_1201_*.json`, `critic/c31_hf_6977_phone_d365_0.json`, `critic/c31_hft_1201.json`, `critic/c31_hft_6977.json` |
| The trade (ADR-817): two nations' counters overlap | — | On 5521 TOG II's counter covers the top of "Bismarck" (still legible); on 4637 in 1953 **T-42's counter covers the Maus's name: it reads "Ma"** | `critic/shots/c31hf_5521_desk_d0_0.png`, `critic/shots/c31hwp_4637_fra_132000.png` |

### R15, carrier wings stay with a hero's fleet (R30-B3)
| Case | Run 30 | Run 31 | Evidence |
|---|---|---|---|
| WB, 3373 random, heroes, days 575–605: wings not at their carrier | three wings left 6 cells behind carrier group 1130 at tick 13,955 | **none in any hour** | `critic/c31_wingbase_3373.log`, `critic/scripts/c31_wingbase.ts` |
| worldInvariants 3373 random heroes | 2 broken in 730 days | 0 in 730 days; **0 in 7,300 days (air rules)** | `critic/c31_wi_3373r_h.log`, `critic/c31_wi_3373r_h20_air.log` |
| worldInvariants 5591 heroes | 2 broken in 3,650 days | 0 in 3,650 days (all rules); **0 in 7,300 days (air rules)** | `critic/c31_wi_5591_h10y.log`, `critic/c31_wi_5591_h20_air.log` |
| The checker's change ("kept a base lost an hour ago" now compares the base) | — | Read: a wing that falls back to a second base taken in the same hour gets another hour, a wing that keeps the same lost base still breaks. A loosening, but the rule it keeps is the one PLAN states (a lost base is left within the hour); no case found that it hides | `tests/helpers/worldInvariants.ts` (diff `d6e1bb1e..HEAD`) |

### R7, a default says so
| Case | Run 31 | Evidence |
|---|---|---|
| DF (new), 7019, God sets Poland to −800, run day by day | Day 151: History "1 June 1938 Poland defaulted: its debts were voided"; filter "Default" → 1 of 197 events; no ticker row; a save at tick 3,721 run 200 h, loaded and run 200 h: the same hash both times (1,640,144,439) | `critic/c31_df_7019_pol.json`, `critic/shots/c31df_pol_history.png` |
| DEF (new), every default and collapse, 6 seeds × 20 years (one heroes on, two random diplomacy) | **0 defaults, 0 collapses; no nation below −100 gold at any 30-day sample**; 7019's year-20 History has no Bankruptcy row | `critic/c31_def_1201.json`, `critic/c31_def_2531.json`, `critic/c31_def_3739.json`, `critic/c31_def_7019.json`, `critic/c31_def_8467.json`, `critic/c31_def_6977.json` |
| Economy rules, 7019 × 10 years; with Poland −800 and Romania −300 on 6977 × 20 years, heroes | 0 broken; 0 broken | `critic/c31_wi_7019_econ10y.log`, `critic/c31_wi_6977_h20_bk.log` |
| The checker's change | Read: the "silent default" exemption is gone; a gold rise is excused only in the hour of a `NationDefaulted` or `NationCollapsed` row. A tightening | `tests/helpers/worldInvariants.ts` |

## Run 30's cases re-run

| Run 30 case | On HEAD (`4c546398`) | Evidence |
|---|---|---|
| R30-B1 (HF, HFT, HFT2) | **Fixed** (above) | `critic/c31_hft_5521.json`, `critic/c31_hf_5521_phone_d0_0.json` |
| R30-B2 (seareturns, HPOS, heroWaits) | **Fixed** (above) | `critic/c31_seareturns.txt`, `critic/c31_hpos_4637.log` |
| R30-B3 (WB, the two seeds) | **Fixed** (above) | `critic/c31_wingbase_3373.log`, `critic/c31_wi_3373r_h20_air.log`, `critic/c31_wi_5591_h20_air.log` |
| R30-N1 (land heroes starve; sea heroes lost often) | **Unchanged**: sea heroes 7.6 (Iowa) to 36.4 (Richelieu) losses per 20 years; land heroes' losses with no fight in the 24 h before 27/34 – 79/132 | `critic/c31_ho_sum.txt` |
| R30-N2 (Japan's heroes under the Ranking panel) | **Unchanged**, and on 7019 day 730 the Soviet hero too | `critic/c31_hf_7019_desk_d730_0.json` |
| R30-N3 (graph: first tap after a drag eaten) | **Unchanged** (RGT identical) | `critic/c31_rgt_4111.json` |
| R30-N4 (a hero hides the fleets stacked with it at T1) | **Unchanged** (HS identical) | `critic/c31_hs_3739.json` |
| R30-N5 (the option's hint promises a return in 60 days) | **Unchanged** (HT identical); with R13 a sea hero may now wait years ("on its sea") | `critic/c31_ht_phone.json` |
| R30-N6 (bond's exit no truce, guarantees only the start's, five ticker rows a Force war, refused peace untold, phone clutter, live "Propose alliance" refused) | **Unchanged**: BX, BS ×4, FW, FW2, PP, AL, K2 identical | `critic/c31_cmp.txt` |
| Heroes probes HC, HCC, HT ×2, HW ×2, HD, HG, HN, HSL, RG ×2, RGZ, RGT, HV, HS, HSC, HRV ×4, HL ×2 | Identical but HC/HCC/HF (R14's layout, by design), HD (one ticker row's day, timing), HV (3739's heroes-on world changes from day 120: Bismarck, Hood and TOG II lost by then; R15 moves wings, so the war differs) | `critic/c31_cmp.txt` |
| HO, heroes on vs off, 10 seeds × 20 years | Off: all ten identical to run 30. On: sea battles 346.7 vs 180.8 (+166 ± 10), ships sunk +765 ± 91, major land battles −37 ± 16, the rest within noise (wars +10 ± 11, capitals +25 ± 21, seven powers' land at year 20 +6.2 ± 3.5) | `critic/c31_ho_sum.txt` |
| LOY ×3, OR ×6, OR2, PR ×2, PZ ×4, EXIT ×3, ES2 ×3, COBEL, BX ×3, BS ×4, BOTH ×5, AL, GU, PG ×2, TD, K, K2, K3, Q, DR, BT ×2, CB, CB2, HU, SX, SXG ×2, SXT, EX2, FT, FP2, PL ×2, P2, PH, PT, PUP, U, TG, OS, OS2 (c25), C, DL, HI, WW, FW, FW2 | **Identical** to run 30 | `critic/c31_cmp.txt` |
| Timing-only differences | A (a title button's id), AN 7019 (end tick by one hour), ES (step 1's ticker read), FO (0.2 px), G (fleets near a mark), PG2 (one day; in progress when read), RW (the nation under the click), SB (one hour), W (sorties' first hour), Z (±3 % elements) | `critic/c31_cmp.txt` |
| Headless 7019 × 20, 1777 × 30, 8209 × 30 | Identical but wall time (tick 4.4 / 4.1 / 5.8 ms; run 30 5.7 / 3.7 / 5.1, seven sims at once both runs) | `critic/c31_headless_*.json` |
| AN, AI strike in the page, 7019 year 20 | Not met, as runs 29 and 30 (no strike in 400 days) | `critic/c31_an_7019y20.json` |
| AN on a new seed (6299, year-18 save) | Three AI strikes met, alerts, Go to and zoom series (above) | `critic/c31_an_6299y18.json` |
| LW, ten years in the page, 6151 / 4111, heroes off / on | 59.8–60 fps every year, longest gap 83–117 ms (run 30: 83–84), none over 500 ms, no page error; wall time 336–401 s (run 30: 252–310) | `critic/c31_lwdef_6151.json`, `critic/c31_lwhon_6151.json`, `critic/c31_lwhon_4111.json`, `critic/c31_lwdef_4111.json` |
| PF (fps over a fight in 7019's year-20 save) | No engaged formation in the save's hour, as runs 29 and 30 (`fatal`); not compared | `critic/c31_pf_7019.json` |
| Checkers on run 30's seeds (4421, 6863 random, 9907, 3331 × 10 y, 2861, 3373 random, 5591 × 10 y; diploInvariants 8209, 4421, 6863, 9907, 1777, 2861, 3373) | 0 broken each | `critic/c31_wi_*.log`, `critic/c31_diploinv_*.log` |

## The checkers on new seeds

| Checker | Result | Evidence |
|---|---|---|
| `worldInvariants.ts 1201 7300 --heroes` (all rules, 20 years) | 0 broken | `critic/c31_wi_1201_h20.log` |
| `worldInvariants.ts 2417 7300 --heroes --diplomacy random` | 0 broken | `critic/c31_wi_2417r_h20.log` |
| `worldInvariants.ts 6977 7300 --heroes --bankrupt POL:-800,ROM:-300` | 0 broken | `critic/c31_wi_6977_h20_bk.log` |
| `worldInvariants.ts 8861 3650` (heroes off) | 0 broken | `critic/c31_wi_8861_noh10y.log` |
| `worldInvariants.ts 5653 1825 --world random` | 0 broken | `critic/c31_wi_5653w_5y.log` |
| `diploInvariants.ts 1201 scenario --heroes`, `2417 random --heroes`, `8861 scenario --world random` | 0 / 0 / 0 broken | `critic/c31_diploinv_1201s_h.log`, `critic/c31_diploinv_2417r_h.log`, `critic/c31_diploinv_8861w.log` |
| `heroWaits.ts 9001 7300` | 0 broken | `critic/c31_herowaits_9001.log` |

## Dimensions

### Map visuals and readability: 7
- **Tested:** HC ×2, HCC, HF ×8 (three seeds, four days, two zooms), HFT ×3, HT ×2, HW ×2, HV, HS, Z ×2, CB, CB2, TG,
  C ×2, LW ×5 (year shots), HWP ×2.
- **Held at 7:** R14 ends the cross-nation folds and the cut "+1" (`critic/shots/c31hf_5521_phone_d0_0.png`). The rest
  of the map is run 30's (identical probes).
- **Not 8:** at the phone's start view eight hero counters cover Europe's own tags; at a desk Japan's heroes (and the
  Soviet one on 7019 day 730) are drawn under the Ranking panel; two nations' hero counters now overlap and cut a name
  ("Ma", `critic/shots/c31hwp_4637_fra_132000.png`).
- **Fix:** keep hero counters out of the HUD panels' rectangles; when two nations' counters would overlap, step the
  later one clear or draw it under the other's flag but above its text.

### Diplomacy, war, alliance, puppet, revolt depth: 7
- **Tested:** the whole heroes-off diplomacy queue (identical to run 30), the checkers on 10 diploInvariants runs and
  18 worldInvariants runs (0 broken), HRV ×4 (an annexed hero nation for 20 years: 0 broken, identical).
- **Not 8:** run 30's list stands (R30-N6): the bond's exit costs no truce; guarantees only the start's; five ticker
  rows a Force war; a refused peace untold; live "Propose alliance" the sim refuses.

### Emergent world dynamics over long runs: 7
- Heroes on vs off (`critic/c31_ho_sum.txt`): a busier sea, a quieter land war, nothing else beyond noise; the same
  picture as run 30. Ten-year page watches end with 70–76 nations, wars on several continents
  (`critic/shots/c31lwhon_4111_y10_world.png`).
- **Not 8:** in 6 seeds × 20 years no default or collapse happened and no AI nation went below −100 gold at any 30-day
  sample (`critic/c31_def_*.json`; 7019's year-20 History has no Bankruptcy row, `critic/c31_hi_7019.json`): the
  default rules are, in practice, God's. The sea heroes die every few months (N1).

### God Mode: 7
- Q, K, K2, K3 identical; A identical but a title button's id; the treasury tool drives a nation into a told default
  (R7, `critic/c31_df_7019_pol.json`). God's Annex takes a nation's heroes (HN identical).
- **Not 8:** the God tab's refusals and tools are run 30's.

### Editor and scenarios: 7
- G: place, warheads, war and the marks to day 60 as run 30 (the probe's day-120 wait times out at 15 min, as in
  runs 29 and 30); OS2 on run 25's scenario file loads identically (3.7 s); HSC (heroes in a scenario file) identical.
- An older build's save (run 29's 7019 year 20, made at `823cbf1b`, before the hero and default kinds) loads on HEAD
  with no page error; its History opens in 129 ms with 3,494 events and 30 kinds, as HEAD's own year-20 save
  (`critic/c31_hi_7019_c29save.json`, `critic/c31_hi_7019.json`).
- **Not 8:** nothing in the editor changed in the batch; OS and OS2 (c10) time out waiting for a URL change since run
  29 (the probes', not counted).

### Stats and history: 7
- The new "Default" kind (R7) reads in the History and its filter; HI (year-20 History, 3,494 events, 30 kinds, opened in 141 ms), DL (CSV/JSON
  export), HG (Go to), HD identical or timing.
- **Not 8:** the default row has the sum (`b`) but does not say it; History and charts otherwise unchanged.

### UI/UX and polish: 7
- **Tested:** U, P, P2, P3, PT, PH, BT ×2, TD, SX, SXT, SXG ×2, EX2, RG ×2, RGZ, RGT, HT ×2, HFT ×3, DF.
- R14 by touch works (`critic/c31_hft_5521.json`). **Not 8:** the graph's first tap after a drag is eaten
  (`critic/c31_rgt_4111.json`); a hero hides the fleets under it at T1 (`critic/c31_hs_3739.json`); on a phone the
  panel the first hero tap opens (y 46–272) covers six other hero counters (`critic/shots/c31hft_5521_Roma1.png`).

### Performance: 7
- LW ×4 (59.8–60 fps every year, no gap over 500 ms), a fifth on a new seed (1201 heroes on, with the queue done:
  59.9–60 fps, longest gap 83 ms, 288 s for ten years, 78 nations at the end, `critic/c31_lwhon_1201.json`), RW 3 years
  of the random world; headless 4.1–5.8 ms a tick with seven sims at once.
- The watches beside the queue had longest gaps of 100–117 ms in three of four (run 30: 83–84) and took 336–401 s
  (run 30: 252–310). The same 6151 watch re-run alone at the end: **59.9–60 fps, longest gap 83 ms, 283 s, the same
  world year by year** (`critic/c31_lwquiet_6151.json`): the rise was the machine's load, not the build.
- **Not 8:** measured only in headless Chromium on this desktop; no phone-class device measured; nothing in the
  batch changed the cost of a frame or a tick.

### Stability: 7
- No page error in any game probe (the only one, `ERR_NO_BUFFER_SPACE` in PHZ, is the machine's socket buffers under
  load; PHZ re-run alone afterwards: identical to run 30, `critic/c31_phz_2671.json`). 110 headless jobs, none crashed. Save and load reproduce the hash with a default row
  (DF) and with a hero gone (HSL identical to run 30).

### Semantic zoom to unit level: 8
- Z on a new seed (1201: elements from 1,573 m/px, individual men from 28 m/px, `critic/c31_z_1201.json`), C on a new
  seed (2417: German armour against Poles at 15 m/px, each tank and soldier drawn,
  `critic/shots/c31c_2417_arm_15m_live_1.png`), C 7019, TG and PHZ (phone, six tiers) identical, the hero T1/T2 health tags (HW identical).
- **Not 9:** T1 tags and the phone's deep-zoom clutter, as run 30.

### Naval warfare: 8
- R30-B2 fixed with evidence on 13 seeds; the new basin rule and the navy rules 0 broken over 20 years on three seeds
  and the full rules on four more; sea battles and losses as run 30 with heroes off (SB timing-only, HO identical).
- **Not 9:** sea heroes lost 7.6–36 times in 20 years; a sea hero may now wait years for a port on its basin (by
  design, told).

### Tanks: 8
- C ×2 (armour at T3 on a new seed), FT, FP2, CB, CB2 identical; land heroes still starve in about half their losses.

### Aircraft: 8
- R30-B3 fixed (20-year air rules 0 broken on 3373 random, 5591, 1201, 2417 random, 6977; WB clean); W timing-only,
  PL ×2 identical; monthly air-war rows in every ticker read (`critic/c31_lwhon_4111.json`).

### AI nuclear use: 8
- Heroes-off 20-year worlds identical to run 30, their bursts with them (59 over ten seeds; 6299 has 12 in year 19);
  the nukes rules 0 broken on every full-rule checker run; A (God's nuke) identical.
- **AN met in the page for the first time since run 28** (new seed 6299, a year-18 save made on HEAD): three AI strikes
  in 120 days, each pausing the game with its alert ("Soviet Union struck United States with an atomic bomb near Olbia:
  0 civilians killed; 67,098 men and 240 guns lost", then Sumbawanga, then the US on Blagodarnyy); Go to lands on the
  burst, which reads as a dark scorch around the stack it hit (`critic/c31_an_6299y18.json`,
  `critic/shots/c31an_6299y18_0_goto.png`, `critic/shots/c31an_6299y18_0_z00600.png`). No page error.
- **Not 9:** the scorch is faint at 600 m/px; 7019's year-20 world again had no strike in 400 days.

## Blocking issues

None.

## Non-blocking issues
1. **R31-N1.** Hero counters under the HUD at a desk: Japan's two at every start view (5521, 1201), and Sovetsky Soyuz
   on 7019 at day 730 ("Sovet…" cut by the Ranking panel); a click opens a ranking row or nothing.
   `critic/c31_hf_5521_desk_d0_0.json`, `critic/c31_hf_7019_desk_d730_0.json`, `critic/shots/c31hf_7019_desk_d730_0.png`.
2. **R31-N2.** Two nations' hero counters overlap and cut a name ("Ma" under T-42, 4637, January 1953), against
   ADR-817's "every name reads". `critic/shots/c31hwp_4637_fra_132000.png`.
3. **R31-N3.** No default or collapse in AI play over 6 seeds × 20 years, no nation below −100 gold at any 30-day
   sample, no Bankruptcy row in 7019's 20-year History; R7's row is met only through God. The default row omits the sum it carries.
   `critic/c31_def_*.json`, `critic/c31_df_7019_pol.json`.
4. **R31-N4.** Sea heroes lost 7.6–36 times in 20 years, land heroes starve in about half their losses (R30-N1).
   `critic/c31_ho_sum.txt`.
5. **R31-N5.** The option's hint promises a return 60 days after a loss; with R13 Richelieu waits 1,638 days on 4637
   (told in its row, not in the hint). `critic/c31_herowaits_4637.log`, `critic/c31_ht_phone.json`.
6. **R31-N6.** Unchanged: the graph eats the first tap after a drag (R30-N3); a hero hides the fleets stacked with it
   at T1 (R30-N4); run 30's diplomacy list (R30-N6). `critic/c31_rgt_4111.json`, `critic/c31_hs_3739.json`,
   `critic/c31_cmp.txt`.

## Design objections (none blocking, no score lowered)
- R13 (ADR-816) keeps a sea hero off any port not on its start's basin. On 4637 France held ports and Richelieu
  waited four and a half years; the user decided it, the row tells it, but a player who reads "they come back 60 days
  after they are lost" on the form will not expect it.
- ADR-817's trade lets two nations' counters overlap. At the world's zoom over Europe that cuts names; a list on tap
  (below) would trade nothing.
- Run 30's objections stand (heroes' AI tied to the largest fleet and the nearest fight; the played nation's AI
  declares its own wars; a junior member's peace ends the whole war; a hero gone with its annexed nation).

## Ideas from other games (not scored)
- A tapped stack of named units opens a small list, each with its flag and health, as grand-strategy maps do; it
  would replace both the fold's round and the overlap.
- Economies that bend: a war-weariness or debt spiral the AI can fall into, so that a default is a story the player
  watches rather than one God writes.

## Notes
- The page probes ran beside up to 7 (for a few minutes 14) headless sims; the long-watch frame gaps and wall times
  are read with that in mind, against one quiet watch at the end (`critic/c31_lwquiet_6151.json`).
- jobs4's runner ran twice (a first background start I took for dead survived): each of its seven jobs ran twice at
  once; deterministic, the files are whole.
- `c31_hpos.ts` was first run with a substring that matched no hero (all "false"); its re-run with `sovetsky` is the
  evidence.
- No worktree was made; only port 5299 was used and stopped at the end.

## Strengths, verified
- **The fixes are real on the critic's own seeds:** 0 Caspian or lake returns over 1,792 sea-hero returns where run 30
  had 11,259 days of them; every phone hero reached by touch where run 30 reached 7 of 10; 0 air breaks over 20 years
  where run 30 had 4 in two runs.
- **Determinism holds across the batch:** 113 of 153 re-run probe JSONs identical to run 30, every heroes-off world
  identical, and every difference accounted for (R13–R15 by design, or timing).
