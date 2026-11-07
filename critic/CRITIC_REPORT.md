# Critic report, run 51 (full): after R43 (run 50's issues), R44 (`slowClick`), R34, R35 and Batch 4 (R45–R47)

- **Mode: full.** I decided this from git before anything else (CRITIC_PROMPT, ADR-804). The last report (run 50,
  `7e632e2e`, on `3fe138b1`) has a score under its bar (naval 7, bar 8), and the last three reports were not all
  focused. But the second condition fails: `7e632e2e` filed only R43. The commits since name R44 (`5e7f2614`,
  `6f57d9e7`), R34a–R34l, R35 and R45–R47, which that commit did not file. Several of them change `src/`
  (`git diff --stat 3fe138b1 HEAD -- src data public`: 31 files, +1,327 −127, among them `landings.ts`, `revolts.ts`,
  `heroes.ts`, `server.ts` and the new `LandingsBar.tsx`). So every dimension is scored afresh.
- **Commit judged:** `14a85a51c23a5b10a29f0b1193c7748d11e0ffd1`, HEAD at the start, with a clean tree
  (`critic/c51_commit.txt`). **Date:** 2026-11-07.
- **Build:** `vite build --outDir critic/c51_dist`, exit 0 (`critic/c51_build.log`). Served by `vite preview` on
  127.0.0.1:**5321** (not the default port). I stopped it at the end, and no node or browser of mine is left running.
  Driven through Playwright Chromium at desk 1600 × 900, phone 390 × 844 and a landscape phone 844 × 390.
- **Runs.**
  - **Headless, 91 jobs, 6 at a time** (`critic/scripts/c51_jobsQ.txt`; every job exited 0, `critic/c51_q_all.done`):
    - all 65 of run 50's jobs again, on the same seeds;
    - new seeds:
      - diploInvariants 21001–21013: ten-year runs, random and scenario diplomacy, with and without heroes, plus a
        five-year random world;
      - landingInvariants 21021–21031, which now include R44's `slowClick` rule;
      - far routes 21041, 21043, 21045, 21047;
      - worldInvariants 21051, 21053 (heroes) and 21055 (ten years);
      - workerDeterminism 21059 at 4,380 h;
      - R46's `seaBattles` on 21061 and 20885;
      - R47d's `landingRows far`;
    - headless worlds: 7019 for 20 years (saved, `critic/c51_seed7019_y20.bin`) and new 21099 for 25 years.
  - **Page, one at a time** (`critic/scripts/c51_suiteP.sh`, `c51_suite2.sh`):
    - run 50's cases again;
    - **new for R47:** `critic/scripts/c51_lbar.mjs`, the landings bar read day by day against each division's panel,
      on 6 cases (desk, phone, landscape phone; two cancels). Also `critic/scripts/c51_cancel_page.mjs`, a cancel
      followed every 3 hours for 10 days;
    - on new seeds:
      - zoom 21111, sea click 21113, land battle 21115;
      - God nuke 21117, God tools 21119, editor 21121, breakthrough 21123, and breakthrough **at war** 21151 (new,
        `critic/scripts/c51_kw_breakthrough.mjs`);
      - planes 21125 and wing 21127;
      - relations graph 21129 (desk, heroes) and 21131 (phone, random diplomacy);
      - phone zoom 21133, force war 21135, touch, phone, UI, and save and load 21137;
      - two 12-year watches at Max: 21141 (heroes) and 21143;
    - sea balls at the camera R46 lists for 20885;
    - on 7019's year-20 save: AI nukes, History and export;
    - last, with nothing else of mine running: the frame rate on 7019's year-20 save.
  - **Headless, my own:** `critic/scripts/c51_cancel.ts`, R47c's cancel as the bar gives it (each division ordered to
    the port's cell), traced every 3 hours with the landing's state, the division's place and its player order.

## Verdict

**R43, R44, R34, R35 and R45–R47 do what they claim on the cases they name. No checker reports a broken rule on any
seed of this run, and there is no blocking issue.**

- **No broken rule.** 0 broken on 25 diplomacy runs, 25 landing seeds, 8 world seeds (two of them ten years) and 3
  worker seeds. R47d's `landingRows far` checks 8 cases over 2,633 hours: 0 broken.
- **Every one of run 50's six findings is fixed** (see "Run 50's cases re-run"). The worst: 20841's three-division
  click from Tokyo to Shanghai took 39.6 days in run 50 and now lands in 4.9–5.4 days.
- **The newest feature has the run's main new findings.** The landings bar reads truly while a landing gathers and
  sails, on desk, phone and landscape. Its **cancel** does not:
  - **R51-N1:** cancelling a gathering landing sends its divisions marching on to the port for a week, while the row
    says "cancelled: back at Hamburg" from the first hour.
  - **R51-N2:** after a cancel at sea, the nation's AI may ship the division off again within hours. Its panel then
    says "At sea, bound for its landing", but no row in "Your landings" stands for that voyage.

**Scores.**

- **Up:**
  - Map visuals rises to 8: the ranking prints whole names, and the relations graph's labels never overlap, on desk
    and phone.
  - Stats and history rises to 8: History rows wrap within their own column.
- **Naval stays at 7 (bar 8).** Run 50's case is fixed, and run 50's other gap is closed: a sea battle is now drawn,
  with its ships, at R46's camera. But a cancelled row tells the player something false for a week (R51-N1).

## Scores

| Dimension | Run 50 | Run 51 | |
|---|---|---|---|
| Map visuals and readability | 7 | **8** | **Up: both of run 50's reasons are gone.** <ul><li>**Ranking (R34b):** the names are whole in every desk shot, "French Equatorial Africa" and "Anglo-Egyptian Sudan" included (`critic/shots/c51lbar_jap_sh3_20861_1600_d0.png`, `critic/shots/c51lwhon_21141_y12_world.png`; run 50: "French Equatorial…", "Anglo-Egyptian S…").</li><li>**Relations graph (R34a):** on 20887 at day 365, no label lies over another (`critic/shots/c51rg_20887_desk_d365.png`; run 50 had "Albania Manchuku" and "…thern Rho Ceylon" on the same seed and day). On the phone, 20889's labels can now be read: "United Kingdom", "Czechoslovakia", "French West Africa" (`critic/shots/c51rg_20889_phone_d365.png`; run 50: illegible).</li><li>**Hero tags** blend 55 → 63 → 73 → 83 → 96 → 110 px from 10,001 to 5,000 m/px, as in run 50 (`critic/c51_hero.20471_17520_desk.log`).</li><li>**A sea battle reads at three zooms:** Soviet against Romanian ships off Constanța, with tracers and a ring (`critic/shots/c51sb_20885_60m_balls.png`).</li></ul> **Not 9:** <ul><li>On a landscape phone the landings bar covers the middle of the map, 314 × 156 px of 844 × 390 (`critic/shots/c51lbar_eng_br4_land_21103_844_d0.png`).</li><li>The graph leaves many nodes unlabelled.</li></ul> |
| Diplomacy, war, alliance, puppet, revolt depth | 7 | 7 | **Rescored.** <ul><li>0 broken on all 25 runs: run 50's 18 again, and new 21001–21013 (random, scenario, heroes, a random world) (`critic/c51_diploinv_*.log`).</li><li>**R50-N4 fixed:** in the ticker, "Dutch East Indies was freed from Netherlands" now comes before its two "left its war" rows (`critic/shots/c51rise_20429_history.png`, bottom left).</li><li>Force war 21135 and the relations graphs match the sim (`critic/c51_fw2_21135.json`, `critic/c51_rg_*.json`).</li></ul> **Not 8:** <ul><li>Year-one wars are still dogpiles: "Germany +6 ⚔ United Kingdom +36" and "Nationalist Spain ⚔ Portugal +22" at day 365 (`critic/shots/c51rg_20887_desk_d365.png`).</li><li>At year 12: "United Kingdom +13 ⚔ France +4" and "Soviet Union +6 ⚔ Denmark" (`critic/shots/c51lwhon_21141_y12_world.png`).</li><li>History still lists the release after the wars it ended (R51-N5).</li></ul> **What the bar needs:** on 20887 and 21129 (desk, heroes; `critic/scripts/c51_rg_relations.mjs <seed> 365 1600 900 desk '&heroes=on'`), no war chip at day 365 with one side more than 4 times the other's count of nations. And `diploInvariants` still at 0 broken on the 25 runs above. |
| Emergent world dynamics over long runs | 7 | 7 | **Rescored on new worlds.** <ul><li>**21099 over 25 years (headless):** the Soviet Union falls from 27.9 % to 9.8 % and recovers to 14.7 %. Germany rises from nowhere to the top in year 17 (13.1 %), and the USA ends first with 21.7 %. Canada falls from 12.3 % to 5.4 %. 77–96 nations live (`critic/c51_top_21099.txt`).</li><li>**The 12-year page watch 21141 (heroes)** ends with France third (13.7 M km²) and Denmark holding the Canadian Arctic (`critic/shots/c51lwhon_21141_y12_world.png`).</li></ul> **Not 8:** <ul><li>Denmark sits at 5.4 % for all 25 years of 21099, as it did on run 50's 20899 and run 48's 20431.</li><li>The dogpiles (above).</li></ul> **What the bar needs:** `node critic/scripts/c48_top.cjs` on `npm run sim -- --scenario 1938 --seed 21099 --years 25` and on seed 20899: no top-5 holder within ±0.2 % of the same share for 20 or more years. |
| God Mode | 7 | 7 | **Rescored.** **Better:** <ul><li>**R43f:** Spawn on Greater Poland now makes "Free Greater Poland Voivodeship" (run 50: "Free Silesian Voivodeship"). The probe's "Bavaria" cell, Berlin −6, +10 cells (about 12.4° E, 50.7° N), lies in Saxony, so "Free Saxony" is right: the probe's label was wrong, not the game (`critic/c51_q_20875.json`, `critic/c51_q_21119.json`).</li><li>**R34d:** at peace, Breakthrough is refused on the tools' bar: "Not done: it is at war with no one: there is no front to break through." (`critic/shots/c51k_20879_00_breakthrough_clicked.png`).</li><li>The H-bomb on Paris (3,329,000 civilians) and the A-bomb on London, each with its alert and "Go to" (`critic/shots/c51a_21117_13_paris_h_strike.png`).</li><li>Revolt, Spawn, Found and Raze each have their ticker row, with no error.</li></ul> **Not 8:** **R51-N4.** At war (21151, Germany at war with Poland, Breakthrough from Berlin to Warsaw), the click is taken in silence. There is no corridor mark, no ticker row, and nothing new in the hour or on day 1 (`critic/shots/c51kw_21151_00_breakthrough_clicked.png`, `_01_day1_1500m.png`, `critic/c51_kw_21151.json`). SPEC says `forceBreakthrough` "makes a corridor and its row". The player cannot tell whether it worked. **What the bar needs:** `node critic/scripts/c51_kw_breakthrough.mjs 21151`. In the shot after the two clicks there must be a mark of the corridor on the map, or a row in the ticker. |
| Editor and scenarios | 7 | 7 | **Rescored.** G 21121: fleets and a Polish bomber are placed, and a fleet at Berlin is refused ("Not done: no water of a sea is near the place."). The scenario exports and loads as placed: 89 German, 76 British and 50 Polish forces and 10 warheads (`critic/c51_g_21121.json`). **Not 8:** <ul><li>The run-26 scenario is still refused: "made by an older version of Warism" (`critic/c51_os2_c51.json`).</li><li>The editor's nation list is one flat list of 100+ names (same JSON, `editorText`).</li><li>(The probe's day-120 mark timed out after a pause, as in runs 48 and 50. That is the probe, not the game.)</li></ul> **What the bar needs:** `node critic/scripts/c51_os2_scen.mjs critic/c26_critic_standoff.warsim-scenario c51` loads the file, or says what it changed to load it. And the editor's nation list is searchable or grouped (`c51_g_editor.mjs 21121`, a typed filter narrows it). |
| Stats and history | 7 | **8** | **Up: run 50's one reason (R32-N3) is gone.** <ul><li>History rows wrap inside their own column, never under the date: "Soviet Union and Iraq fought in the air this month: Soviet Union lost 42 aircraft, / Iraq 18" (`critic/shots/c51rise_20429_history.png`; run 50 cut it).</li><li>On 7019's year-20 save (hash `6a8590fe`, the same as run 50's), History opens in 128 ms with 3,714 events of 28 kinds (`critic/c51_hi_7019.json`).</li><li>The CSV has 3,716 lines (`critic/c51_dl_7019.json`).</li><li>The nuke charts (warheads, nuclear dead, land under fallout) draw (`critic/shots/c51a_21117_33_chart_*.png`).</li></ul> **Not 9:** within an hour, History still lists a freed nation's release after the wars it ended (R51-N5). |
| UI/UX and polish | 7 | 7 | **Rescored.** **Better:** <ul><li>**R43b:** the single order row reads "366: transports sunk, the landing is over", whole on desk, phone and landscape (`critic/c51_lost_desk.json`, `_phone.json`, `_land.json`; run 50 cut it at "the transports of its…").</li><li>**R43c:** on a phone, a tap opens the merged row to "…(Square infantry division 366, Square infantry division 367)" (`critic/c51_lost_phone6.json`).</li><li>**R34k:** a touch screen's tap shows the landing's mark (`critic/c51_tm_touch.json`).</li><li>**R47:** the landings bar reads truly while a landing gathers and sails, day by day, against each division's panel ("sails in about 4 … 3 … 2 … a day", then "at sea", then "over: 4 landed") on desk, phone and landscape (`critic/c51_lbar_*.json`).</li><li>No page error in any of the 76 c51 JSONs.</li></ul> **Not 8:** <ul><li>**R51-N1:** the cancelled row's words are false for a week (Naval row).</li><li>**R51-N3:** on a landscape phone the open row's last divisions and its Cancel button are below the bar's 40 vh fold, inside its own scroll (`critic/shots/c51lbar_eng_br4_land_21103_844_d0.png`).</li><li>On a phone the bar is hidden while the nation panel is open, as Take control leaves it (`barVisibleWithNationPanel: false`, `critic/c51_lbar_jap_sh3_phone_21101_390.json`). ADR-854 chose that; see Design objections.</li></ul> **What the bar needs:** `node critic/scripts/c51_lbar.mjs 21107 GER ENG 1100.5,267.5 1031.5,266.5 3 ger_norwich3_phone 390 844 25 3`. From the cancel day on, the row's words must match the divisions' panels each day: "On the march" is not "back at Hamburg". And on 21103 at 844 × 390, the open row's Cancel must be on screen without scrolling. |
| Performance | 7 | 7 | **Rescored, alone, at the end, on the same save as run 50** (7019's year 20 is the same world: hash `6a8590fe` on both builds). <ul><li>3,000 / 1,200 / 600 m/px: 58.8–60.2 fps.</li><li>120 m/px: 31.0–39.6 (run 50: 33.6–40.0).</li><li>30 m/px: 40.1–47.3 (run 50: 37.8–46.8) (`critic/c51_pf_7019.json`).</li><li>The two 12-year watches at Max: 1,385–2,254 frames a year, the longest gap 100 ms, 0 frames over 500 ms (`critic/c51_lwhon_21141.json`, `critic/c51_lwplain_21143.json`).</li><li>Headless 7019: 3.38 ms a tick (run 50: 3.48); 21099: 3.45 ms.</li></ul> **Not 8:** the unit zooms on a late world still run at 31–47 fps. **What the bar needs:** `node critic/scripts/c51_pf_lookfps.mjs 7019 critic/c51_seed7019_y20.bin`, alone, at 45 fps or more at 120 m/px in both looks. |
| Stability | 8 | 8 | **Re-earned on new seeds.** <ul><li>**Save and load in the page (21137):** saved at t4800 (hash 1955349565) and run 200 days: 1219535545. Loaded twice and run 200 days each time: 1219535545 both times (`critic/c51_sl_plain_21137.json`).</li><li>**workerDeterminism:** 3517 ends `7e113d94` on every arm, as in runs 46–50. 20859 ends `ea9206eb`, as in run 50. New 21059 ends `0a7a7477` on all arms (`critic/c51_wd_*.log`).</li><li>**worldInvariants:** 0 broken on 8 seeds, among them 20857 and 21055 for ten years.</li><li>**The two 12-year watches:** 0 page errors.</li><li>**No page error** in any c51 JSON.</li><li>Every far route and sinking of run 50 that the rules did not change tells the same news hour for hour.</li></ul> |
| Semantic zoom to unit level (needs 8) | 8 | 8 | **Re-earned on new seeds.** <ul><li>**Z 21111:** one camera from 6,000 to 3 m/px in 18 steps. Elements appear from 1,573 m/px (7,958) and individuals at 28 m/px (13,832), down to 4,447 at 3 m/px, with no error (`critic/c51_z_21111.json`).</li><li>**PHZ 21133:** on the phone from 30,000 to 25 m/px, with no overflow at any tier (`critic/c51_phz_21133.json`).</li><li>**The 12-year watch** zooms 30,000 → 25 m/px on year 12 (`critic/shots/c51lwhon_21141_zoom_*.png`).</li></ul> |
| Naval warfare (needs 8) | 7 | **7** | **Rescored.** **Better:** <ul><li>**R43a (R50-N1):** 20841, three divisions from Tokyo to Shanghai, lands on days 4.9, 5.4 and 5.5 (run 50: day 39.6) (`critic/c51_far_20841_jap_sh3.json`).</li><li>In the page on 20861 the click is three landings, from Tokyo, Ōsaka and Hiroshima, all ashore by day 6 (`critic/c51_lbar_jap_sh3_20861_1600.json`).</li><li>New 21041: 4.9–5.4 days. 21045 (four from London to Bremen): 5.8 days.</li><li>**R44:** `slowClick` passes on all 25 landing seeds; 19206's worst click is 2.9 days over its best way (`critic/c51_li_19206_jap.log`).</li><li>**R43e (R50-N5):** on 20845 no division reaches Hamburg after the sinking at t89. Run 50 had them arrive at t222 and t242 (`critic/c51_far_20845_ger_norwich.json`).</li><li>**R46:** the first battle `seaBattles` lists for 20885 (t107, Soviet against Romanian ships in the Black Sea) is drawn at its camera with ships, tracers and the battle ring, at 250, 60 and 25 m/px in both looks (`critic/shots/c51sb_20885_*.png`). Run 50's probe found no ship there.</li><li>**R47** reads truly while gathering and at sea (UI row).</li></ul> **Not 8, and the 7 rests on the cancel's words, not on its rule:** <ul><li>**R51-N1:** on 21107 (Germany, three divisions from Berlin to Norwich, cancelled on day 3), the row reads "cancelled: back at Hamburg" from the cancel's hour. The divisions march 6–7 more days to Hamburg, a port they never reached, and their panels say "On the march" (`critic/c51_lbar_ger_norwich3_phone_21107_390.json`, `critic/shots/c51lbar_ger_norwich3_phone_21107_390_cancel.png`). Headless it is the same: cancelled at h74, at Hamburg at h228–252 (`critic/c51_cancel_21107_ger_h74.json`). The march itself is ADR-855's (see Design objections). For a week the player is told something false about his own divisions.</li><li>**R51-N2:** after a cancel at sea, the AI can ship the division off again. Its panel says "At sea, bound for its landing", and no row stands for that voyage (`critic/shots/c51cp_jap_sh_20661_end.png`).</li></ul> **What the bar needs:** <ul><li>`node critic/scripts/c51_lbar.mjs 21107 GER ENG 1100.5,267.5 1031.5,266.5 3 ger_norwich3_phone 390 844 25 3`: from the cancel day on, the row says they are marching to Hamburg, with days, until the day their panels say they are there. (Or they stop where they stand, if the user changes ADR-855.)</li><li>`node critic/scripts/c51_cancel_page.mjs 20661 JAP CHI 1818.5,385.5 1715.5,413.5 2 jap_sh 26 240`: when 364 sails again with no player order, its panel does not say "bound for its landing" without saying whose.</li><li>`landingInvariants` at 0 broken on the 25 seeds above.</li></ul> |
| Tanks (needs 8) | 8 | 8 | **Re-earned on a new seed.** C 21115, Germany against Poland, day 5. At 250 m/px armoured divisions 40 and 42 are labelled with leader lines among motorised divisions 44–45 and the Polish tank brigades 581–583 (`critic/shots/c51c_21115_arm_0250m.png`). The shots go down to 10 m/px (`_arm_0010m.png`). No error. |
| Aircraft (needs 8) | 8 | 8 | **Re-earned on new seeds.** <ul><li>**W 21127:** a fighter ordered to strike toward Warsaw is followed. At 3,000 m/px it flies with its mark in 56 of 61 samples, is never shown without one, and stays a median 31 px from its sorties. At ×5 it has its mark in 60 of 61 (`critic/c51_w_21127.json`; run 50: 56/62, 60/60).</li><li>**PL 21125:** 37 planes in hour 2, marked from 3,000 to 25 m/px in both looks (`critic/c51_pl_planes.21125_GER_POL_5321.log`).</li><li>**worldInvariants** (air included) on 21055 for ten years: 0 broken.</li></ul> |
| AI nuclear use (needs 8) | 8 | 8 | **Rescored on HEAD's own 7019 year-20 save.** The game pauses on two AI strikes: <ul><li>China on the USA near Belfast (54,000 civilians);</li><li>China on Iceland near Höfn with a hydrogen bomb (8,000 civilians).</li></ul> Each has its alert, "Go to" and ticker row (`critic/c51_an_7019y20.json`, `critic/shots/c51an_7019y20_0_goto.png`). It is the same world as runs 39–50 (the same hash), so this shows the rule still holds, not a new strength. |

## Blocking issues

None.

- Every rule checker run reports 0 broken: diploInvariants on 25 runs, landingInvariants on 25 seeds,
  worldInvariants on 8, workerDeterminism on 3, and R47d's landingRows on 8 cases.
- No case of run 50 is worse.
- No page probe logged an error.
- R51-N1 makes a row say what is not true for a week (the march itself is ADR-855's). But the
  cancel does end the landing, and the divisions are not lost, so I file it as non-blocking.

Naval is still 7 against a bar of 8, so there is no release.

## Non-blocking issues (prioritised)

1. **R51-N1 (naval and UI readability).** A gathering landing's cancel marches its divisions on to the port (as
   ADR-855 records), and the row says "cancelled: back at {port}" at once and keeps saying it while they march.
   - **The case:** 21107, Germany, three divisions from Berlin to Norwich, cancelled on day 3. The row reads
     "Norwich from Hamburg · cancelled: back at Hamburg". Its three divisions are 13 cells from Hamburg and keep
     walking there for a week; their panels say "On the march"
     (`critic/c51_lbar_ger_norwich3_phone_21107_390.json`, days 3–7;
     `critic/shots/c51lbar_ger_norwich3_phone_21107_390_cancel.png`). Headless, they reach Hamburg at h228–252
     (`critic/c51_cancel_21107_ger_h74.json`).
   - **What is scored:** the words. ADR-855 records the march itself: a cancel orders each division to the port's
     cell, and "no new rule". So the march is judged under Design objections. The defect here is that the row and the
     tooltip ("Its divisions go back to Hamburg") say something that is not true: the divisions were never at Hamburg,
     and for a week they are not there.
   - **Fix:** while any of a cancelled landing's divisions is still marching to the port, the row says so ("cancelled:
     3 marching to Hamburg, about 7 days"). It says "back at {port}" only when they are there, and the tooltip says
     "go to", not "go back to".
2. **R51-N2 (naval readability).** After a cancel at sea, the nation's AI can take the division at once and ship it
   off. Its panel says "At sea, bound for its landing", but "Your landings" has no row for it.
   - **The case:** on 20661 (`critic/c51_lbar_jap_sh_cancel1_20661_1600.json`), division 364's landing is cancelled
     on day 1. On day 2 the row reads "cancelled: back at Tokyo", while 364 is already at sea off Tokyo, "bound for
     its landing". It sails west and stands "Holding" at 1718.5, 373.5 on day 8: Chinese land at Weihai, where
     Japan's AI lands it on the run-50 Qingdao route too (`critic/c51_far_20661_jap_qingdao.json`, t182).
   - **A second run:** with the same seed and cancel, the AI waits 7 days at Tokyo before it sails again (`player
     order null`; `critic/c51_cancel_20661_jap_h26.json`, `critic/c51_cp_jap_sh_20661.json`). At h240, 364 is at sea
     "bound for its landing" and the bar is empty (`critic/shots/c51cp_jap_sh_20661_end.png`).
   - The AI taking it back is SPEC's (§7.1, "Taking a nation keeps its AI layers on"). But the panel's words read as
     the player's landing.
   - **Fix:** a division on the AI's voyage says so ("At sea with the AI's landing"), as R35 does for a fleet back
     with the AI. Or a cancelled landing's divisions are held a while before the AI takes them.
3. **R51-N3 (UI, landscape phone).** At 844 × 390 the bar's 40 vh cap (156 px) hides the open row's last
   division and its "Cancel the landing" button inside the bar's scroll
   (`critic/shots/c51lbar_eng_br4_land_21103_844_d0.png`). **Fix:** at a short height, Cancel goes in the row's head,
   or the open row takes the bar's room.
4. **R51-N4 (God Mode).** At war, Breakthrough is taken in silence: there is no corridor mark and no ticker row
   (`critic/shots/c51kw_21151_00_breakthrough_clicked.png`, `_01_day1_1500m.png`). **Fix:** draw the corridor for its
   10 days, or tick "God opened a breakthrough for Germany near …".
5. **R51-N5 (history order).** The ticker now gives "was freed from" before its "left its war" rows (R43d). History
   still lists them in the old order within the same date: newest first, "was freed from" sits above its effects, so
   it reads as coming after them (`critic/shots/c51rise_20429_history.png`). **Fix:** apply R43d's `causeFirst` to
   History's order within an hour too.
6. **R51-N6 (UI wording).** On 20861 day 0, row 2 says "waits for the landing from Hiroshima: about a day", while row
   3, Hiroshima's own, says "sails in about 2 days". Row 2 then sails on day 1, before Hiroshima
   (`critic/c51_lbar_jap_sh3_20861_1600.json`). The words "waits for" do not match what happens. A landing at sea
   also says only "at sea", with no days to land.
7. **R51-N7 (naval, small).** "They land together" (365's panel on 20661) lands them 12 hours apart, t117 and t129
   (`critic/c51_far_20661_jap_sh.json`). On 20841 they land at t119, t129 and t131.
8. Carried, unchanged:
   - the run-26 scenario is refused;
   - the editor's nation list is flat;
   - Denmark is frozen;
   - year-one dogpiles;
   - R44-N3, R46-N5.

## Run 50's cases re-run

| Run 50 case | `3fe138b1` (run 50) | HEAD `14a85a51` | Evidence |
|---|---|---|---|
| **R50-N1** 20841 three divisions, Tokyo → Shanghai (headless) | ashore day 39.6; 35 days waiting at Tokyo for 366 | **ashore t119 / t129 / t131 (4.9–5.5 days)**; 366 boards at its own port | `critic/c51_far_20841_jap_sh3.json` |
| R50-N1 in the page, 20861 | sails on day 35 | **three landings (Tokyo, Ōsaka, Hiroshima), ashore by day 6** | `critic/c51_wait_jap_sh3_20861_1600.json`, `critic/c51_lbar_jap_sh3_20861_1600.json` |
| R49-N5 20661, two divisions | ashore day 26.3 | **t117 / t129** | `critic/c51_far_20661_jap_sh.json` |
| **R50-N2** single row beside a panel | "Square infantry division 366: the transports of its…" | **"366: transports sunk, the landing is over"**, whole on desk, phone and landscape | `critic/c51_lost_desk.json`, `_phone.json`, `_land.json` |
| **R50-N3** phone merged row's names | in a tooltip only | **a tap opens it with both names** | `critic/c51_lost_phone6.json` |
| **R50-N4** freed rising's order | effects before the cause in the ticker | **the cause first in the ticker**; History not changed (R51-N5) | `critic/shots/c51rise_20429_history.png` |
| **R50-N5** 20845 Berlin → Norwich, group sunk t89 | marched on to Hamburg, there at t222 and t242 | **no arrival at Hamburg after t89** | `critic/c51_far_20845_ger_norwich.json` |
| **R50-N6** God names | "Free Silesian Voivodeship" for Greater Poland | **"Free Greater Poland Voivodeship"**; "Free Saxony" is right for the probe's cell | `critic/c51_q_20875.json` |
| landingInvariants, run 50's 19 seeds | 0 broken | 0 broken, with `slowClick` now in the checker (19206: 367's longest gathering 28.1 → 4.1 days) | `critic/c51_li_*.log` |
| diploInvariants, run 50's 18 runs | 0 broken | 0 broken | `critic/c51_diploinv_20*.log` |
| Far routes 20661 Qingdao, 20665 Bremen, 20667 Tokyo, 20843 Malta, USA Chicago → Norwich | as run 50 | the same landing hours and events (Qingdao 364 at t182, 365 at t2515; Bremen t142; Tokyo t871) | `critic/c51_far_*.json` |
| Sinkings 3517 n3k1 … n2k0, with and without a real save | identical | identical, hour for hour | `critic/c51_sunk*_3517_*.json` |
| workerDeterminism 3517, 20859 | `7e113d94`, `ea9206eb` | the same | `critic/c51_wd_*.log` |
| worldInvariants 20637, 20851, 20853, 20855, 20857 | 0 broken | 0 broken | `critic/c51_wi_*.log` |
| Hero sizes 20471 | blended 55 → 110 px | the same | `critic/c51_hero.20471_17520_desk.log` |
| Relations graph 20887 desk, 20889 phone, day 365 | labels overprinted; phone illegible | **no overlap; the phone's labels read** | `critic/shots/c51rg_20887_desk_d365.png`, `c51rg_20889_phone_d365.png` |
| Sea balls 20885 | no ship at the probe's pick | **at R46's camera (t107), 24 elements, ships and tracers** | `critic/c51_sbballs_20885.json`, `critic/shots/c51sb_20885_*.png` |
| Breakthrough 20879 (at peace) | nothing to see, nothing said | **refused on the tools' bar with its reason**; at war still silent (R51-N4) | `critic/shots/c51k_20879_00_breakthrough_clicked.png` |
| The run-26 scenario | refused | refused | `critic/c51_os2_c51.json` |
| Frame rate on 7019 year 20 | 120 m/px 33.6–40.0; 30 m/px 37.8–46.8 | 31.0–39.6; 40.1–47.3 (the same world, hash `6a8590fe`; within noise) | `critic/c51_pf_7019.json` |
| Save and load in the page | 20901, 20903 identical | 21137 identical (new seed) | `critic/c51_sl_plain_21137.json` |

## Design objections (none blocking, no score lowered)

- **ADR-855: a gathering landing's cancel orders its divisions on to the port.** On 21107 that is a week's march to
  Hamburg, a port they never reached (`critic/c51_cancel_21107_ger_h74.json`). R43e (ADR-841) stops the march to the
  port when a landing ends any other way, by a sinking or a lost port. So a landing ended by the player sends its
  divisions further than one ended by the enemy. "Stop where they stand" would match R43e and a player's sense of
  "cancel". (The row's false words about this march are scored, as R51-N1.)

- **ADR-838 splits one click into landings from several ports, and R47 gives each its own row and cancel.** The
  player clicked once; the bar shows three rows ("Shanghai from Tokyo / from Ōsaka / from Hiroshima"), and a cancel
  ends only one. R47's own brief asked for "the outcome once for the operation". A click's rows could be grouped,
  with one cancel for the click.
- **ADR-854: on a phone a nation's panel hides the bar.** Take control leaves Japan's panel open, so right after the
  player's first order the bar is not on the screen (`barVisibleWithNationPanel: false`,
  `critic/shots/c51lbar_jap_sh3_phone_21101_390_nationpanel.png`). A division's panel hides it too. On a phone the
  bar is therefore seen only with no panel open.
- **The bar gives way to a nuclear alert** (ADR-854). An AI strike during a landing removes the bar until the alert
  is dismissed. That is the user's choice; noted.
- **§7.1's AI layers on a taken nation** pick up a cancelled division within hours and ship it to the AI's own
  landing (R51-N2). The design is clear in SPEC. But "cancel" then reads as a pause, not a stop.
- ADR-834's "was freed from" (run 49's objection) is unchanged.

## Ideas from other games (not scored)

- Hearts of Iron's naval invasion screen shows one plan with all its divisions and ports, a progress bar to "ready",
  and a single cancel. It is close to R47's bar, grouped by the click.
- Europa Universalis lets a cancelled march stop at once ("halt"), separate from "go back". That is R51-N1's fix.

## Strengths (verified)

- **A click's landing now takes days, not months.** Run 50's worst case, 39.6 days, is 5.5. On the new headless
  far routes that land (21041, 21045), the slowest click lands in 5.8 days. In the page, Rome to Valletta (21105)
  is ashore on day 8, after a week at sea. `slowClick` holds on 25 seeds (`critic/c51_far_*.json`, `critic/c51_li_*.log`).
- **The landings bar says what the panels say while a landing runs.** On six cases at three screen sizes, the
  countdown ("sails in about 4 … 1 day") ends on the sailing day, and "over: 4 landed" comes on the day they land
  (`critic/c51_lbar_*.json`). R47d's checker agrees over 2,633 hours.
