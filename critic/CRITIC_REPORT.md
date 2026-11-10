# Critic report, run 60 (focused): after batch 13 (R58b–R58d) and ADR-914

- **Mode: focused.** The spawning message did not ask for a full run, so the run is focused (CRITIC_PROMPT, ADR-915).
  - **Scored afresh:**
    - naval, which was under its bar and blocked in run 59;
    - `uiUxPolish`, because `src/ui/FormationPanel.tsx`, `ActionsTab.tsx`, `orderNewsText.ts`, `voyageText.ts`,
      `src/app/App.tsx` and `style.css` changed;
    - `diplomacyWarDepth`, because the Actions tab's war rows and peace reasons moved (R58d);
    - stability, because `src/worker/server.ts` and `src/shared/protocol.ts` changed.
  - **Carried** from run 59: the other ten dimensions, each marked "carried".
- **Commit judged:** `91d114240ee9f71e223d1866d61f40ca4d5c05f6`, HEAD at the start, clean tree (`critic/c60_commit.txt`).
- **What changed since run 59 (`fe9b0e9e`):**
  - `git diff --stat fe9b0e9e HEAD -- src/sim tools tests/helpers data public/data tests/sweep` shows one change to the
    sim: `nextVoyageHours` in `src/sim/systems/landings.ts`. It is a read, and the pin did not move.
  - The other changes are UI and worker-news code, plus the new `tools/diag/landingFuzz.ts`.
  - The sim being the same is shown below, not assumed: all 396 of run 59's landing setups give text-identical
    checker output on both commits.
- **ADR-914 (the user's decision) changes how naval is judged.** `slowClick` is blocking only when more than 5 % of this
  run's `landingInvariants` runs on new seeds break it. This, not a change to the build, is the main reason naval's
  score moves (see below).
- **Setup:**
  - Build: `vite build --outDir critic/c60_dist`, exit 0 (`critic/c60_build.log`).
  - Server: `vite preview` on 127.0.0.1:5360.
  - Browser: Playwright Chromium, 1600 × 900 unless a size is named.
  - At the end the server was stopped and every browser closed. The clean-up also stopped an old run-56 preview on 5298 and the npx wrapper of a `.cache/probe/dist` preview; that preview's server on 5358 is still up.

## Verdict

**Batch 13 did what it set out to do, and no checker breaks a blocking rule on new seeds.**

- **R59-N1 is fixed.** The division left for the next voyage is now told "in about N days". Over 119 tellings on 42
  seeds the figure comes true within a day in 45 of the 47 cases where the division later sailed.
- **R59-N2 is fixed.** A kept panel notice now carries its date and turns grey after three days.
- **The refused-peace reason is whole on a phone on its side,** at six sizes.
- **R59-B1's case still breaks on HEAD,** as expected, because the sim is the same. It is now non-blocking under
  ADR-914: the rate is **1 of 300** `landingInvariants` runs on new seeds (0.3 %), against a 5 % threshold.
- **No other checker broke:**
  - landingRows: 115 cases, 0 broken;
  - diploInvariants: two new 10-year runs, 0 broken;
  - workerDeterminism: the same hash on all four arms;
  - stuck-return: 153 runs, 0;
  - seaBattlesLook: 43 of 45 on its pass. t6243 is seen when looked at alone at its own hour. t17369 is a record with
    no fleet left to draw (the Dutch side's 9 ships were all sunk that hour); it is filed as R60-N5.
- **Naval reaches its bar (8)** for the first time since run 53.
- **Two new truth problems in the next-voyage figure** (R60-N1, R60-N2) and two small UI items are non-blocking.

## Scores

| Dimension | Run 59 | Run 60 | |
|---|---|---|---|
| Map visuals and readability | 8 | 8 | **Carried** from run 59 (focused run; no map code changed). |
| Diplomacy, war, alliance, puppet, revolt depth | 8 | 8 | **Re-earned.** <ul><li>diploInvariants **0 broken** on new 31301 (random diplomacy, 10 y, 456 s) and 31303 (heroes, 10 y) (`critic/c60_diploinv_31301.log`, `critic/c60_diploinv_31303.log`).</li><li>The peace button, Germany against Poland on 30403, at 844 × 390, 390 × 844, 667 × 375, 740 × 360, 1024 × 500 and 932 × 430:<ul><li>day 0: grey, and a click does nothing (3 wars before, 3 after);</li><li>the reason is in a line under the war row;</li><li>day 35: enabled, pressed, and "Germany made peace with Poland" appears (`critic/c60_pb_30403_*.log`, `critic/shots/c60pb_30403_GER_POL_844x390_disabled_d0.png`).</li></ul></li><li>Ten declarations at 844 × 390: seven war rows, each with its reason, all reachable by scrolling, the last one clickable (`critic/c60_mw_31201_GER_844x390.json`, `critic/shots/c60mw_31201_GER_844x390_last.png`).</li></ul> **Not 9:** alliances still ignore the map (old). With seven wars the same 80-character reason is repeated seven times (`critic/shots/c60mw_31201_GER_1600x900_top.png`). |
| Emergent world dynamics | 8 | 8 | **Carried.** |
| God Mode | 8 | 8 | **Carried.** God's breakthrough on a phone was re-run: the corridor is drawn on day 6 (`critic/shots/c60new_corridor_30307_390x844_d6_1500m.png`). |
| Editor and scenarios | 8 | 8 | **Carried.** |
| Stats and history | 8 | 8 | **Carried.** |
| UI/UX and polish | 8 | 8 | **Re-earned.** <ul><li>**R59-N2 fixed (R58c):** 27125 at h400, 323 "On the march" under a grey "6 January 1938 … the landing is over"; at h140, 319's notice "5 January 1938 …" is still in orange (`critic/shots/c60wt_27125_323_h400.png`, `critic/c60_whotold_27125_{140,400}.log`).</li><li>**R59-N1's words (R58b):** 31211, twelve Italian divisions sent from Rome to Valletta.<ul><li>323's panel: "At Rome: no room on the transports that sailed; they come back for it in about 2 days".</li><li>Its dated notice from 3 January says 4 days; that is consistent, since two days have passed.</li><li>The ticker: "328: next voyage in about 6 days" (`critic/shots/c60wt_31211_323_h114.png`, `critic/c60_nvpage_ITA_31211_12_1600x900.json`).</li></ul></li><li>**R58d:** the Actions tab at a landscape phone size puts diplomacy and the wars on the left from the top (`critic/shots/c60pb_30403_GER_POL_844x390_disabled_d0.png`).</li><li>0 page errors in every c60 page probe.</li></ul> **Not 9:** R60-N3 (undated ticker rows with a relative "in about N days" go stale); R60-N4 (the panel's foot sits under the bottom bar at landscape sizes from 667 × 375 to 1024 × 500); the phone's nation panel still covers the corridor (old). |
| Performance | 8 | 8 | **Carried.** The tick is unchanged: no rule was added, and `nextVoyageHours` runs only for the panel and the news. |
| Stability | 8 | 8 | **Re-earned for the worker change.** <ul><li>`workerDeterminism 31401` (a new seed, one year, every query after each 24-hour chunk, which includes each formation's panel): `c25ee058` on the plain, quiet, start and every arms (`critic/c60_wd_31401.log`).</li><li>0 page errors in the 35 page runs (Malta's 18, the peace and war probes, the next-voyage probes).</li><li>The save and load case from run 59 is carried (the sim is unchanged).</li></ul> |
| Semantic zoom to unit level (needs 8) | 8 | 8 | **Carried.** |
| **Naval warfare (needs 8)** | 7 | **8** | **At its bar. The score moves because of ADR-914's rule, not because the landing sim changed.** See below. |
| Tanks (needs 8) | 8 | 8 | **Carried.** |
| Aircraft (needs 8) | 8 | 8 | **Carried.** |
| AI nuclear use (needs 8) | 8 | 8 | **Carried.** |

### Naval in detail

**Why the score moves.** Run 59 held naval at 7 for one reason only: R59-B1, a `slowClick` break that was blocking
under that run's brief. Run 60's brief (ADR-914) makes `slowClick` blocking only above 5 % of runs on new seeds.

- On 300 runs on new seeds (31001–31099, six shapes each) the rate is **1 of 300 (0.3 %)**: 31099, setup 3517, g1,
  "t908's click of 366 ashore after 17.0 days, its best way 10.0" (`critic/c60_li/new_31099_3517_g1_od-.log`).
- No other rule kind broke in any of the 300 (`critic/c60_liab_new.log`).
- These seeds were not run on run 59's commit ("new seeds, not compared"). The sim is the same, so the figure would be
  the same there.

**The same cases on both commits.**

- All 396 of run 59's setups (its 306 and its 90 new ones), on HEAD, match run 59's logs **text for text in all 396**
  (`critic/c60_li/named_*`, compared with `critic/c59_li/{head,new}_*`).
- 395 are at 0. The one break is R59-B1's 30041 g1, unchanged.
- 366's trace on 30041 is line for line the same as run 59's (`critic/c60_h366d_30041.log`).

**R59-B1's bar, item by item.**

- (i) `landingInvariants 30041 3517 120 30041 30,90 1`: **still 1 broken** (`critic/c60_li_30041_g1.log`). Under
  ADR-914 this is a non-blocking issue: the seed is old, and the rate on new seeds is under 5 %.
- (ii) The 90 and 306 setups: 395 of 396 at 0.
- (iii) 366's walk: unchanged.
- (iv) The R58-B1 and R57-B1 cases:
  - 29043 15101: 0 (`critic/c60_li_29043_15101.log`);
  - 28037 od8: 0 (`critic/c60_li_28037_od8.log`);
  - 28039 g1: 0 (`critic/c60_li_28039_g1.log`).
  - `c60_sr` (153 runs): 0 spells, checker 0 (`critic/c60_sr.log`).
  - Malta's 18: the same 12 thrown back near Catania and 6 broken off near Palermo, in the same words
    (`critic/c60_malta.log`).

**Fresh evidence on new seeds.**

- **Sea battles.** `seaBattles 31501` over 2 years: 45 battles (`critic/c60_sb_31501.log`). `seaBattlesLook`: 43 of 45
  on the first pass.
  - t6243 ENG v ITA was looked at 14 hours late, after the tool had first stepped to the next battle in its list. Looked
    at alone at its own hour it is seen, with 96 English and 16 Italian ships (`critic/c60_sbl_31501_two.json`).
  - t17369 NED v USA is listed with **no fleets**, so it cannot be looked at.
    - It is the last hour of t17358–17369 (USA v FRA at 964.5,365.5), which was seen with both sides.
    - The Dutch fleets there (431, 1226 and 1227: 4 + 1 + 4 ships) are all sunk that hour ("lost 9/0").
    - The American fleets are about 17 cells off at 969.5,349.5, outside the listing's 16-cell search
      (`critic/c60_sb_31501.json`, its `battles` and `sinkings`).
    - Nothing was left to draw. The tool still exits red: R60-N5.
  - 0 page errors.
- **A player's landing that succeeds, on a new seed (page):** 31213, Japan's ten nearest divisions sent from Tokyo to
  Shanghai. The bar reads "sails in about 7 days", counts down, then "1 of 4 at sea" and "at sea: lands in about 4 days",
  and at h264 "over: 4 landed" (`critic/c60_nvpage_JAP_31213_10_1600x900.json`). 0 page errors.
- **28061 over three years:** 37 sea battles, the same as run 59. Japan's are in the Norwegian Sea and the Sea of Japan
  only (`critic/c60_sb_28061.log`).
- **landingRows `all`:** 115 cases, 20,321 hours, 0 broken (`critic/c60_lrows_all.log`).
- **R58b's figure across many runs:** `critic/scripts/c60_nv.sh`, 168 runs on 29043, 30041 and 31101–31179 × 4 shapes
  (`critic/c60_nv_all.txt`).
  - 119 panels said "next voyage", all with a figure.
  - 47 of those divisions later sailed. The error (actual minus told) runs from −0.9 to +4.5 days, median −0.3; **45 of
    47 are within a day**.
  - The other 72 were re-ordered or still waiting at the end.
  - The two misses are R60-N1 and R60-N2.
  - **Not tested for truth:** the figure in the news for a division that is still marching. `server.ts` computes it as
    the later of the march and the next voyage. It was seen ("328: next voyage in about 6 days"), but no such division
    was followed to its sailing.

**Not 9:**

- R60-N1 and R60-N2;
- Malta is never taken (18 of 18);
- the open `slowClick` tail: 30041, 31099, and the builder's own 203997 and 204017. The builder's two were re-run here
  and still break (366 and 367: 12.6 days against a best way of 5.6; `critic/c60_li_203997.log`,
  `critic/c60_li_204017.log`).

## Blocking issues

None. The run found no blocking break:

- `slowClick` is at 1 of 300 on new seeds, under ADR-914's 5 %;
- every other checker run is at 0;
- page errors are 0.

## Non-blocking issues (prioritised)

1. **R59-B1 / R60-SC (naval; the `slowClick` tail, under ADR-914's rate).**
   - **This run's new break:** 31099, setup 3517, one group. "t1315 slowClick: t908's click of 366 not ashore after
     17.0 days, its best way 10.0" (`critic/c60_li/new_31099_3517_g1_od-.log`; `npx tsx tools/diag/landingInvariants.ts
     31099 3517 120 31099 30,90 1`).
   - **R59-B1** (30041, 9.5 days over) is unchanged.
   - Both are Japan's 366, from Tokyo, one group. The same division and port appear in the builder's 203997 case, so
     the pattern is probably the same.
   - **Fix:** ADR-914's proposal 2, one time budget per click, is still held for the user.
2. **R60-N1 (naval/UI): "they come back for it in about a day" for 4.3 days, with an empty transport group idle at the
   same port.**
   - The case: 31173, setup 3517, two groups. Japan's 366 reaches Tokyo at t836, and its panel reads `nextVoyage` 1
     from t836 to t933.
   - Throughout, group 1144 lies **empty and still at the port** (1819.5,386.5, mv0). `nextVoyageHours` returns 0 for
     it ("an empty group there"), so the panel says about a day.
   - 1144 does not take 366 until the other group (1136) reaches its beach near Shanghai at t934. 366 boards at t935:
     **4.3 days** after "about a day" (`critic/c60_nvtrace_31173_366.log`, `critic/c60_nv/31173_3517_g2.log`;
     `SEED=31173 SETUP=3517 KEEPG=2 DIV=366 FROM=800 TO=940 npx tsx critic/scripts/c60_nvtrace.ts`).
   - Either the figure is wrong (it should count what holds the empty group), or the rule is (an empty group at the
     port with a division waiting should sail).
3. **R60-N2 (naval): the transports come back for it, and leave again without it.**
   - The case: 31127, setup 15101, one group. 272 is told "next voyage, about 4 days" at t432.
   - Its group (1069) comes back near the port by t503, then sails again at t515 without 272, which is told 5 days.
   - 272 sails at t626, **8.5 days after "about 4 days"** (`critic/c60_nvtrace_31127_272.log`,
     `critic/c60_nv/31127_15101_g1.log`).
   - The figure is honest for each voyage, but "they come back for it" is broken once.
4. **R60-N3 (UI, new with R58b): ticker rows with a relative figure are undated and go stale.**
   - The case: 31211. "328: next voyage in about 6 days" and "329: … about 9 days", told at h60 (3 January), are still
     in the ticker unchanged at h114 (5 January), when 328's panel reads "about 4 days"
     (`critic/shots/c60wt_31211_323_h114.png`, `critic/c60_nvpage_ITA_31211_12_1600x900.json`).
   - War rows in the same ticker carry a date; order rows do not.
5. **R60-N4 (UI, small): at landscape sizes the nation panel's lower edge runs under the bottom bar.**
   - The shots at 667 × 375, 740 × 360, 932 × 430 and 1024 × 500 show the row at the panel's foot half hidden behind the
     bar (`critic/shots/c60mw_31201_GER_667x375_last.png`, `critic/shots/c60pb_30403_GER_POL_740x360_disabled_d0.png`,
     `critic/shots/c60pb_30403_GER_POL_932x430_disabled_d0.png`, `critic/shots/c60pb_30403_GER_POL_1024x500_disabled_d0.png`).
   - Judged from the shots; not measured.
6. **R60-N5 (naval, small): `seaBattlesLook` goes red on a battle it cannot judge.**
   - `seaBattles 31501` lists t17369 NED v USA with no fleets: the Dutch side was all sunk that hour, and the Americans
     were outside the 16-cell search.
   - `seaBattlesLook` reports it NOT SEEN (exit 1), although the map shows nothing wrong. The same battle's previous
     hours (t17358) are seen with both sides.
7. **Old, unchanged:**
   - 27125 h140: the ticker keeps three of the four "came ashore near Palermo" rows; 319's row is only in its panel
     (`critic/c60_wt_ITA_27125_h140.json`).
   - On a phone the nation panel covers the breakthrough corridor (`critic/shots/c60new_corridor_30307_390x844_d6_1500m.png`).
   - The corridor probe's default 1500 m camera at 390 px misses Berlin (the probe's issue; run with `CORRM=3000`).

## Run 59's cases re-run

| Run 59 case | `fe9b0e9e` (run 59) | HEAD `91d11424` | Evidence |
|---|---|---|---|
| **R59-B1** `landingInvariants 30041 3517 120 30041 30,90 1` | 1 broken (blocking) | 1 broken, the same line; **non-blocking** under ADR-914 (old seed, rate on new seeds 1 of 300) | `critic/c60_li_30041_g1.log` |
| R59-B1 (ii) `c59_liab_new.sh` (90) and `c59_liab_head.sh` (306) | 1 of 396 | 1 of 396; **all 396 logs text-identical** to run 59's | `critic/c60_liab_named.log`, `critic/c60_li/named_*` |
| R59-B1 (iii) 366's walk `c59_h366d` | 11 cells in 10.4 days | the same, line for line | `critic/c60_h366d_30041.log` |
| R59-B1 (iv) R58-B1 / R57-B1 cases, `stuckret`, Malta | 0, 0, 0; 153 at 0; 12 + 6 | 0, 0, 0; 153 at 0; 12 + 6 in the same words | `critic/c60_li_*.log`, `critic/c60_sr.log`, `critic/c60_malta.log` |
| **R59-N1** 29043's 273, "waits for the next voyage", no figure | no figure | told 5 days at t1170; sails t1284 (4.8 days); 45 of 47 within a day on 42 seeds | `critic/c60_nv/29043_15101_g2.log`, `critic/c60_nv_all.txt` |
| **R59-N2** 27125 h400, 323's notice in orange 11 days on | undated, orange | "6 January 1938 …", grey | `critic/shots/c60wt_27125_323_h400.png` |
| Small: the peace line cut at 844 × 390 (30403) | cut at the panel's foot | whole, at six sizes | `critic/shots/c60pb_30403_GER_POL_844x390_disabled_d0.png` |
| Small: 27125 h140 ticker, 3 of 4 rows | 3 of 4 | 3 of 4 | `critic/c60_wt_ITA_27125_h140.json` |
| Small: phone corridor 30307 | covered by the panel | covered | `critic/shots/c60new_corridor_30307_390x844_d6_1500m.png` |
| 28061's sea battles over 3 years | 37 | 37 | `critic/c60_sb_28061.log` |
| landingRows all | 115 cases, 0 | 115 cases, 0 | `critic/c60_lrows_all.log` |

## Design objections (none blocking, no score lowered)

- **ADR-914's rate makes the long tail of `slowClick` permanent.** The builder's own fuzz found 2 of 300 breaks, both
  re-run here and still broken, and this run found 1 of 300. All of them are Japan's 366 or 367 from Tokyo, one or two groups. A player who sends Japan's
  army from Tokyo meets this every few games. The threshold is the user's call, but the cases look like one cause, not
  noise.
- **`slowClick` judges a click by its first division ashore** (from run 59); R60-N2's 272 is the other side of that.
- **Malta is never taken** (18 of 18).

## Ideas from other games (not scored)

- Hearts of Iron's naval invasion screen shows each division's state with a time. Warism now does this, and R60-N1
  shows the time should come from what the transports will actually do.
- Paradox outliners date every notification. The ticker's order rows could carry the date as the war rows already do
  (R60-N3).

## Strengths (verified)

- **R58b's figure is mostly true:** 45 of 47 within a day on 42 seeds, with a median error of −0.3 days
  (`critic/c60_nv_all.txt`).
- **The sim did not move under a UI batch:** all 396 of run 59's landing setups give text-identical checker output, and
  workerDeterminism gives the same hash on every arm with every panel query between steps.
