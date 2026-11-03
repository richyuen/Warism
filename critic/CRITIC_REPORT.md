# Critic report, run 30 (focused) — ROADMAP R5b, after R8–R12

- **Mode: focused.** Decided from git before anything else (CRITIC_PROMPT, ADR-804). All three conditions hold:
  1. the last report (run 29, full, `823cbf1b`) has blocking issues (R29-B1–B3) and two scores under the bar
     (`mapVisuals` 6, `uiUxPolish` 6);
  2. every commit since is either the commit that filed run 29 (`00b1751b`, nothing under `src/`, `data/`, `public/`)
     or names a ROADMAP item that commit filed: `fdbd8a83` R8, `214e8edb` R9, `8f6ccffe` R10, `a8d4cd55` R11,
     `d6e1bb1e` R12;
  3. the last three reports were not all focused (runs 27 / 28 / 29: focused / full / full).

  ROADMAP R5b asks for "the batch's full critic run"; the brief's rule decides the mode, not the item's wording.
  **A release needs a full run with no blocking issue, so this run does not close R5b: a full run must follow.**
- **Commit judged:** `d6e1bb1e52097b3d483e20c98b51b8e8ce906fc1` (HEAD at the start, `critic/c30_commit.txt`). **Date:** 2026-11-03.
- **Build:** `vite build --outDir critic/c30_dist`, exit 0 (`critic/c30_build.log`), served by `vite preview` on
  127.0.0.1:**5299**. Chromium through Playwright, headless, 1600 × 900; phones 390 × 844 (touch, DPR 2 for the new
  probes).
- **Baseline:** run 29's own files (`critic/c29_*`, commit `823cbf1b`) are the "before" of every re-run case; no worktree
  was needed. With the heroes **off** the sim is unchanged by R8–R12: every heroes-off world probe re-run here is
  identical to run 29 (below). With heroes **on**, R9/R10 change the world by design.
- **Scope (focused):** scored afresh: `mapVisuals`, `uiUxPolish` (under the bar), `diplomacyWarDepth`, `naval`
  (blocked on in run 29), and what the diff touches (`git diff --stat 823cbf1b HEAD`: `counters.ts`, `markers.ts`,
  `MapView.ts` → `semanticZoom`; `heroes.ts`, `elements.ts` → `naval`, `tanks`, `emergentDynamics`; `puppets.ts`,
  `server.ts` → `diplomacyWarDepth`, `godMode`; `events.ts`, `history.ts`, `historyRows.ts` → `statsHistory`;
  `RelationsPanel.tsx`, `FormationPanel.tsx`, `NewGameForm.tsx`, `style.css` → `uiUxPolish`). **Carried:**
  `editorScenarios`, `performance`, `stability`, `aircraft`, `aiNukes` (their cases still re-run; a defect met in passing
  is filed).
- **Runs:** run 29's headless queue (`critic/scripts/c30_jobs1.txt`, 78 jobs, 7 at a time) and second queue
  (`c30_jobs2.txt`); run 29's page suites (`c30_pagesuites.sh`, `c30_tail2.sh`) and heroes page probes
  (`c30_heroes_page.sh`). New this run: `c30_hf_herofold.mjs` (every folded hero counter, its members, a click
  repeated), `c30_hft_foldtouch.mjs` and `c30_hft2_shot.mjs` (the same by touch on a phone), `c30_rgz_zoom.mjs` and
  `c30_rgt_tap.mjs` (the relations graph's zoom by touch), `c30_hg_herogoto.mjs` (R12's rows and Go to),
  `c30_hwp_waitport.mjs` (the "waits for a port" row), `c30_hrv.ts` (an annexed hero nation, 20 years, the checker's
  hero rules hourly), `c30_seareturns.ts`, `c30_herotrace.ts`, `c30_hpos.ts` (where sea heroes come back and stay),
  `c30_wingbase.ts` (a checker break). JSON comparison with run 29: `critic/c30_cmp.txt` (84 identical).

## Verdict

**R8–R12 fixed what run 29 named. Three new blocking issues come out of the fixes and the checkers. `mapVisuals`
and `uiUxPolish` are back to 7.**

What was fixed, on my own counts:
- **R29-B1 fixed.** At the opening view no hero counter is more than 33 px (one counter height) from its place, desk and
  phone (run 29: P.100 Ercole 5,009 km off, six heroes over Africa). Overlapping heroes fold into one counter
  ("Maus +2"), and on a desk repeated clicks open each hero in turn.
- **R29-B2 fixed.** No hero served a nation other than its own in 13 seeds × 20 years with heroes on (run 29: Roma and
  P.100 for Britain on 4637, the Maus for the USA on 7603). God's Annex of France takes Richelieu and Char 2C with France.
- **R29-B3 largely fixed.** Sea heroes waited past their day 9,219 days over the ten seeds (run 29: 39,420). Every
  remaining wait is a nation holding no port, and the Overview row says so ("waits for a port to return to").
- **R29-N1, N2, N3, N6 (hint), N8 fixed**: ticker and History rows for a hero lost and back, with Go to; a Health row
  in the formation panel; hero tags read health ("35%"); the option's hint is visible text; war lines name their side;
  the graph zooms and pans by touch; the bottom bar is one row at 1024 px.

What is new:
1. **R30-B1. On a phone, three heroes at the opening view cannot be opened from the map.** HMS Hood is folded into
   "Sovetsky Soyuz +1" (Soviet flag, about 2,800 km from the Hood, its "+1" off the screen's edge), and TOG II and
   Char 2C into "Bismarck +2". A tap opens the lead; the panel then covers the counter, so the next tap lands on the
   panel; closing the panel starts the fold over at its lead. R8's acceptance test says "a click on each opens that
   hero, desk and phone".
2. **R30-B2. The R10 fallback ("any port held") puts Sovetsky Soyuz into the Caspian Sea or Lake Onega, and it stays
   there to the end of the run: 4 of 13 seeds, 11,259 days in all.** On 4637 it sits in the Caspian for 12.8 years,
   with no Soviet fleet within 600 km, while the Soviet Union holds up to 17 ports elsewhere. A hero counted as back
   that can never reach a war is B3 again by another route.
3. **R30-B3. The checker's air rules break on two of seven new seeds, both with heroes on**: a carrier wing left one
   hour behind its fleet (3373 random diplomacy: 2 broken; 5591: 2 broken). The same seeds with heroes off have
   0 broken. The cause is not shown.

## Scores

| Dimension | Run 29 | Run 30 | |
|---|---|---|---|
| Map visuals and readability | 6 | **7** | up: B1's cascade is gone (no counter more than 33 px off, desk and phone); hero tags read health. Held at 7, not higher: folds put heroes under another nation's flag; at the phone's start view the hero counters cover Europe's own tags; Japan's two heroes are under the Ranking panel on a desk |
| Diplomacy, war, alliance, puppet, revolt depth | 7 | 7 | rescored: R9 holds (0 days served for another nation, 13 seeds); graph war lines fixed; every heroes-off diplomacy probe identical to run 29 (BX, BS, AL, OR, PZ, PP, BOTH, EXIT, COBEL, LOY); the checker reports 0 broken on 7 seeds |
| Emergent world dynamics over long runs | 7 | 7 | rescored: heroes on vs off, 10 seeds × 20 years: sea battles +92 %, ships sunk +41 %, major land battles −21 %; the rest within noise |
| God Mode | 7 | 7 | rescored: Annex now takes a nation's heroes with it (ADR-812); Q, K, K2, K3, A identical or ticker-only |
| Editor and scenarios | 7 | 7 | carried (G, OS2, OS, HSC re-run: as run 29) |
| Stats and history | 7 | 7 | rescored: R12 rows in the ticker and History, kinds "Hero lost" / "Hero back", Go to moves the camera; nothing else changed |
| UI/UX and polish | 6 | **7** | up: every R11 item read right on desk and phone (Health row, hint, war lines, zoomable graph with labels 6 → 15 px at 2.25×, bar one row at 1024). Held at 7: R30-B1 on the phone; the first tap after a drag in the graph is eaten; at T1 a hero still hides the fleets stacked with it |
| Performance | 7 | 7 | carried; fresh evidence: four ten-year page watches 59.8–60 fps, longest frame gap 84 ms |
| Stability | 7 | 7 | carried; no page error in any probe, no crash in 84 headless jobs, save and load reproduces the hash with a hero gone |
| Semantic zoom to unit level (needs 8) | 8 | 8 | rescored: T1 marker and T2 tag read a hero's health; Z, C, PHZ as run 29 (timing only) |
| Naval warfare (needs 8) | 8 | 8 | rescored: waits down by three quarters; R30-B2 filed blocking. Held at 8 as in run 29, where B3 was also filed and not scored down: the sea rules outside the heroes are unchanged (SB, G as run 29) |
| Tanks (needs 8) | 8 | 8 | rescored: land heroes still starve in about half their losses (414 of 768 with no fight in the 24 h before); C, FT, FP2 as run 29 |
| Aircraft (needs 8) | 8 | 8 | carried; R30-B3 (a checker break in the air rules with heroes on) filed |
| AI nuclear use (needs 8) | 8 | 8 | carried; AI bursts in the headless runs as run 29 (heroes-off worlds identical) |

## Heroes: what R8–R12 did, case by case

### R8, counters at the world's zoom (R29-B1)
| Case | Run 29 (`823cbf1b`) | Run 30 (HEAD) | Evidence |
|---|---|---|---|
| HC, 5521 start view, desk | 14 counters; Roma 3,777 km, P.100 5,009 km, Char 2C 3,757 km off | 9 counters (4 folded); **largest offset 33 px (one height)**, the Maus and T-42 one step below their places | `critic/c30_hc_5521_desk.json`, `critic/shots/c30hc_5521_desk_start.png` |
| HC, 5521 start view, phone | 10 counters, the same cascade | 5 counters; largest offset 33 px | `critic/c30_hc_5521_phone.json`, `critic/shots/c30ht_phone_05_start.png` |
| HC at 6000 / 3000 m/px | Maus 33 px off at 6000 | unchanged | same files |
| HCC, a click on a displaced counter | opened Austria, France, French West / Equatorial Africa | "Maus +2" opens the Maus, "Roma +1" Roma | `critic/c30_hcc_5521.json` |
| **HF (new): each folded counter, the heroes in it, a click repeated**, 5521 desk | — | "Sovetsky Soyuz +1" holds **HMS Hood, 148 px (~2,900 km) from the counter's centre, its place outside the box**; "Bismarck +1" holds TOG II (39 px); "Maus +2" holds Richelieu (81 px, outside the box) and Char 2C. Repeated clicks open each in turn (all 14 reached on a desk), but **Yamato and O-I are drawn under the Ranking panel: a click opens Anglo-Egyptian Sudan and Belgian Congo** (the panel's rows) | `critic/c30_hf_5521_desk_d0_0.json`, `critic/shots/c30hf_5521_desk_d0_0.png` |
| HF, 5521 phone (mouse) | — | "Sovetsky Soyuz +1" (Hood) and "Bismarck +2" (TOG II, Char 2C) open only their leads | `critic/c30_hf_5521_phone_d0_0.json` |
| **HFT (new): the same by touch on a phone** | — | Tap again: the formation panel (y 90–520) covers "Bismarck +2" and "Sovetsky Soyuz +1", the second tap lands on it. Close (×) or Escape, tap again: the lead again. **Reached: Sovetsky Soyuz +1 [yes, no], Bismarck +2 [yes, no, no]**; "Maus +2" (not covered) reaches all three only by tapping again with the panel open | `critic/c30_hft_5521.json`, `critic/shots/c30hft2_5521_phone_start.png`, `critic/shots/c30hft2_5521_phone_tap2.png` |
| HF at 9000 m/px, desk | — | 10 counters; "Richelieu +1" holds Char 2C (85 px; same nation); all reached | `critic/c30_hf_5521_desk_d0_9000.json` |
| HF at day 365 (4111) and day 730 (7019), start view | — | No counter more than 33 px off; P.100 folded into "Bismarck +1" on 7019. Japan's O-I again under the Ranking panel (a click opens Argentina / France) | `critic/c30_hf_4111_desk_d365_0.json`, `critic/c30_hf_7019_desk_d730_0.json` |

### R9, a hero stays its nation's (R29-B2)
| Case | Run 29 | Run 30 | Evidence |
|---|---|---|---|
| HO, 10 seeds × 20 years, days a hero served another nation | Roma 822, P.100 333 (4637, Britain); Maus 1,033 (7603, USA) | **0 for every hero on every seed**; also 0 on three new seeds (8011, 8423, 9001 random) | `critic/c30_ho_sum.txt`, `critic/c30_hx_on_*.json`, `critic/scripts/c30_hocmp.py` |
| HN, God's Annex of France into Germany (4111, day 2) | Richelieu and Char 2C fought for Germany, listed nowhere | Both gone with France (ADR-812); Germany's block lists only its own two | `critic/c30_hn_4111.json`, `critic/shots/c30hn_4111_ger_block.png` |
| HRV (new): annexed by God on day 2, then 20 years with the checker's hero rules hourly (4111 GER/FRA, 5023 GER/FRA, 6299 ENG/ITA, 7177 USA/JAP) | — | 0 broken; no annexed nation revived in any of the four runs, so **a hero's return at a revival was not met** | `critic/c30_hrv_*.json` |
| heroWaits on 4637 and 7603 (the AT's seeds) | — | 0 broken each | `critic/c30_herowaits_4637.log`, `critic/c30_herowaits_7603.log` |

### R10, sea heroes come back (R29-B3)
| Case | Run 29 | Run 30 | Evidence |
|---|---|---|---|
| Days waiting past the hero's day, nation alive, 10 seeds | Richelieu 16,123, Roma 11,218, Sovetsky Soyuz 5,551, Bismarck 4,888, Yamato 831, Hood 809 | Bismarck 3,560, Roma 3,040, Yamato 2,078, Richelieu 541, the rest 0. heroWaits: **every remaining day is "no place"** (the nation holds no port: Japan 1,275 days on 4637, Germany 2,190 on 7603) | `critic/c30_ho_sum.txt`, `critic/c30_herowaits_*.log` |
| The row while it waits (page, 4111 tick 15,600) | "waits to return" | **"Bismarck · waits for a port to return to"** | `critic/c30_hwp_4111_ger.json`, `critic/shots/c30hwp_4111_ger_15600.png` |
| **Where sea heroes come back** (1,740 returns, 10 seeds; 400 on 3 new seeds) | (bases only) | Mostly their start ports. **Sovetsky Soyuz back at Baku (4637, day 2,640), Atyrau (7603, day 4,399), Makhachkala (9001, day 3,857), all in the Caspian Sea, and at Petrozavodsk on Lake Onega (4111, day 7,045). It is never lost again in any of the four runs: 4,660 + 2,901 + 3,443 + 255 = 11,259 days in landlocked water to the run's end** | `critic/c30_seareturns.txt`, `critic/c30_seareturns_hx.txt`, `critic/scripts/c30_herotrace.ts` |
| HPOS (new): 4637, Sovetsky Soyuz every 150 days from day 2,600 to 7,300 | — | Always at 47–53° E, 37.5–40.2° N (Baku, Krasnovodsk, Bandar-e Anzali); **0 Soviet fleets within 600 km in any sample**, while the Soviet Union holds 7–17 ports through day 5,450 | `critic/c30_hpos_4637_SOV.json`, `critic/c30_hpos_4637.log` |

### R11, what the heroes and the graph read
| Case | Run 29 | Run 30 | Evidence |
|---|---|---|---|
| HW, Bismarck at 35 % (4111 tick 2,454): formation panel | "Men 2,200 of 2,200" | **"Health ▮▮ 35% · Men 2,200 of 2,200"**; its T1 tag "35%" | `critic/c30_hw_4111_bis.json`, `critic/shots/c30hw_4111_bis_panel.png`, `critic/shots/c30hw_4111_bis_1200m.png` |
| HW, TOG II starving at 11 % | "Men 8 of 8" | "Health 11%"; its T2 tag "11% TOG II" | `critic/c30_hw_4111_tog.json`, `critic/shots/c30hw_4111_tog_250m.png` |
| HT, the option's hint | `title` only | Visible text under the row on the phone form | `critic/c30_ht_phone.json`, `critic/shots/c30ht_phone_01_form1938.png` |
| RG, war line text (4111 days 0 and 365, desk and phone) | "Japan is at war beside Japan" | "Japan leads its side, with Manchukuo and 1 more, against China"; "Nationalist Spain is at war alone on its side"; counts of nodes and edges identical to run 29 | `critic/c30_rg_4111_desk.json`, `critic/c30_rg_4111_phone.json` |
| **RGZ (new): the graph's zoom by touch, phone, day 365** | (no zoom) | Label height 6 px whole, 10 px at 1.5×, 15 px at 2.25×, 34 px at 5×; a one-finger drag pans; a pinch zooms. Readable | `critic/c30_rgz_4111.json`, `critic/shots/c30rgz_4111_whole.png`, `critic/shots/c30rgz_4111_tapnode.png` |
| RGT (new): a tap on a nation after a drag | — | **The first tap after a one-finger drag selects nothing; the second does** (no drag: one tap selects). A tap opens the nation's panel over the graph; closing it keeps the zoom | `critic/c30_rgt_4111.json` |
| P3, bottom bar widths | wraps at 1024 (998 × 56) | one row at 1024 and 1180 (950 × 27) | `critic/c30_p3_widths.json` |
| HS, a hero stacked with fleets at T1 (3739) | five clicks open the Bismarck | identical: the three squadrons with it still cannot be clicked | `critic/c30_hs_3739.json` |

### R12, a hero's loss and return told (R29-N1)
| Case | Run 30 | Evidence |
|---|---|---|
| HD, Bismarck sunk (4111, tick 2,485) and back (3,925), page | Ticker "14 April 1938 Germany lost Bismarck near Cagliari" in the hour; "13 June 1938 Bismarck is back with Germany near Kiel"; History 187 rows (run 29: 184) with both, kinds "Hero lost", "Hero back" in the filter | `critic/c30_hd_4111_bis.json`, `critic/shots/c30hd_4111_bis_history.png` |
| HG (new), Go to | Clicking either ticker row moves the camera to the place (to 1075, 366, then 1082.5, 252.5; the zoom is kept); History's row Go to as well | `critic/c30_hg_4111.json`, `critic/shots/c30hg_4111_lost.png`, `critic/shots/c30hg_4111_back.png` |

## Run 29's cases re-run

| Run 29 case | On HEAD (`d6e1bb1e`) | Evidence |
|---|---|---|
| R29-B1 (HC, HCC, HT, start view) | **Fixed** (above); new problem R30-B1 | `critic/c30_hc_5521_*.json`, `critic/c30_hft_5521.json` |
| R29-B2 (HO servedOther, HN) | **Fixed** (0 days on 13 seeds) | `critic/c30_ho_sum.txt`, `critic/c30_hn_4111.json` |
| R29-B3 (HO waitingPast, HWAIT) | **Largely fixed** (39,420 → 9,219 days, all with no port, the row says why); new problem R30-B2 | `critic/c30_ho_sum.txt`, `critic/c30_herowaits_*.log`, `critic/c30_hpos_4637_SOV.json` |
| R29-N1 (silent loss) | **Fixed** (R12) | `critic/c30_hd_4111_bis.json`, `critic/c30_hg_4111.json` |
| R29-N2, N3 (panel, tags read men) | **Fixed** | `critic/c30_hw_4111_*.json` |
| R29-N4 (land heroes starve) | **Unchanged**: 414 of 768 land-hero losses with no fight in the 24 h before (run 29: 437 of 824 counted with 24 h before; same measure) | `critic/c30_ho_sum.txt` |
| R29-N5 (sea heroes lost every ~8 months) | **Unchanged**: 22.9–35.1 losses per 20 years (Iowa 8.3) | `critic/c30_ho_sum.txt` |
| R29-N6 (hint on hover; hero hides the stack at T1) | hint **fixed**; the stack **unchanged** (HS identical) | `critic/c30_ht_phone.json`, `critic/c30_hs_3739.json` |
| R29-N7 (no checker rule for heroes) | **Fixed**: `heroBreaks` (row's nation, one formation a row, back within its hour with a place). It passes R30-B2 green: a hero back in the Caspian has a place | `critic/c30_wi_*.log` |
| R29-N8 (graph text, phone, bar wrap) | **Fixed** (above) | `critic/c30_rg_*.json`, `critic/c30_rgz_4111.json`, `critic/c30_p3_widths.json` |
| R29-N9 (bond's exit no truce, guarantees only the start's, five ticker rows a Force war, live "Propose alliance" refused, refused peace untold, phone clutter) | **Unchanged**: BX, BS ×4, PP, AL, PHZ identical; PG2 differs only in timing | `critic/c30_cmp.txt` |
| HO world figures, 10 seeds × 20 years, on vs off | Off: identical to run 29 (all ten JSONs). On: sea battles 347.9 vs 180.8 (+167 ± 11), ships sunk +798 ± 104, major land battles −36 ± 15, the rest within noise (wars +9 ± 9, capitals +28 ± 23, seven powers' land at year 20 +6.2 ± 3.5) | `critic/c30_ho_sum.txt` |
| LOY ×3, OR ×6, OR2, PR ×2, PZ ×4, EXIT ×3, ES, ES2 ×3, COBEL, BX ×3, BS ×4, BOTH ×5, AL, GU, PG ×2, TD, K, K2, K3, DR, BT ×2, CB, CB2, HU, HS, SX, SXT, EX2, FT, FP2, PL, P2, PH, PUP, PHZ, OS | **Identical** to run 29 (84 JSONs in all) | `critic/c30_cmp.txt` |
| Headless 7019 × 20, 1777 × 30, 8209 × 30 | Identical but for wall time | `critic/c30_headless_*.json` |
| Timing-only differences | A (a title button's id), AN (end tick, 18 h), C (one sortie), FO (1 px), G (fleet counts near a mark: the probe ran 16 min under load), Q (ticker), SB, U (one element), W, Z (±1 % elements), PG2 (one day), RW (the panel clicked) | `critic/c30_cmp.txt` |
| AN (AI strike in the page, 7019 year 20) | Not met, as run 29 (no strike in the 400 days probed) | `critic/c30_an_7019y20.json` |
| LW, ten years in the page | 6151 off / on, 4111 off / on: 59.8–60 fps every year, longest gap 84 ms, none over 500 ms, no page error | `critic/c30_lwdef_6151.json`, `critic/c30_lwhon_6151.json`, `critic/c30_lwhon_4111.json`, `critic/c30_lwdef_4111.json` |
| HSL, a save with a hero gone, loaded | The same hash after loading both times (1,227,506,378 at tick 4,000; another number than run 29's because the hero events are logged) | `critic/c30_hsl_4111.json` |
| HSC, heroes in a scenario file | As run 29 (11 alive, 3 returning, they return) | `critic/c30_hsc_4111.log` |
| Checkers on run 29's seeds (4421, 6863, 9907, 3331 × 10 years, 8209, 1777) | 0 broken, now with the heroes rules | `critic/c30_wi_*_h*.log`, `critic/c30_diploinv_*.log` |

## The checkers on new seeds

| Checker | Result | Evidence |
|---|---|---|
| `diploInvariants.ts 2861 scenario … --heroes`, `3373 random … --heroes` | 0 / 0 broken | `critic/c30_diploinv_2861s_h.log`, `critic/c30_diploinv_3373r_h.log` |
| `worldInvariants.ts 2861 730 --heroes` | 0 broken | `critic/c30_wi_2861_h.log` |
| **`worldInvariants.ts 3373 730 --heroes --diplomacy random`** | **2 broken**: "day 581: air: JAP's wing 1372 not at its base (-1130)", "day 601: air: ENG's wing 958 not at its base (-1057)". The same with `--rules air` alone. **Heroes off on the same seed: 0 broken.** WB: at tick 13,955 the Japanese carrier group 1130 stands 6.0 cells from where it stood the hour before, not engaged, and three wings (1372, 537, 1053) are left at its old place | `critic/c30_wi_3373r_h.log`, `critic/c30_wi_3373r_h_air.log`, `critic/c30_wi_3373r_noh.log`, `critic/scripts/c30_wingbase.ts` |
| **`worldInvariants.ts 5591 3650 --heroes`** | **2 broken**: "day 158: air: JAP's wing 1462 not at its base (-1130)", "day 831: air: NSP's wing 932 kept a base lost an hour ago (121)". **Heroes off, air rules, same seed: 0 broken** | `critic/c30_wi_5591_h10y.log`, `critic/c30_wi_5591_noh_air.log` |
| `heroWaits.ts` 4111, 4253, 4637, 7603 × 20 years | 0 broken each | `critic/c30_herowaits_*.log` |

## Dimensions

### Map visuals and readability: 7 (was 6)
- **Tested:** HC ×2, HCC, HF ×5, HFT, HT ×2, HW ×2, HV, HS, Z, CB, CB2, TG, PHZ, RW.
- **Why up:** the world view now draws every hero next to its place (≤ 33 px, desk and phone, start view and years
  later; `critic/c30_hc_5521_desk.json`, `critic/shots/c30hc_5521_desk_start.png`), and a hero's tag reads its health
  (`critic/shots/c30hw_4111_bis_1200m.png`). The rest of the map is run 29's (identical probes).
- **Not 8:** a fold carries the lead's flag and name only, so the Hood is a "+1" on a Soviet ball and Richelieu a "+2"
  on a German one; on a phone the five hero counters cover Britain's, France's and Germany's own tags
  (`critic/shots/c30hft2_5521_phone_start.png`); Japan's heroes sit under the Ranking panel at a desk's start view.
- **Fix:** fold only a nation's own heroes, or draw the members' flags on the fold; keep counters clear of the HUD.

### Diplomacy, war, alliance, puppet, revolt depth: 7
- **Tested:** HO servedOther ×13 seeds, HN, HRV ×4, heroWaits ×4, RG ×2, the diplomacy queue (all identical), the
  checkers on two new seeds.
- **Held at 7:** the heroes no longer cross sides; the graph's war line reads right. Unchanged from run 29: the bond's
  exit costs no truce, guarantees only the start's, live "Propose alliance" the sim refuses. A revived nation's heroes
  were not met (no revival in four 20-year runs).

### Emergent world dynamics over long runs: 7
- Heroes on vs off, 10 seeds × 20 years (`critic/c30_ho_sum.txt`): a busier sea (+92 % battles), a quieter land war
  (−21 % major battles), nothing else beyond noise. Heroes-off worlds identical to run 29.

### God Mode: 7
- God's Annex now ends a nation's heroes with it, as ADR-812 decides; no hero row is told for them (the annexation row
  is). Q, K, K2, K3, A identical or ticker-only.

### Editor and scenarios: 7 (carried)
- G, OS, OS2, HSC as run 29.

### Stats and history: 7
- R12 works in the page: the ticker row in the hour, History with its two kinds, Go to (`critic/c30_hg_4111.json`). Not
  8: the History and charts are otherwise run 29's.

### UI/UX and polish: 7 (was 6)
- **Why up:** each R11 item reads right where run 29 found it wrong, desk and phone: the Health row
  (`critic/shots/c30hw_4111_bis_panel.png`), the visible hint (`critic/shots/c30ht_phone_01_form1938.png`), the war
  line, the graph zoomed by touch to 15 px labels (`critic/shots/c30rgz_4111_tapnode.png`), the bar one row at 1024.
- **Not 8:** R30-B1 (phone folds unreachable); the first tap after a drag in the graph is eaten
  (`critic/c30_rgt_4111.json`); at T1 a hero hides the fleets under it (HS identical); a refused peace is still untold in
  the Actions tab.

### Performance: 7 (carried)
- Fresh: LW ×4, 59.8–60 fps, longest gap 84 ms; RW 60 fps; the heroes' fold costs nothing measurable.

### Stability: 7 (carried)
- No page error in any probe; 84 headless jobs, none crashed; a save with a hero gone reloads to the same hash.

### Semantic zoom to unit level: 8
- The hero's T1 marker and T2 tag read its health; Z, C, PHZ as run 29.

### Naval warfare: 8
- Sea heroes' waits down three quarters, each told. R30-B2 (the Soviet hero landlocked for years) is filed blocking.
  Held, as run 29 held it with B3: SB and G's sea battles as run 29, the rest of the navy's rules unchanged.

### Tanks: 8
- C, FT, FP2 identical; land heroes' starving unchanged (R29-N4).

### Aircraft: 8 (carried)
- W timing-only, PL identical. R30-B3 (air rules broken in two heroes worlds) is filed; the score is carried.

### AI nuclear use: 8 (carried)
- Heroes-off headless worlds identical to run 29's (their bursts with them); AN not re-met in the page.

## Blocking issues, in priority order

1. **R30-B2. Sovetsky Soyuz comes back in the Caspian Sea or on Lake Onega and never leaves.** `returnPlace`'s
   fallback (ADR-813: the water of the held port nearest the start) picks a port on landlocked water: Baku (4637),
   Atyrau (7603), Makhachkala (9001), Petrozavodsk (4111). The hero is never lost again and stays there to the run's
   end, 11,259 days in 4 of 13 seeds (4637: 12.8 years, no Soviet fleet within 600 km at any of 32 samples, the Soviet
   Union holding up to 17 ports). The checker's "back within its hour" passes it. Evidence:
   `critic/c30_seareturns.txt`, `critic/c30_seareturns_hx.txt`, `critic/c30_hpos_4637_SOV.json`,
   `critic/c30_ho_on_4637.json`, `critic/c30_ho_on_7603.json`, `critic/c30_hx_on_9001.json`. **Fix:** only ports whose
   water reaches the ocean (or the hero's start sea) count; failing that it waits, and its row says so; a checker rule
   that a sea hero stands in water it can sail out of.
2. **R30-B1. On a phone the folded hero counters hide three heroes that a tap cannot open.** At the start view (5521,
   390 × 844, touch) "Sovetsky Soyuz +1" holds HMS Hood and "Bismarck +2" holds TOG II and Char 2C; the panel opened by
   the first tap covers the counter, and closing it (× or Escape) starts the fold over at its lead, so Hood, TOG II and
   Char 2C are never reached. The fold also puts a hero under another nation's flag and name (the Hood ~2,900 km from
   the Soviet counter's centre, its "+1" off the screen's edge). R8's AT claims "a click on each opens that hero, desk
   and phone". Evidence: `critic/c30_hft_5521.json`, `critic/shots/c30hft2_5521_phone_start.png`,
   `critic/shots/c30hft2_5521_phone_tap2.png`, `critic/c30_hf_5521_desk_d0_0.json`. **Fix:** keep the cycle when the
   panel is closed and reopened by a tap on the same fold, or open a list of the fold's heroes; fold only one nation's
   heroes; keep the fold's label on screen.
3. **R30-B3. The checker's air rules break with heroes on, on two of seven new seeds.** 3373 (random diplomacy): wings
   of Japan's carrier group 1130 and Britain's 1057 not at their fleets (days 581, 601); 5591: Japan's wing 1462 not at
   carrier 1130 (day 158), Nationalist Spain's wing 932 kept a base lost an hour ago (day 831). The same seeds with
   heroes off: 0 broken. At the first break the carrier moved 6.0 cells in one hour, not engaged, and left three wings
   behind. Cause not shown. Evidence: `critic/c30_wi_3373r_h.log`, `critic/c30_wi_3373r_noh.log`,
   `critic/c30_wi_5591_h10y.log`, `critic/c30_wi_5591_noh_air.log`, `critic/scripts/c30_wingbase.ts`. **Fix:** find
   what moves a carrier six cells in an hour in a heroes world (the sea hero's sail-with-the-fleet order is the obvious
   suspect, not shown) and move its wings with it.

## Non-blocking issues
1. **R30-N1.** Land heroes still starve in about half their losses (414 of 768), and sea heroes are lost 23–35 times in
   20 years (R29-N4, N5 unchanged). `critic/c30_ho_sum.txt`.
2. **R30-N2.** At a desk's start view Japan's two heroes are drawn under the Ranking panel; a click on them opens a
   ranking row's nation. `critic/c30_hf_5521_desk_d0_0.json`.
3. **R30-N3.** In the relations graph on a phone, the first tap after a one-finger drag selects nothing.
   `critic/c30_rgt_4111.json`.
4. **R30-N4.** At T1 a hero still hides the fleets stacked with it (R29-N6's second half). `critic/c30_hs_3739.json`.
5. **R30-N5.** The option's hint still promises "come back 60 days after they are lost"; a sea hero with no port and a
   hero of a dead nation do not (the row tells why). `critic/shots/c30ht_phone_01_form1938.png`.
6. **R30-N6.** Unchanged from run 29 (R29-N9): the bond's exit costs no truce; guarantees only the start's; five ticker
   rows for one Force war; a refused peace untold in the Actions tab; phone clutter at 60 / 800 m/px; live "Propose
   alliance" the sim refuses. `critic/c30_cmp.txt`.

## Design objections (none blocking, no score lowered)
- A hero gone with its annexed nation (ADR-812) waits for a revival that did not come in any of four 20-year runs: the
  option's heroes are, in practice, lost with their nations. Defensible, but the player is told only "France was
  annexed".
- Run 29's objections stand (the heroes' AI tied to the largest fleet and to the nearest fight; the played nation's AI
  declares its own wars; a junior member's peace ends the whole war).

## Ideas from other games (not scored)
- Stacked named units in grand-strategy maps open a small list on click ("3 units here"), each with its flag, rather
  than cycling; that also solves a covered stack on a phone.

## Notes
- The heroes-on worlds of HEAD differ from run 29's by design (R9, R10), so run 29 → run 30 counts with heroes on
  compare like for like only as aggregates over the same ten seeds; heroes-off worlds are identical.
- The page probes ran while 7 headless sims were running; run 28 found such fps reads the same as quiet ones, and the
  LW figures match run 29's.
- PF (frame rates over a fight in 7019's year-20 save) was run last; as in run 29 the save holds no engaged formation at
  its hour (`critic/c30_pf_7019.json`: `fatal`, no fight found), not compared.
- No worktree was made; only port 5299 was used and stopped at the end.

## Strengths, verified
- **The fixes are real on the critic's own seeds:** 0 days served for another nation (13 seeds), sea-hero waits down
  from 39,420 to 9,219 days, each told in its row, and no hero counter more than one height from its place.
- **A hero's story is now told:** the ticker row in the hour it is sunk, its History kind, Go to to the place
  (`critic/c30_hg_4111.json`), and the formation panel's health bar.
