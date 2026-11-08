# Critic report, run 52 (focused): after Batch 5 (R48a–g, R49a–b)

- **Mode: focused.** I decided this from git before anything else (CRITIC_PROMPT, ADR-804). All three conditions hold:
  - the last report (run 51, `247778c0`, on `14a85a51`) has a score under its bar: naval 7 (bar 8);
  - every commit since is one of the two kinds. `095d5fb8`, `b9433d38`, `22792d2c`, `c6bfd5e1`, `7711be2c`,
    `82a19dc4` and `bca1d5b4` name R48a–R48g, and `9fe9fae1` and `0b3dd6e1` name R49a and R49b. All nine items were
    filed by `247778c0`'s own ROADMAP diff. `d8dba302` (the replay of run 51's probes) changes no file under `src/`,
    `data/` or `public/`;
  - the last three reports were not all focused: run 51 full, run 50 full, run 49 focused.
- **What is scored afresh.**
  - Naval: it was under its bar.
  - The dimensions the changed files touch (`git diff --stat 14a85a51 HEAD -- src data public`: 19 files, +356 −82):
    - UI/UX: `LandingsBar.tsx`, `landingStatus.ts`, `style.css`, `hud.ts`;
    - stats and history: `HistoryPanel.tsx`, `historyRows.ts`, `shared/history.ts`;
    - God Mode: `tick.ts`'s `forceBreakthrough`, `events.ts`, `sound.ts`;
    - stability: R48a changes one sim rule in `landings.ts`.
  - Every other score is carried and marked so. A defect met in passing still counts.
- **Commit judged:** `d8dba302b941c8b4085ecfe33fbd2f8f2f16483b`, HEAD at the start, with a clean tree
  (`critic/c52_commit.txt`). **Date:** 2026-11-07.
- **Build:** `vite build --outDir critic/c52_dist`, exit 0 (`critic/c52_build.log`). Served by `vite preview` on
  127.0.0.1:**5352**. I stopped it at the end, and no node or browser of mine is left running. Driven through
  Playwright Chromium at desk 1600 × 900, phone 390 × 844 and a landscape phone 844 × 390.
- **Runs.**
  - **Headless, replay:** run 51's 65 jobs again on the same seeds, plus one new seed for each of their 19 families.
    That is `tools/diag/replayCritic.ts --run 51 --new 1 --jobs 5 --out critic/c52_replay`; the summary is in
    `critic/c52_replay/REPORT.md` and `critic/c52_replay.log`.
  - **Headless, my queue (34 jobs, 3 at a time):** `critic/scripts/c52_jobsQ.txt`; the exits are in
    `critic/c52_q_q.done`.
    - Run 51's new-seed cases: diploInvariants 21001, 21009, 21011, 21013; landingInvariants 21021–21031; far routes
      21041–21047; worldInvariants 21051, 21053, 21055; workerDeterminism 21059; `landingRows far`.
    - Fresh seeds: landingInvariants 22021–22033 (7 seeds); diploInvariants 22001 (random), 22003 (scenario, heroes),
      22005 (random world); workerDeterminism 22059; worldInvariants 22051 (ten years); `landingRows all`;
      seaBattles 22061.
    - 7019 for 20 years, saved to `critic/c52_seed7019_y20.bin`.
  - **Page, one at a time** (`critic/scripts/c52_suiteP.sh`, then the save's probes):
    - every one of run 51's landings-bar cases (20861, 20661, 20863, 21101, 21103, 21105, 21107) and its cancel at
      sea (`c52_cancel_page.mjs 20661 … 26 240`);
    - the lost-transports rows (3517: desk, phone, landscape, six-row phone), History's order (20429), and
      Breakthrough at war (21151) and at peace (20879);
    - God tools 20875, and the sea battle at R46's camera (20885, t107);
    - new seeds: bars 22101 (landscape, cancel at sea), 22103 (desk), 22105 (phone, cancel at sea) and 22107 (Malta,
      three divisions); Breakthrough at war 22151; God tools 22119; God nuke 22117; sea click 22113; touch, UI, phone;
      save and load 22137;
    - on 7019's year-20 save: History, AI nukes and export.
  - **New probes of mine:**
    - `critic/scripts/c52_lbox.mjs`: R48c's claim measured by the cancel's and each division's box (inside the
      viewport, inside the bar, the topmost element at its centre), with every scroll reset. Playwright's click
      scrolls, so c52_lbar alone would pass a hidden button.
    - `critic/scripts/c52_lland.mjs`: the page's bar, the order news and each division's place every 2–6 hours,
      with shots where the row ends.
    - `critic/scripts/c52_dest.ts`: headless. Where a landing comes ashore against the place clicked, with the
      owner of the cell, the transports, and the fleets near them.

## Verdict

**R48 and R49 do what their ADRs say on the cases those ADRs name, and every checker reports 0 broken. But the
landings bar's last line, the outcome of a landing, is false on three of my cases. Two of those are run 50's and
run 51's own named cases. That is one blocking issue (R52-B1).**

- **R52-B1. The row's outcome contradicts what happened, and the order news beside it.**
  - "over: lost at sea" is shown for divisions that are alive inland. Their transports were sunk before they
    boarded.
  - "over: 2 landed" is shown for a landing whose transports broke off. The divisions came ashore on Sicily, not at
    Valletta.
  - It has been there since R47a (`760140ff`). Runs 50 and 51 had it on the screen and missed it
    (`critic/shots/c51lost_desk_rows.png`).
- **R48f's "one click, one row" holds while the landing runs but comes apart as it ends (R52-N2).** On 20861 the
  row goes "2 landed" → "1 landed" + "1 landed" → "1 landed". It never says "3 landed".
- **Fixed:** R51-N1 to R51-N7, each on its own case (see "Run 51's cases re-run").

**Scores.**

- **Up:** God Mode to 8. R51-N4 was its only reason not to be 8, and Breakthrough at war is now told, on 21151 and
  on new 22151.
- **Naval stays at 7 (bar 8),** now with a blocking issue.

## Scores

| Dimension | Run 51 | Run 52 | |
|---|---|---|---|
| Map visuals and readability | 8 | 8 | **Carried.** Not touched by Batch 5. In passing, the R48c bar on a landscape phone no longer covers the map's middle with a cut list: the open row's four lines and its cancel fit (`critic/shots/c52lbox_eng_br4_21103_844x390_d0.png`). |
| Diplomacy, war, alliance, puppet, revolt depth | 7 | 7 | **Carried.** <ul><li>Checkers on new seeds, as the brief asks: diploInvariants 0 broken on 22001 (random), 22003 (scenario, heroes) and 22005 (random world, 5 years) (`critic/c52_diploinv_22*.log`), and on run 51's 21001, 21009, 21011 and 21013.</li><li>Run 51's 18 jobs again: see the replay row.</li></ul> **What the bar needs:** as run 51 said: on 20887 and 21129 (`critic/scripts/c52_rg_relations.mjs <seed> 365 1600 900 desk '&heroes=on'`), no war chip at day 365 with one side more than 4 times the other's count of nations. |
| Emergent world dynamics over long runs | 7 | 7 | **Carried.** Not touched (R48a's sim change is player-only: 7019's year-20 hash is `6a8590fe`, the same as runs 50 and 51, `critic/c52_seed7019_save.log`). **What the bar needs:** as run 51 said: `node critic/scripts/c48_top.cjs` on 21099 (25 years) and 20899, with no top-5 holder within ±0.2 % of the same share for 20 or more years. |
| God Mode | 7 | **8** | **Up: run 51's one reason (R51-N4) is gone.** <ul><li>**R49a:** at war (21151, Germany on Poland, Breakthrough from Berlin to Warsaw), the ticker tells it from the click's hour: "1 January 1938 God opened a breakthrough for Germany". Fighting follows: engaged 0 → 4 on day 1, 19 on day 3 and 54 on day 7 (`critic/c52_kw_21151.json`, `critic/shots/c52kw_21151_00_breakthrough_clicked.png`; run 51: nothing in the hour or on day 1).</li><li>The same on new seed 22151: told, engaged 0 → 49 by day 7 (`critic/c52_kw_22151.json`).</li><li>At peace it is still refused with its reason (`critic/c52_k_20879.json`).</li><li>Revolt, Spawn ("Free Greater Poland Voivodeship"), Found and Raze each have their ticker row on 20875 and new 22119 (`critic/c52_q_20875.json`, `critic/c52_q_22119.json`).</li><li>The H-bomb on Paris and the A-bomb on London on new 22117 each have their alert and "Go to", with no error (`critic/c52_a_22117.json`, `critic/shots/c52a_22117_13_paris_h_strike.png`).</li><li>No page error on any God probe.</li></ul> **Not 9:** <ul><li>The row has no place in it: "for Germany", not "near Berlin", on both seeds, though the click was 3 cells from Berlin. ADR-864 allows "or without the city", but `nearestCity` always returns a city, so the name is lost somewhere (`historyRows`'s `city()` returns '' for it).</li><li>The corridor itself is still not drawn (ADR-864 chose not to).</li></ul> |
| Editor and scenarios | 7 | 7 | **Carried.** **What the bar needs:** as run 51 said: `node critic/scripts/c52_os2_scen.mjs critic/c26_critic_standoff.warsim-scenario c52` loads the run-26 file, or says what it changed to load it. And the editor's nation list is searchable or grouped. |
| Stats and history | 8 | 8 | **Rescored.** <ul><li>**R49b (R51-N5) fixed:** on 20429 (random diplomacy) History's 1 July 1939 hour now reads "Dutch East Indies was freed from Netherlands" above its two "left its war" rows, as the ticker does (`critic/shots/c52rise_20429_history.png`; run 51: the release under them).</li><li>On 7019's year-20 save (hash `6a8590fe`, the same world as runs 50 and 51), History opens in 174 ms with 3,714 events of 28 kinds. Newest hour first; within 25 December "A major battle began near Tangier" sits above the older hour's "was won" (`critic/c52_hi_7019.json`; run 51: 128 ms, the same count).</li><li>The CSV has 3,716 lines and the JSON 37,142 (`critic/c52_dl_7019.json`).</li><li>The nuke charts draw on 22117 (`critic/shots/c52a_22117_33_chart_*.png`).</li></ul> **Not 9:** the fix is of an order fault, not a new reach. History still has no "show only my wars" and no link from a row to the war chip it belongs to (see Ideas). |
| UI/UX and polish | 7 | 7 | **Rescored.** **Better:** <ul><li>**R48c (R51-N3):** at 844 × 390 on 21103 (four divisions), with every scroll reset, the cancel and all four division lines are inside the viewport, inside the bar and the topmost element at their centres, on each of days 0–4 (`critic/c52_lbox_eng_br4_21103_844x390.json`, `critic/shots/c52lbox_eng_br4_21103_844x390_d0.png`; run 51: the cancel was below the 156 px fold).</li><li>**R48g:** on the phone, the order closes the nation's panel and the bar is seen (`barVisibleWithNationPanel: true` on 21107 and on ADR-863's own 21101: `critic/c52_lbar_ger_norwich3_phone_21107_390.json`, `critic/c52_lbar_jap_sh3_phone_21101_390.json`, `critic/shots/c52lbar_ger_norwich3_phone_21107_390_nationpanel.png`; run 51: false).</li><li>**R48d:** a row at sea says how long: "at sea: lands in about 4 … 3 … 2 … a day" on 20861, and they land on day 5 (`critic/c52_lbar_jap_sh3_20861_1600.json`).</li><li>Touch, UI and phone probes and save and load: no page error (`critic/c52_tm_touch.json`, `critic/c52_u_1600_5557.json`, `critic/c52_p.json`).</li></ul> **Not 8:** <ul><li>**R52-B1:** the bar's outcome line says "lost at sea" and "landed" when neither is true, beside an order-news line that says otherwise (Naval row).</li><li>**R52-N2:** one click's row breaks up as its landings end.</li><li>**R52-N3:** "lands in about a day" for four days running on 21105.</li></ul> **What the bar needs:** <ul><li>`STEP=3 node critic/scripts/c52_lland.mjs 22103 GER ENG 1100.5,267.5 1031.5,266.5 2 ger_norwich 130`: from t90, the row does not say "lost at sea" while its two divisions stand inland. It says what the news says: transports sunk, the landing over.</li><li>`STEP=2 node critic/scripts/c52_lland.mjs 20861 JAP CHI 1818.5,385.5 1715.5,413.5 3 jap_sh3 200`: one row from t1 to its end, ending "over: 3 landed".</li></ul> |
| Performance | 7 | 7 | **Carried** (no render or sim-cost change). In passing: 7019's 20 years ran at a mean of 3.76 ms a tick headless, with 3 jobs beside it (`critic/c52_seed7019_save.log`; run 51: 3.38 alone). The touch probe kept 59–60 fps with a selection (`critic/c52_tm_touch.json`). **What the bar needs:** as run 51 said: `node critic/scripts/c52_pf_lookfps.mjs 7019 critic/c52_seed7019_y20.bin`, alone, at 45 fps or more at 120 m/px in both looks. |
| Stability | 8 | 8 | **Rescored on new seeds** (R48a changed one sim rule). <ul><li>**Save and load in the page (22137, new):** saved at t4800 (hash 2128813405) and run 200 days: 641843715. Loaded twice and run 200 days each time: 641843715 both times (`critic/c52_sl_plain_22137.json`).</li><li>**7019's 20-year hash** is `6a8590fe`, as in runs 50 and 51, so the rule did not leak into the AI's world.</li><li>**workerDeterminism:** 3517 and 20859 the same as run 51 (replay); 21059 `0a7a7477` as in run 51; new 22059 `330ff6a9` and 61801 `eea62f05` the same on every arm (`critic/c52_wd_*.log`).</li><li>**worldInvariants:** 0 broken on 21051, 21053, 21055 (ten years) and new 22051 (ten years).</li><li>**No page error** in any c52 JSON.</li><li>The far routes 21041 and 21045 land at the same hours as run 51 (`critic/c52_far_21041_jap_sh3.json`, `critic/c52_far_21045_eng_bremen4.json`).</li></ul> |
| Semantic zoom to unit level (needs 8) | 8 | 8 | **Carried.** In passing, the sea battle at R46's camera on 20885 (t107) is drawn with 24 elements at 250 m/px, 22 at 60 and 16 at 25, in both looks (`critic/c52_sb_20885.json`, `critic/shots/c52sb_20885_60m_balls.png`). |
| Naval warfare (needs 8) | 7 | **7** | **Rescored.** **Fixed, each on run 51's own case:** <ul><li>**R48a (R51-N1):** 21107, three divisions from Berlin to Norwich, cancelled on day 3. Before the next day's sample the row reads "cancelled: stopped where they stood; the AI commands them again". A day on, they stand within a cell of where they were at the cancel (1094.6, 264.5; 1093.9, 264.1; 1093.5, 262.5). The AI then walks two of them off, as the row says (`critic/c52_lbar_ger_norwich3_phone_21107_390.json`, `critic/shots/c52lbar_ger_norwich3_phone_21107_390_cancel.png`; run 51: "back at Hamburg" for a week of marching). The tooltip: "Those at sea sail to Hamburg with their transports; those ashore stop where they stand".</li><li>**R48b (R51-N2):** 20661, cancelled at hour 26. 364 is shipped again by the AI at h216, and its panel says "At sea with the AI's landing (not one of yours)" to h240, with no row (`critic/c52_cancel_page_20661.log`). The same on new 22105, cancelled at sea on day 4: on day 8 all three say so (`critic/c52_lbar_eng_br3_phone_22105_390.json`).</li><li>**R48e (R51-N7):** the words are now "to land within a day of", and 21041's three land at t119, t129 and t131 (`critic/c52_far_21041_jap_sh3.json`).</li><li>**R48d (R51-N6):** never "waits for" on 20861.</li><li>Every checker: 0 broken (below).</li><li>The sea battle is drawn (Semantic zoom row).</li></ul> **Not 8, and blocking: R52-B1.** The bar's one line that tells a landing's result is false in two ways that R47a's tally (`server.ts`: `TransportsSunk` counted as `lost`, every `FormationLanded` as `landed`) makes systematic: <ul><li>**"lost at sea" for divisions alive on land.** New 22103: Germany, two divisions from Berlin to Norwich, transports sunk at t90 while the two still marched to Hamburg. The row reads "Norwich from Hamburg · over: lost at sea". The order news beside it reads "2 divisions: the transports of their landing were sunk, and no others can come to their port: the landing is over (Infantry division 1, Infantry division 4)". Both divisions are inland near Berlin, at full strength (`critic/c52_lland_ger_norwich_22103.json`, `critic/shots/c52lland_ger_norwich_22103_over_1500m.png`). And on run 50's own case 3517 (Japan, the groups removed): "Shanghai from Tokyo, Ōsaka · over: 2 landed, 1 lost at sea", while 366 stands on land at 1783.9, 392.5 and its news says "366: transports sunk, the landing is over" (`critic/c52_lost_desk.json` `afterSink`, `critic/shots/c52lost_desk_rows.png`; the same in run 51's `critic/shots/c51lost_desk_rows.png`).</li><li>**"landed" for a landing that broke off.** 21105 is run 51's Malta case, which run 51 counted as a strength. The row reads "Valletta from Rome · over: 2 landed". The news reads "Infantry division 319: its transports broke off; it came ashore away from its target", and the two stand on Sicily at 1099.5, 369.5, 15 cells from Valletta (`critic/c52_lland_ita_malta_21105.json`, `critic/shots/c52lland_ita_malta_21105_over_1500m.png`).</li><li>`landingRows` (0 broken, `outcome` 0) compares the row with the same tally, so it cannot see this.</li></ul> **What the bar needs:** <ul><li>`STEP=3 node critic/scripts/c52_lland.mjs 22103 GER ENG 1100.5,267.5 1031.5,266.5 2 ger_norwich 130`: the over row says the transports were sunk and the divisions are ashore, not "lost at sea".</li><li>`node critic/scripts/c52_lland.mjs 21105 ITA ENG 1095.5,344.5 1106.5,383.5 2 ita_malta 240`: the over row says they broke off and came ashore away from Valletta (or "landed" only where they landed at it).</li><li>`node critic/scripts/c52_lost.mjs 3517 desk`: no "lost at sea" for 366.</li><li>`landingRows`' `outcome` check reads each division's state (at the target, ashore elsewhere, at a port or inland, gone), not the tally, and is red before on those three.</li><li>R52-N2 and R52-N3 below; `landingInvariants` still at 0 broken on the 25 seeds.</li></ul> |
| Tanks (needs 8) | 8 | 8 | **Carried.** Not touched. |
| Aircraft (needs 8) | 8 | 8 | **Carried.** Not touched. |
| AI nuclear use (needs 8) | 8 | 8 | **Carried.** On HEAD's own 7019 year-20 save (the same hash), the game still pauses on China's atomic strike near Belfast (54,000 civilians), with its alert, "Go to" and ticker row (`critic/c52_an_7019y20.json`, `critic/shots/c52an_7019y20_0_goto.png`). It is the same world as runs 39–51, so this shows the rule still holds, not a new strength. |

## Blocking issues

1. **R52-B1: the landings bar's outcome contradicts what happened, and the order news beside it.**
   - **Why it blocks.** It contradicts a claimed feature: ADR-857 says "the row says what was done", and ADR-856's
     `outcome` check claims the over row matches its divisions. The game also tells the player two opposite things
     about the same event in the same frame. A player reads "lost at sea" as divisions drowned.
   - **The cases** (Naval row):
     - 22103: "over: lost at sea", with both divisions alive inland and the news saying the transports were sunk;
     - 3517 (run 50's case): "2 landed, 1 lost at sea", with 366 alive on land;
     - 21105 (run 51's case): "2 landed", with the transports broken off and the divisions ashore on Sicily.
   - **The cause:** the tally in `src/worker/server.ts` (`sendLandingRows` and the tally above it), since `760140ff`
     (R47a). `TransportsSunk` adds to `lost`, and a `FormationLanded` counts as `landed` wherever it is ashore.
   - **Fix:** the outcome from each division's state, worded as the order news is:
     - "over: transports sunk; 2 stay ashore at …";
     - "over: broke off; 2 came ashore near Palermo";
     - "lost at sea" only for those that died at sea.
     - Make `landingRows`' `outcome` check compare with the divisions, not the tally.

## Non-blocking issues (prioritised)

1. **R52-N2 (naval and UI): one click's row comes apart as its landings end.** ADR-862 promises "the last to land,
   landed summed".
   - **The case:** on 20861 (R48f's own test seed, three ports), the row is one, "Shanghai from Tokyo, Ōsaka,
     Hiroshima", from t1 to t107. Then:
     - t129: "Shanghai from Tokyo, Ōsaka · over: 2 landed" beside "Shanghai from Hiroshima · at sea";
     - t131: two over rows, "2 landed" and "1 landed";
     - t143: "Shanghai from Tokyo · over: 1 landed" and "Shanghai from Hiroshima · over: 1 landed". Ōsaka's landing
       has dropped out, its day up;
     - t153: one row, "1 landed".
     The click never reads "3 landed".
   - **Evidence:** the 2-hour trace in `critic/c52_lland_jap_sh3_20861.json`. The same on day 6 of
     `critic/c52_lbar_jap_sh3_20861_1600.json` and `critic/c52_lbar_jap_sh3_phone_21101_390.json`.
   - **Fix:** a part that is over stays in its click's row until the last part is over. The click's outcome is
     summed and kept a day from the last.
   - A cancel also splits the click's row into one row a port ("A part turning back is no longer a sibling"). That
     is ADR-862's; see Design objections.
2. **R52-N3 (naval readability): "lands in about a day" for four days while the transports are held in a fight.**
   - **The case:** 21105, Rome to Valletta. From t61 to t133 the row reads "at sea: lands in about a day" while the
     group stays at 1098, 376. Then it reads "about 2 days", and the row turns "over" by t181 (`critic/c52_lland_ita_malta_21105.json`).
   - **Headless** (`critic/c52_dest_21105_ita_malta_fleets.json`): transport group 1195 is `engaged` from t63 to
     t147 with no escort within 6 cells, while British fleets wait at 1110.5, 373.5 and 1105.5, 385.5.
   - Nothing in the row or the panels says it is under attack or held, and ADR-860's "lands within its days and a
     day" fails here.
   - **Fix:** while a landing's group is engaged, the row says so ("under attack at sea"). The days count from when
     it moves again.
3. **R52-N4 (God Mode, small): the Breakthrough row names no place.** It reads "God opened a breakthrough for
   Germany" on 21151 and 22151, for a click 3 cells from Berlin. `nearestCity` always returns a city id, so
   "near Berlin" is lost in the name lookup (`critic/c52_kw_21151.json`).
4. **R52-N5 (naval, small): a cancelled row says "turning back to Tokyo" with no days.** A row at sea now gives
   them (R48d) (`critic/c52_cancel_page_20661.log`, h30–h45).
5. Carried, unchanged (dimensions carried):
   - the run-26 scenario is refused;
   - the editor's nation list is flat;
   - Denmark is frozen;
   - year-one dogpiles;
   - the unit zooms' 31–47 fps on a late world.

## Run 51's cases re-run

| Run 51 case | `14a85a51` (run 51) | HEAD `d8dba302` | Evidence |
|---|---|---|---|
| **R51-N1** 21107 Berlin → Norwich ×3, cancelled day 3 (phone) | "cancelled: back at Hamburg" while they march a week | **"cancelled: stopped where they stood; the AI commands them again"**; they stop, and the AI walks two off | `critic/c52_lbar_ger_norwich3_phone_21107_390.json` |
| **R51-N2** 20661 cancel at h26, AI reships 364 | "At sea, bound for its landing" with no row | **"At sea with the AI's landing (not one of yours)"** from h216 | `critic/c52_cancel_page_20661.log` |
| **R51-N3** 21103 at 844 × 390, four divisions | cancel below the fold | **cancel and 4 lines on screen, topmost, days 0–4** | `critic/c52_lbox_eng_br4_21103_844x390.json` |
| **R51-N4** Breakthrough at war 21151 | silent | **ticker row from the click's hour** (no place name, R52-N4) | `critic/c52_kw_21151.json` |
| **R51-N5** History's order, 20429 | release under its effects | **release first in its hour** | `critic/shots/c52rise_20429_history.png` |
| **R51-N6** 20861 "waits for" | "waits for the landing from Hiroshima" | **gone; "at sea: lands in about N days"** | `critic/c52_lbar_jap_sh3_20861_1600.json` |
| **R51-N7** "they land together" | 12 h apart | **"to land within a day of"**; 21041 lands t119/t129/t131 | `critic/c52_far_21041_jap_sh3.json` |
| ADR-854 objection: phone panel hides the bar (21101) | `barVisibleWithNationPanel: false` | **true** (21101, 21107) | `critic/c52_lbar_jap_sh3_phone_21101_390.json` |
| ADR-838 objection: one click, three rows (20861) | three rows | **one row while it runs; comes apart at the end** (R52-N2) | `critic/c52_lland_jap_sh3_20861.json` |
| 21105 Rome → Valletta (run 51: "ashore on day 8", a strength) | "over: 2 landed" | **the same words, but they broke off and are on Sicily** (R52-B1); held 4 days in a fight (R52-N3) | `critic/c52_lland_ita_malta_21105.json` |
| 20863 cancel while gathering | — | "cancelled: stopped where they stood; the AI commands them again" on day 3 | `critic/c52_lbar_eng_br_cancelsea_20863_1600.json` |
| R50-N2/N3 lost rows 3517 (desk, phone, landscape, phone ×6) | whole | the same, whole, with no error; the bar's "1 lost at sea" beside them is R52-B1 | `critic/c52_lost_*.json` |
| Sea balls at R46's camera, 20885 t107 | 24 elements | 24 / 22 / 16 at 250 / 60 / 25 m/px | `critic/c52_sb_20885.json` |
| God tools 20875 | each with its row | the same | `critic/c52_q_20875.json` |
| 7019 year 20: hash, History, AI nukes, export | `6a8590fe`; 3,714 events; 2 strikes; 3,716 lines | the same hash and count; Belfast strike; 3,716 lines | `critic/c52_seed7019_save.log`, `critic/c52_hi_7019.json`, `critic/c52_an_7019y20.json`, `critic/c52_dl_7019.json` |
| Run 51's 65 headless jobs (replay) | — | **63 of 65 the same, 2 differ, 0 failed**. The two are `slowClick` lines on 18705 (36 → 37 clicks reckoned) and 20829, which ADR-857 says its sim change moved. Both are still 0 broken, though 20829's worst click went from 1.7 to 4.3 days over its best way. On the 19 new seeds (60001–61801), every checker reads 0 broken, and workerDeterminism 61801 is the same on every arm | `critic/c52_replay/REPORT.md` |
| Run 51's new-seed checkers (21001–21059, `landingRows far`) | 0 broken | **0 broken on all of them**. The far routes land at run 51's hours (21041: t119/t129/t131; 21045: t141–142). workerDeterminism 21059 ends `0a7a7477`, as in run 51. `landingRows far`: 8 cases, 2,633 hours, 0 broken | `critic/c52_*_210*.log`, `critic/c52_lrows_far.log` |
| Not re-run: 21099's 25 years, the 12-year watches, the frame rate, the relations graphs, the editor and the run-26 file | — | their dimensions are carried and Batch 5 does not touch them | — |

**Checkers on fresh seeds (this run).** No checker reports a broken rule:
- landingInvariants: 0 broken on 22021–22033 (7 seeds; `critic/c52_li_22*.log`);
- diploInvariants: 0 broken on 22001, 22003 and 22005;
- worldInvariants: 0 broken on 22051 (ten years);
- workerDeterminism 22059: `330ff6a9` on every arm;
- `landingRows all`: 108 cases, 19,905 hours, 0 broken (`critic/c52_lrows_all.log`);
- `seaBattles` 22061: 65 sea battles in 3 years (`critic/c52_sb_22061.log`).

## Design objections (none blocking, no score lowered)

- **ADR-862: a turning-back part leaves its click's row.** A cancel of the click's one row, as on 20661 and 22101,
  turns it at once into one row a port ("Shanghai from Tokyo · turning back", "Shanghai from Ōsaka · turning back").
  So the player's one cancel gives him two or three rows to follow. Keeping the click's row, with "turning back"
  per port inside it, would read as the one operation it was.
- **SPEC §7.1 / ADR-759: the AI picks up a cancelled division at once.** On 22105 all three cancelled divisions are
  shipped on an AI landing on day 8, and on 21107 two walk off the next day. The words are now true (R48a, R48b),
  but "cancel" still hands the army to the AI. An option to keep a played nation's divisions where the player left
  them would make taking control mean more.
- **ADR-864: the corridor is not drawn.** The row is there, but the 10-day corridor is the tool's whole effect, and
  the map does not show it.

## Ideas from other games (not scored)

- Hearts of Iron's naval invasion result is told as a single notice per operation: "Naval invasion at X succeeded /
  failed", with where the troops ended up. That is R52-B1's and R52-N2's fix in one.
- Europa Universalis' message log has a filter for "my wars only". History has the types and nations filter, but
  no "the wars I am in".

## Strengths (verified)

- **The cancel now does what it says.** On 21107 the three stop within a cell of where they stood at the hour of
  the cancel, and the row says so, as does the tooltip (`critic/c52_lbar_ger_norwich3_phone_21107_390.json`).
- **On a landscape phone the open row fits.** All four divisions and the cancel are on screen and on top on every
  day of 21103's landing (`critic/c52_lbox_eng_br4_21103_844x390.json`).
