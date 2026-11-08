# Critic report, run 53 (focused): after Batch 6 (R50a–d, R51a)

- **Mode: focused.** Decided from git before anything else (CRITIC_PROMPT, ADR-804). All three conditions hold:
  - the last report (run 52, `3357f0a3`, on `d8dba302`) has a blocking issue (R52-B1) and a score under its bar
    (naval 7, bar 8);
  - every commit since is one of the two kinds: `efdc5b2d` (R50a), `f7114ed5` (R50b), `50baf181` (R50c), `4a57ea7d`
    (R50d) and `29928a1b` (R51a) name items filed by `3357f0a3`'s own ROADMAP diff ("Batch 6"); `5f8ef9e8` (the replay
    of run 52's probes) changes no file under `src/`, `data/` or `public/`;
  - the last three reports were not all focused: run 52 focused, run 51 full, run 50 full.
- **What is scored afresh.**
  - Naval: under its bar and blocked.
  - The dimensions the changed files touch (`git diff --stat d8dba302 HEAD -- src data public`: 6 files, +120 −24):
    - UI/UX: `landingStatus.ts`, `en.json`, `protocol.ts`;
    - naval and stability: `landings.ts` (`held`, `backIn`), `server.ts` (`endLanding`, `landingClick`);
    - God Mode and stats/history: `historyRows.ts` (the city in a ticker row).
  - Every other score is carried and marked so. A defect met in passing still counts.
- **Commit judged:** `5f8ef9e830357411d52dbbb24bfb3363de63d0f7`, HEAD at the start, clean tree (`critic/c53_commit.txt`).
  **Date:** 2026-11-07.
- **Build:** `vite build --outDir critic/c53_dist`, exit 0 (`critic/c53_build.log`), served by `vite preview` on
  127.0.0.1:**5353**; stopped at the end. Playwright Chromium at 1600 × 900, 390 × 844 and 844 × 390.
- **Runs.**
  - **Headless replay** of run 52's 35 jobs plus one new seed per family:
    `tools/diag/replayCritic.ts --run 52 --new 1 --jobs 3 --out critic/c53_replay` (`critic/c53_replay/REPORT.md`,
    `critic/c53_replay.log`).
  - **Headless, fresh seeds** (`critic/scripts/c53_jobsQ.txt`, exits in `critic/c53_q_q.done`): landingInvariants
    23021–23033 (7), diploInvariants 23001 (random), 23003 (scenario, heroes), 23005 (random world), workerDeterminism
    23059, worldInvariants 23051 (ten years), seaBattles 23061.
  - **Page, one at a time:** `critic/scripts/c53_suiteP.sh` (every run-52 case first, then new seeds 23103–23151) and
    `critic/scripts/c53_suiteP2.sh` (the new probes below).
  - **New probes:**
    - `critic/scripts/c53_repulse.ts`: headless through the worker (`SimServer`, as `tests/helpers/landingRows.ts`).
      One click's landing; from the hour the first division lands, the foe is made holder of the sea about the
      landing's water, so a later part is thrown back (PLAN 4.5b). Logs every event of the divisions, the worker's
      order news, and the bar's words (`landingStatus` and `groupStatus` themselves). **Staged**: the sea hold is
      written into `world.seaControl`, not won.
    - `critic/scripts/c53_repland.ts`: headless, no staging: every `LandingRepulsed` in an AI world and whether the
      same division comes ashore within 48 h.
    - `critic/scripts/c53_turnback.mjs`, `critic/scripts/c53_lhold.mjs`: the cancel and landing probes with shots
      and the bar's text at chosen hours.
    - `critic/scripts/c53_kwhist.mjs`: R51a's city in the ticker, History's row and both downloads.

## Verdict

**R52-B1 is fixed on all three of its cases and on new seeds, and the bar's other run-52 findings (N2, N3, N4, N5)
are fixed on their own cases. Every checker reports 0 broken. No blocking issue. Naval goes to 8 and reaches its bar.**

- **R52-B1:** 22103 now reads "over: its transports were sunk; 2 never sailed" beside the news saying the same, with
  both divisions inland. 21105 reads "over: its transports broke off; 2 came ashore away from Valletta" with the two on
  Sicily. 3517 reads "over: 2 landed, 1 never sailed" with 366 on land.
- **R52-N2:** 20861 is one row from t1 to "over: 3 landed".
- **Still wrong, not blocking:**
  - **R53-N1:** a landing thrown back is never told so in the bar. The division later comes ashore, and that
    overwrites "thrown back" with "landed" or "came ashore away". On a staged case the bar reads "over: 3 landed"
    beside two "thrown back" news rows.
  - **R53-N2:** a click's row turning back from two or three ports says "turning back to Tokyo" (seen on 20661 and on
    new 22101).
  - **R53-N3:** "under attack, held up" for four days with no attacker on the map at 1500 or 250 m/px, and with the
    division's panel saying "At sea, bound for its landing".

**Scores.**

- **Up:** naval to 8.
- **UI/UX stays at 7,** for R53-N2 and R53-N3: the bar's headline still says less than, or other than, what the map
  and the sub-lines show.
- Everything else is the same.

## Scores

| Dimension | Run 52 | Run 53 | |
|---|---|---|---|
| Map visuals and readability | 8 | 8 | **Carried.** Not touched by Batch 6. |
| Diplomacy, war, alliance, puppet, revolt depth | 7 | 7 | **Carried.** Checkers on new seeds, as the brief asks: diploInvariants 0 broken on 23001 (random, 10 y), 23003 (scenario, heroes, 10 y), 23005 (random world, 5 y) (`critic/c53_diploinv_23*.log`), and on run 52's 22001/22003/22005 and 21001–21013 again (replay). **What the bar needs:** as run 52 said: on 20887 and 21129 (`node critic/scripts/c53_rg_relations.mjs <seed> 365 1600 900 desk '&heroes=on'`), no war chip at day 365 with one side more than 4 times the other's count of nations. |
| Emergent world dynamics over long runs | 7 | 7 | **Carried.** Batch 6's sim change (`held`, `backIn`) only reads the world: 7019's year-20 hash is still `6a8590fe` (`critic/c53_replay/c52_seed7019_save.log`; runs 50–52 the same). **What the bar needs:** as run 52 said: `node critic/scripts/c48_top.cjs` on 21099 (25 years) and 20899, with no top-5 holder within ±0.2 % of the same share for 20 or more years. |
| God Mode | 8 | 8 | **Rescored (R51a).** <ul><li>**R52-N4 fixed:** "1 January 1938 God opened a breakthrough for Germany near Berlin" in the ticker on 21151, 22151 and new 23151 (`critic/c53_kw_21151.json`, `critic/c53_kw_22151.json`, `critic/shots/c53kw_21151_00_breakthrough_clicked.png`; run 52: "for Germany").</li><li>The same words in History's row, and in the CSV (`…,GodBreakthrough,1,Germany,1,Berlin,God opened a breakthrough for Germany near Berlin`) and the JSON. No raw "=Berlin" anywhere (`critic/c53_kwh_21151.json`, `critic/c53_kwh_23151.json`, `critic/shots/c53kwh_21151_history.png`).</li><li>Fighting follows: engaged 0 → 4 → 19 → 54 by day 7 on 21151.</li><li>At peace it is still refused (`critic/c53_k_20879.json`).</li><li>Revolt, Spawn, Found and Raze are each told, on 20875 and new 23119 (`critic/c53_q_23119.json`).</li><li>No page error.</li></ul> **Not 9:** the corridor is still not drawn on the map (ADR-864's choice; see Design objections). |
| Editor and scenarios | 7 | 7 | **Carried.** **What the bar needs:** as run 52 said: `node critic/scripts/c53_os2_scen.mjs critic/c26_critic_standoff.warsim-scenario c53` loads the run-26 file, or says what it changed to load it; and the editor's nation list is searchable or grouped. |
| Stats and history | 8 | 8 | **Rescored (`historyRows.ts`).** History's Breakthrough row and both downloads name the place, with the `=` literal marker stripped everywhere (above). The 7019 save is the same world (`6a8590fe`). **Not 9:** as run 52: no "my wars only" filter, and no link from a row to its war chip. |
| UI/UX and polish | 7 | 7 | **Rescored.** **Better, each on run 52's case:** <ul><li>The over line agrees with the order news on 22103, 21105 and 3517 (Naval row).</li><li>One row for one click to its end on 20861: "over: 3 landed" (`critic/c53_lland_jap_sh3_20861.json`).</li><li>A row turning back gives its days: "turning back to Tokyo: there in about a day" (`critic/c53_cp_jap_cancel_20661.json`).</li><li>The landscape-phone row still fits: the cancel and four division lines are inside the viewport and topmost on days 0–4 of 21103 (`critic/c53_lbox_eng_br4_21103_844x390.json`).</li><li>The bar is seen beside the phone's nation panel (`barVisibleWithNationPanel: true`, 21101 and 21107).</li><li>No page error in any c53 probe.</li></ul> **Not 8:** <ul><li>**R53-N2:** one click from two or three ports turning back is headed "turning back to Tokyo" on 20661 (h30–h45) and on new 22101 (day 3: "turning back to Tokyo" for Tokyo, Ōsaka, Hiroshima). The sub-lines say "turning back to Ōsaka", and 365's panel says "Aboard, sailing back to Ōsaka" (`critic/c53_tb_jap_cancel_20661.json` `barText` at h30, `critic/shots/c53tb_jap_cancel_20661_h30.png`, `critic/c53_lbar_jap_sh3_land_22101_844.json`). `groupStatus` returns the first returning part's words. While sailing it sums ("2 of 3 at sea"); turning back it does not.</li><li>**R53-N3:** "at sea: under attack, held up" (below).</li><li>Small: on 22105 day 2, one division's line drops its days ("Marching to Portsmouth to board transports") while its sibling keeps them (`critic/c53_lbar_eng_br3_phone_22105_390.json`).</li></ul> **What the bar needs:** <ul><li>`SHOTAT=30 node critic/scripts/c53_turnback.mjs 20661 JAP CHI 1818.5,385.5 1715.5,413.5 2 jap_cancel 26 60`: the headline at h30 names both ports, "turning back to Tokyo, Ōsaka", with the longer of their days.</li><li>`node critic/scripts/c53_lbar.mjs 22101 JAP CHI 1818.5,385.5 1715.5,413.5 3 jap_sh3_land 844 390 12 2`: day 3 names all three ports.</li><li>`SHOTAT=60 node critic/scripts/c53_lhold.mjs 21105 ITA ENG 1095.5,344.5 1106.5,383.5 2 ita_malta 200`: at h60 the held row's attacker is on the map or named, and the division's panel agrees with the row.</li></ul> |
| Performance | 7 | 7 | **Carried** (no render or sim-cost change). In passing, 7019's 20 years ran at a mean of 3.32 ms a tick headless, with two other jobs beside it (`critic/c53_replay/c52_seed7019_save.log`; run 52: 3.76). **What the bar needs:** as run 52 said: `node critic/scripts/c53_pf_lookfps.mjs 7019 critic/c52_seed7019_y20.bin`, alone, at 45 fps or more at 120 m/px in both looks. |
| Stability | 8 | 8 | **Rescored on new seeds** (`landings.ts`, `server.ts` changed). <ul><li>**Save and load in the page (23137, new):** saved at t4800 (hash 31191321) and run 200 days: 3888954380. Loaded twice and run 200 days each time: 3888954380 both times (`critic/c53_sl_plain_23137.json`).</li><li>**7019's 20-year hash** is `6a8590fe`, as in runs 50–52.</li><li>**workerDeterminism 23059:** `7818e79e` on every arm (`critic/c53_wd_23059.log`).</li><li>**worldInvariants 23051 (ten years):** 0 broken.</li><li>**No page error:** a sweep of all 46 `critic/c53_*.json` finds no `errors` entry and no `fail` or `fatal` key.</li></ul> |
| Semantic zoom to unit level (needs 8) | 8 | 8 | **Carried.** In passing, the sea battle at R46's camera on 20885 (t107) is drawn with 24 / 22 / 16 elements at 250 / 60 / 25 m/px in Balls (19 at 60 in Classic), as in run 52 (`critic/c53_sb_20885.json`). |
| Naval warfare (needs 8) | 7 | **8** | **Up: every case run 52 named as "what the bar needs" now shows what it asked for, and so do new seeds.** <ul><li>**22103** (`STEP=3 c53_lland … ger_norwich 130`): run 52 "over: lost at sea". Now **"over: its transports were sunk; 2 never sailed"** from t91, with both divisions inland near Berlin (1094.4, 263.6; 1092.8, 261.8). The news beside it says the transports were sunk and the landing is over (`critic/c53_lland_ger_norwich_22103.json`). The same hours and words on new 23103 (the 1938 start plays out alike there: not an independent case).</li><li>**21105** Rome → Valletta: run 52 "over: 2 landed". Now **"over: its transports broke off; 2 came ashore away from Valletta"**. The ticker beside it has 319's and 321's "its transports broke off; it came ashore away from its target" (`critic/shots/c53lland_ita_malta_21105_over_1500m.png`). The same on new 23105 (two divisions) and 23107 (three).</li><li>**3517** desk: run 52 "2 landed, 1 lost at sea". Now **"over: 2 landed, 1 never sailed"**, with 366 on land at 1783.9, 392.5 (`critic/shots/c53lost_desk_rows.png`). Phone and landscape probes: no error.</li><li>**20861** (`STEP=2`): **one row from t1 to "over: 3 landed"** at t131, gone at t155 (`critic/c53_lland_jap_sh3_20861.json`; run 52: split into three rows). The same on new 23111 ("over: 3 landed" at t133).</li><li>**R52-N3:** 21105 now reads "at sea: under attack, held up" from t55 to t144 while the group is engaged. It reads "lands in about 2 days" when the group moves again (`critic/c53_lland_ita_malta_21105.json`).</li><li>**R52-N5:** "turning back to Tokyo: there in about a day", and it is there by h48 (`critic/c53_cp_jap_cancel_20661.json`).</li><li>Checkers: landingInvariants 0 broken on new 23021–23033; run 52's 22021–22033 and 21021–21031 0 broken again (replay); `landingRows all` 0 broken (replay).</li><li>Landings that go right go right: new 23109, England's three to Bremerhaven, "over: 3 landed" at t145 with all three at the target (1072.5, 258.5).</li><li>seaBattles 23061: 61 sea battles in 3 years (`critic/c53_sb_23061.log`).</li></ul> **Not 9:** <ul><li>**R53-N1:** a landing thrown back is told "landed" or "came ashore away" in the bar (staged; below).</li><li>**R53-N3:** "under attack" with nothing on the map. At h60 on 21105, transport group 1195 sits alone west of Sicily at 250 m/px, with no enemy ship, battle marker or fire in view (`critic/shots/c53lh_ita_malta_21105_h60_250m.png`, `critic/shots/c53lh_ita_malta_21105_h60_1500m.png`). Run 52's headless trace (`critic/c52_dest_21105_ita_malta_fleets.json`) has the group `engaged` while every British fleet within 15 cells is not, 12 cells off.</li><li>The Malta landing never reaches Valletta on any seed tried (21105, 22107, 23105, 23107).</li></ul> |
| Tanks (needs 8) | 8 | 8 | **Carried.** Not touched. |
| Aircraft (needs 8) | 8 | 8 | **Carried.** Not touched. |
| AI nuclear use (needs 8) | 8 | 8 | **Carried.** Not touched; 7019's year-20 world is the same hash as runs 39–52. |

## Blocking issues

None. A release still needs a full run with no blocking issue (ADR-804): this clean focused run is to be followed by
a full one.

## Non-blocking issues (prioritised)

1. **R53-N1 (naval, rules agree): a landing thrown back is never told "thrown back" in the bar, because its later
   landing overwrites it.**
   - **The cause:** `server.ts` `endLanding` sets a division's end to `repulsed` on `LandingRepulsed`. When the same
     division comes ashore afterwards (`FormationLanded`, which a thrown-back division always does sooner or later),
     the end is overwritten with `landed` or `away`. So the `repulsed` kind is reached only when no division ever
     comes ashore.
   - **Case A** (staged: the sea held for China from the first landing; `npx tsx critic/scripts/c53_repulse.ts 20861
     JAP CHI 1818.5,385.5 1715.5,413.5 3 critic/c53_repulse_20861.json 400 12`):
     - 364 is thrown back at t129 and 366 at t131. The worker posts order news `repulsed` for each.
     - Each comes ashore one hour later at 1715.5, 411.5: the beachhead 365 took at t119, now Japan's, so the stray
       landing (PLAN 4.8n) takes it.
     - The bar reads **"over: 3 landed"**.
     - Two rules undo each other: the repulse ("home with the transports, nothing taken") and the stray landing put
       the division on the target beach an hour later. The news says "thrown back" and the bar says "landed"
       (`critic/c53_repulse_20861.json` `evLog`, `news`).
   - **Case B** (staged, `… c53_repulse.ts 23071 ENG GER 1023.5,275.5 1072.5,259.5 3 …`):
     - 274 lands at Bremerhaven at t141, and 270 and 271 are thrown back at t142.
     - They sail home and come ashore in Kent (1030.5, 276.5, next to Dover) at t200.
     - The bar reads **"over: 1 landed, 2 came ashore away from Bremerhaven"**: true of the place, but "away from
       Bremerhaven" reads as near it, and "thrown back" is never said (`critic/c53_repulse_23071.json`).
   - **Unstaged:** on 23081 (scenario, 3 years, all AI), 5 of the 7 landings thrown back are ashore within an hour,
     1 cell from where they were thrown back, all French off France's own coast (`critic/c53_repland_23081.json`).
     That is consistent with "home" there, so I file the rule clash only on the staged player case.
   - **Why not blocking:** both player cases need a sea hold I wrote in, and `landingRows` (which treats a repulse as
     "not broken off") reports 0.
   - **Fix:** keep `repulsed` once set (a thrown-back division that comes ashore later is "thrown back; came ashore at
     <port>"). Decide whether a thrown-back division may stray-land on its own beachhead at the target. Add a
     repulse case to `landingRows`.
2. **R53-N2 (UI): a click's row turning back from several ports names only the first port** (UI row above; 20661,
   22101).
3. **R53-N3 (naval readability): "under attack, held up" for days, with nothing on the map and a silent panel**
   (Naval row; 21105 t55–t144; 23105 three times, t37, t55, t163).
   - **Fix:** name or show the attacker (a sea-battle marker, or "under attack by British ships"). Put the same
     words in the division's panel.
   - If the engagement is one-sided (the group `engaged`, no foe `engaged`), check whether it is real.
4. **Small:**
   - with one part ashore and two at sea, the click's row reads "at sea: lands in about a day" (20861 t121–t130, 365
     ashore at 1715.5, 411.5: `critic/c53_lh_jap_sh3_20861.json`), where gathering has its "2 of 3 at sea";
   - 22105's division line loses its days on day 2.
5. **Carried, unchanged (dimensions carried):**
   - the run-26 scenario is refused;
   - the editor's nation list is flat;
   - Denmark is frozen;
   - year-one dogpiles;
   - the unit zooms' 31–47 fps on a late world.

## Run 52's cases re-run

| Run 52 case | `d8dba302` (run 52) | HEAD `5f8ef9e8` | Evidence |
|---|---|---|---|
| **R52-B1** 22103 Berlin → Norwich ×2, sunk before boarding | "over: lost at sea" | **"over: its transports were sunk; 2 never sailed"** | `critic/c53_lland_ger_norwich_22103.json` |
| **R52-B1** 21105 Rome → Valletta | "over: 2 landed" (on Sicily) | **"over: its transports broke off; 2 came ashore away from Valletta"** | `critic/shots/c53lland_ita_malta_21105_over_1500m.png` |
| **R52-B1** 3517 desk (366 sunk before boarding) | "2 landed, 1 lost at sea" | **"2 landed, 1 never sailed"** | `critic/shots/c53lost_desk_rows.png` |
| **R52-N2** 20861 three ports | rows split at the end; never "3 landed" | **one row, "over: 3 landed"** (page, STEP 2; and lbar day 6) | `critic/c53_lland_jap_sh3_20861.json`, `critic/c53_lbar_jap_sh3_20861_1600.json` |
| **R52-N3** 21105 held 4 days | "lands in about a day" ×4 days | **"under attack, held up"**, days again when it moves (R53-N3 for what it lacks) | `critic/c53_lland_ita_malta_21105.json` |
| **R52-N4** Breakthrough row 21151, 22151 | "for Germany" | **"for Germany near Berlin"**, in History and both downloads too | `critic/c53_kwh_21151.json` |
| **R52-N5** 20661 cancel at h26 | "turning back to Tokyo" | **"…: there in about a day"** (one port only: R53-N2) | `critic/c53_tb_jap_cancel_20661.json` |
| 21107 cancel day 3 (phone) | "stopped where they stood…" | the same; bar seen with the nation panel | `critic/c53_lbar_ger_norwich3_phone_21107_390.json` |
| 21103 landscape box | cancel and 4 lines on screen, topmost | the same, days 0–4 | `critic/c53_lbox_eng_br4_21103_844x390.json` |
| 20863, 22101, 22105, 22107 bars | as run 52 | the same words, now with R50's outcomes; 22107: "3 came ashore away from Valletta"; 22101: R53-N2 | `critic/c53_lbar_*.json` |
| Sea balls 20885 t107 | 24 / 22 / 16 | 24 / 22 / 16 | `critic/c53_sb_20885.json` |
| God tools 20875, 22119 → 23119; Breakthrough at peace 20879 | told; refused | the same | `critic/c53_q_*.json`, `critic/c53_k_20879.json` |
| Save and load 22137 → new 23137 | same hash twice | same hash twice | `critic/c53_sl_plain_23137.json` |
| Run 52's 35 headless jobs + 13 new seeds (replay) | — | **32 the same, 3 differ, 0 failed.** Two differ only in an echoed output path (7019's save, seaBattles 22061: the same hash `6a8590fe` and the same 65 battles). One is `landingRows all`'s `grid 3517 redirect 6 aboard`, with 2 rows at the end, not 1: R50b keeping an over part beside its click's live part, as ADR-867 means; still 0 broken. The 13 new seeds (60001–61201) all exit 0, and every checker among them reads 0 broken. workerDeterminism 61001 is the same on every arm | `critic/c53_replay/REPORT.md` |
| Not re-run: the frame rate, the relations graphs, the editor and the run-26 file, 21099's 25 years | — | their dimensions are carried and Batch 6 does not touch them | — |

**Checkers on fresh seeds (this run).** None reports a broken rule:
- landingInvariants 23021–23033: 0 broken (`critic/c53_li_23*.log`);
- diploInvariants 23001, 23003 and 23005: 0 broken;
- worldInvariants 23051 (ten years): 0 broken;
- workerDeterminism 23059: the same on every arm;
- seaBattles 23061: 61 battles.

## Design objections (none blocking, no score lowered)

- **ADR-759 / SPEC §7.1: a cancel hands the army to the AI at once.** On 22105 the cancelled three are on an AI
  landing by day 8. On 20661 (lbar, cancelled t27), the row reads "back at Tokyo, Ōsaka" at t51 while both panels
  already read "At sea with the AI's landing" (`critic/c53_lbar_jap_sh_cancel1_20661_1600.json`). The words are true,
  but the player's cancel is undone within a day. An option to keep a played nation's divisions where the player left
  them is still wanted.
- **ADR-864: the Breakthrough corridor is not drawn.** The row now says where. The map still does not show the
  10-day corridor that is the tool's whole effect.

## Ideas from other games (not scored)

- Hearts of Iron names the attacker on a convoy under attack ("Convoy raided by submarines in the Western Med"). That
  is R53-N3's fix.
- Europa Universalis' message log has a filter for "my wars only" (History has types and nations, not "my wars").

## Strengths (verified)

- **The bar's last line is now true on every case I have.** It was false on three named cases in run 52. Now
  "never sailed", "broke off; came ashore away from Valletta" and "3 landed" each match where the divisions stand,
  and the order news beside them, on 22103, 21105, 3517 and 20861, and on new 23103, 23105, 23107, 23109 and 23111.
- **One click is one row to its end.** 20861's three ports read as one landing from the first hour to "over: 3
  landed", and the row goes a day after the last landed.
