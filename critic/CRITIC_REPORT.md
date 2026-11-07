# Critic report, run 50 (full): after R41 ("R38d's gate goes; a sibling waited up to a month") and R42 (run 49's issues)

- **Mode: full.** I decided this from git before anything else (CRITIC_PROMPT, ADR-804). The last report (run 49,
  `249ae535`, on `5da444a8`) has a score under its bar (naval 7, bar 8), and the last three reports were not all
  focused. But the second condition fails: `249ae535` filed only R42. `beac4e01` "ROADMAP R41: …" names R41, which
  was open before run 49 (run 49 calls it "the builder's open R41"), and it changes `src/sim/systems/landings.ts`.
  So every dimension is scored afresh here, the 8s included. `3f791e35` (R42) and `3fe138b1` (R42b) name R42, which
  run 49 filed.
- **Commit judged:** `3fe138b1bbfa930057c11df9fade770102d2a8f2`, HEAD at the start (`critic/c50_commit.txt`).
  The working tree's uncommitted `PROGRESS.md` line is the builder's log and is not judged. **Date:** 2026-11-06.
- **Build:** `vite build --outDir critic/c50_dist`, exit 0 (`critic/c50_build.log`). Served by `vite preview` on
  127.0.0.1:**5311**, stopped at the end (5299 was already taken by a server that is not mine). Driven through
  Playwright Chromium at desk 1600 × 900, phone 390 × 844 and a landscape phone 844 × 390.
- **A probe fault, caught and redone.** Run 48's copied scripts imported `c31_lib.mjs`, whose base URL is fixed at
  5299. The first `c50_z_zoom` and part of `c50_c_battle` ran against that foreign server. I stopped that suite,
  pointed every `c50_*.mjs` at `c50_lib.mjs` (5311), and reran all of it (`critic/scripts/c50_suiteB.sh`). No
  finding below comes from the 5299 runs.
- **Runs.**
  - **Headless, 65 jobs, 4 at a time** (`critic/scripts/c50_jobsAll.txt`, every job exit 0, `critic/c50_q_all.done`):
    - diploInvariants: 16 ten-year runs (run 49's 20429, 20491, 20493, 20413, 20495, 20601–20609; new 20801, 20803,
      20805, 20807, 20809 heroes, 20813 random with heroes) and two five-year random worlds (20611, 20811);
    - landingInvariants: 19 seeds (run 49's 19206, 19207, 19113, 18705, 19111, 20621–20629, 20673; new 20821–20835);
    - worldInvariants: 20637, 20851, 20853 (heroes), 20855 (random world), 20857 (ten years);
    - workerDeterminism: 3517 at 2190 h, new 20859 at 8760 h;
    - run 49's far routes and sinkings, with and without a real save; new far routes on 20841, 20843, 20845.
  - **Headless worlds:** 7019 for 20 years (saved, `critic/c50_seed7019_y20.bin`) and new 20899 for 25 years
    (`critic/c50_sim20899.log`, `critic/c50_top_20899.txt`).
  - **Page, one at a time:**
    - run 49's cases: the lost rows ×5 (desk, phone, landscape, six on desk and phone), the freed rising, hero
      sizes ×3;
    - new for R42a: `critic/scripts/c50_wait_page.mjs`, the landing's wait read day by day on 4 cases;
    - zoom 20865, sea battles 20867 and 20869, land battle 20871, God nuke 20873, God tools 20875, editor 20877,
      breakthrough 20879, planes 20881, wing 20883, sea balls 20885, phone, UI, relations 20887 (desk, heroes) and
      20889 (phone, random diplomacy), phone zoom 20891, the run-26 scenario, force war 20893, touch;
    - on 7019's year-20 save: AI nukes, History, export;
    - two 12-year watches, 20895 with heroes and 20897 plain;
    - new: save and load inside the page (`critic/scripts/c50_saveload_page.mjs`, 20901 and 20903);
    - last, with nothing else of mine running: the frame rate on 7019's year-20 save.

## Verdict

**R41 and R42 do what they claim. No checker reports a broken rule on any seed of this run, and there is no
blocking issue.**

- **No broken rule:** 18 diplomacy runs, 19 landing seeds, 5 world seeds and 2 worker seeds.
- **R49-N4 is gone.** No `farPort` note appears on any of the 19 landing seeds. On 19206, division 367's longest
  gathering is 28 days (run 49: 46).
- **R49-N5 is told now, and told truly.** The tooltip counts down a day a day ("in about 22 days" … "2 days"), and
  the landing sails on the day it said, on all four cases.
- **R49-N1 is fixed.** Hero tags grow 14 → 16 → 19 → 21 → 24 → 28 px from 9,999 to 5,000 m/px; there is no step.
- **R49-N2 is fixed.** "Dutch East Indies was freed from Netherlands" is in the ticker.
- **R49-N3 in part.** Both order rows are now on the screen, but a single division's row is still cut before its
  meaning.

**Scores.**

- **Stability rises to 8.** Run 49 named what the 8 needed: this run's 24 page years with no error and no frame over
  500 ms, and save and load inside the page, which resume the very same world on two seeds.
- **Naval stays at 7 (bar 8).** A new seed shows a three-division click waiting 35 days at Tokyo for a 4-day crossing
  (R50-N1). The rule bounds a sibling landing's wait at a month but leaves no bound on the click's own last division.

## Scores

| Dimension | Run 49 | Run 50 | |
|---|---|---|---|
| Map visuals and readability | 7 | 7 | **Rescored on new seeds.** **Better:** <ul><li>R49-N1 fixed. On 20471 (desk, 1940) the hero tags are 55 × 14 px at 10,001 and 9,999 m/px. They grow to 63 × 16 at 9,000, 73 × 19 at 8,000, 96 × 24 at 6,000 and 110 × 28 at 5,000 (`critic/c50_hero.20471_17520_desk.log`).</li><li>At 6,000 m/px on 20651, "P.100 Ercole" sits beside ITALY's name, not over it (`critic/shots/c50hero_desk_20651_06000.png`).</li><li>On the phone the tags stop growing at 1.3× ("P.100 Ercole" 98 × 18, 25 % of 390 px; run 49: 148 px, 38 %) (`critic/c50_hero.20471_17520_phone_390_844.log`).</li></ul> **Not 8:** <ul><li>The ranking still cuts "French Equatorial…" and "Anglo-Egyptian S…" in every desk shot (`critic/shots/c50lwhon_20895_y12_world.png`).</li><li>The relations graph still prints labels over each other: "Albania Manchuku", "U…d Kingdom", "…thern Rho Ceylon" (`critic/shots/c50rg_20887_desk_d365.png`).</li><li>On the phone the graph's labels cannot be read at all (`critic/shots/c50rg_20889_phone_d365.png`).</li></ul> |
| Diplomacy, war, alliance, puppet, revolt depth | 7 | 7 | **Rescored.** <ul><li>0 broken on all 18 runs: run 49's 11 again and new 20801, 20803 (random), 20805, 20807 (scenario), 20809 (heroes), 20813 (random, heroes) to day 3650, and 20811 (random world) to day 1825 (`critic/c50_diploinv_*.log`).</li><li>R49-N2 fixed. On 20429 at t13110 the ticker has "Dutch East Indies was freed from Netherlands" with its two "left its war" rows (`critic/shots/c50rise_20429_history.png`). The headless trace is unchanged: DEI free, not at war with NED (`critic/c50_rise_20429.log`).</li><li>Force war 20893 and the relations graphs on day 0 match the sim (67 and 77 nodes; `critic/c50_rg_20887_desk.json`, `critic/c50_rg_20889_phone.json`).</li></ul> **Not 8:** <ul><li>The ticker gives the effect before the cause: the two "left its war" rows come above "was freed from" (same shot).</li><li>The graph's overprinted labels (above).</li><li>Year-one wars are still dogpiles: "Germany +6 ⚔ United Kingdom +36" (`critic/shots/c50rg_20887_desk_d365.png`), "Soviet Union +15 ⚔ France +3" (`critic/shots/c50lwhon_20895_y12_world.png`).</li></ul> |
| Emergent world dynamics over long runs | 7 | 7 | **Rescored on new worlds.** <ul><li>20899 over 25 years (headless): the USA climbs from 7.4 % to 36.5 % of the land by year 9 and falls back to 17–22 %. The Soviet Union falls from 28 % to 5.7 % and recovers to 14.7 %. Japan rises to 13.3 % in year 22. 78–96 nations live (`critic/c50_top_20899.txt`).</li><li>The 12-year page watches end in two different worlds. On 20895, Japan holds 10 M km² and Germany holds parts of Canada (`critic/shots/c50lwhon_20895_y12_world.png`). On 20897, China is third with 11.9 M km² and South Africa sixth (`critic/shots/c50lwplain_20897_y12_world.png`).</li></ul> **Not 8:** <ul><li>Canada (9.5–11.3 %) and Denmark (5.4–5.5 %) are frozen for 25 years on 20899, as on run 48's 20431.</li><li>The dogpiles (above).</li></ul> |
| God Mode | 7 | 7 | **Rescored on new seeds.** <ul><li>A 20873: an H-bomb on Paris (3,329,000 civilians, the alert with "Go to", the burst, France's panel, the charts) and an A-bomb on London (`critic/shots/c50a_20873_13_paris_h_strike.png`).</li><li>Q 20875: revolt 102 → 103 nations, spawn → 104, found and raze a city, each with its ticker row (`critic/c50_q_20875.json`).</li><li>No error.</li></ul> **Not 8:** unchanged from run 48. <ul><li>A click on Bavaria makes "Free Saxony"; a click on eastern Poland makes "Free Silesian Voivodeship" (same JSON). The new nation is named for a province the player did not click.</li><li>Breakthrough leaves nothing to see in the hour of the click (`critic/c50_k_breakthrough.20879.log`, as in run 48).</li></ul> |
| Editor and scenarios | 7 | 7 | **Rescored.** G 20877: fleets and a Polish bomber are placed; Poland has 10 warheads. The scenario exports, Cancel works, and it loads as placed: 89 German, 76 British and 50 Polish forces and 10 warheads (`critic/c50_g_20877.json`). **Not 8:** <ul><li>The run-26 scenario is still refused: "made by an older version of Warism" (`critic/c50_os2_c50.json`).</li><li>The editor's nation list is still one flat list.</li><li>(The probe's last mark, day 120, timed out after a pause, as in run 48. That is the probe, not the game.)</li></ul> |
| Stats and history | 7 | 7 | **Rescored on HEAD's own 7019 year-20 save.** <ul><li>History opens in 121 ms with 3,714 events of 28 kinds, and each kind filter answers in under 180 ms (`critic/c50_hi_7019.json`).</li><li>The CSV has 3,716 lines (3,714 + header + end), and the JSON has the same events (`critic/c50_dl_7019.json`).</li><li>"Puppet released" is a History type and filters (`critic/c50_hi_7019.json` kinds).</li></ul> **Not 8:** R32-N3, rows cut mid-word, is unchanged (`critic/shots/c50rise_20429_history.png`: "…Soviet Union lost 42 aircraft, / Iraq 18"). |
| UI/UX and polish | 7 | 7 | **Rescored.** **Better:** <ul><li>R42b: beside a panel both order rows are on the screen: the at-port division's row and "2 divisions lost at sea with their transports". That holds on desk, phone and landscape phone (`critic/shots/c50lost_desk_rows.png`, `_phone_rows.png`, `_land_rows.png`).</li><li>R42e: the string now reads "no others can come to their port" (`src/ui/i18n/en.json`). Beside a panel the brief form shows instead ("2 divisions: transports sunk, the landing is over"), so I did not see the full string rendered.</li><li>No page error in any c50 page JSON.</li></ul> **Not 8:** <ul><li>**R50-N2:** a single division's order row is still cut before its meaning. On desk it reads "Square infantry division 366: the transports of its…", and on the phone it is cut before "the landing is over" (same shots). The merged row has a short form; the single row does not. Its tooltip is only "go to the formation", so the full text is shown only in the panel after a click (`critic/shots/c50lost_desk_portpanel.png`).</li><li>A refused order is cut the same way: "Square infantry division 365: not done: there is o…" (`critic/shots/c50wait_jap_qd_20861_1600_d3.png`).</li><li>On the phone the merged loss row no longer names the divisions, and the names are in a tooltip a phone cannot hover.</li><li>Carried: R39-N2, R39-N3, R40-N2.</li></ul> |
| Performance | 7 | 7 | **Rescored, alone, at the end.** <ul><li>7019's year-20 save (HEAD's own): 3,000 / 1,200 / 600 m/px at 58.9–60.2 fps, 120 m/px at 33.6–40.0, 30 m/px at 37.8–46.8 (`critic/c50_pf_7019.json`).</li><li>Run 48 had 21–30 at the two unit zooms. But the busiest fight the probe picked here has 13 engaged formations and draws 0 elements at 120 and 30 m/px, so the two runs are not the same scene. The machine is also quieter tonight: headless 7019 ran at 3.48 ms a tick against run 48's 6.99 (`critic/c50_seed7019_save.log`). Not compared; it moves no score.</li><li>The two 12-year watches at Max: 59.4–60.0 fps every year, longest gap 17–300 ms, 0 frames over 500 ms (`critic/c50_lwhon_20895.json`, `critic/c50_lwplain_20897.json`).</li><li>20899's 25 years: mean tick 2.87 ms.</li></ul> **Not 8:** there is no like-for-like evidence that the unit-zoom rate on a late world has risen above run 48's 21–30. |
| Stability | 7 | **8** | **Rescored. Up: run 49's named gap is closed.** <ul><li>Save and load inside the page, through the page's `sim.save()` and `sim.load()` (not the Settings or autosave UI), resume the same world. On 20901 (heroes), saved at t4800 and run 200 days: hash 3341512161. Loaded twice and run 200 days each time: 3341512161 both times. On 20903 (random diplomacy, 400 days): 3275338370 on all three arms (`critic/c50_sl_hon_20901.json`, `critic/c50_sl_rnd_20903.json`).</li><li>Two 12-year watches at Max (20895 heroes, 20897 plain): 0 page errors and 0 frames over 500 ms.</li><li>workerDeterminism: 3517 at 2190 h ends `7e113d94` on every arm, as in runs 46–49; new 20859 at 8760 h ends `ea9206eb` on all four arms (`critic/c50_wd_*.log`).</li><li>worldInvariants on 5 seeds (heroes, random world, ten years on 20857): 0 broken.</li><li>No page error in any of the 40 c50 page JSONs that record errors.</li><li>A real save in the sinking hour still tells the same news on all six cases (`critic/c50_sunksave_*.json`).</li></ul> |
| Semantic zoom to unit level (needs 8) | 8 | 8 | **Re-earned on new seeds.** <ul><li>Z 20865: one camera from 6,000 to 3 m/px in 18 steps. Elements appear from 1,573 m/px and individuals at 28 m/px (13,826), down to 4,435 at 3 m/px, with no error (`critic/c50_z_20865.json`, `critic/shots/c50z_20865_00.png` … `_17.png`).</li><li>PHZ 20891: 40 days on the phone from 30,000 to 25 m/px, with no overflow at any tier, and a tap opens Japan's 379 in contact (`critic/c50_phz_20891.json`).</li><li>Run 49's one seam (R49-N1) is gone: the hero tags blend (Map visuals row).</li></ul> |
| Naval warfare (needs 8) | 7 | **7** | **Rescored.** **Better:** <ul><li>R49-N5 told truly. The click's tooltip says "it sails from Tokyo in about 22 days, when the last of it is there", and the marching division's panel says "about 22 days; its landing waits for it". Both count down a day a day, and the landing sails on day 22 (20661 at desk width; at 390 px the probe's mouse hover shows the same tooltip, but a phone has no hover, so there only the marching division's panel line counts, and it does. The at-port division's status line says "At Tokyo, waiting for the rest of the landing" with no day count). Over 3 divisions on 20861 they say 35 days and it sails on day 35. On 20863, London to Bremen, they say 4 days and it sails on day 4 (`critic/c50_wait_*.json`, `critic/shots/c50wait_jap_sh_20661_1600_d0.png`).</li><li>R49-N4 gone: no `farPort` note on 19 landing seeds, where run 49 had them on 20621 and 18705. 19206's 367: 28.1 days gathering (46.0 in run 49); 364: 3.8 (31.0).</li><li>Every far route and sinking of run 49 tells the same news hour for hour (`critic/c50_far_*.json`, `critic/c50_sunk*.json`).</li><li>Sea battle 20867 (Soviet cruisers against a Yugoslav destroyer in the Adriatic) is ringed and labelled at 600 and 150 m/px (`critic/shots/c50sc_20867_click.png`).</li></ul> **Not 8:** <ul><li>**R50-N1:** a three-division click from Tokyo to Shanghai (20861; headless 20841, the same three) takes 39.6 days for a 4-day crossing. The landing waits 35 days at Tokyo for division 366, which walks 41 cells east from western Honshu (1777,393). Its transport group had started near Kyushu (1773,412) and was sailed to Tokyo (`critic/c50_far_20841_jap_sh3.json` trace). ADR-836 bounds the wait for a *sibling* landing with `SIBLING_WAIT_HOURS` (a month) and does not wait for one further off. The click's own last division has no bound (its landing's `waitLeft` is not capped): 35 days here, and longer for a division further away. So two rules about the same click disagree.</li><li>R50-N2: the single at-port row cut (UI row).</li><li>The sea-balls probe found no ship to draw at its pick, as in run 48 (`critic/c50_sb_20885.json`, el 0). That is the probe's miss, not scored, but it adds no evidence for an 8.</li></ul> |
| Tanks (needs 8) | 8 | 8 | **Re-earned on a new seed.** C 20871, Germany against Poland, day 5. At 250 m/px armoured divisions 40 and 42 are labelled with leader lines among motorised divisions 44–45 and Polish tank brigades 581–583. At 10 m/px they are turreted, tracked balls among infantry, with planes overhead and muzzle flashes (`critic/shots/c50c_20871_arm_0250m.png`, `_arm_0010m.png`). No error. |
| Aircraft (needs 8) | 8 | 8 | **Re-earned on new seeds.** <ul><li>W 20883: a fighter ordered to strike toward Warsaw is followed. At 3,000 m/px it flies with its mark in 56 of 62 samples, is never shown without one, and stays a median 32 px from its sorties. At ×5 it has its mark in 60 of 60 (`critic/c50_w_20883.json`; run 48: 51/56, 55/55).</li><li>PL 20881: 37 planes in hour 2, with marks from 3,000 to 25 m/px in both looks, and no error (`critic/c50_pl_planes.20881_GER_POL_5311.log`).</li><li>worldInvariants (air included) on 20857 for ten years: 0 broken.</li></ul> |
| AI nuclear use (needs 8) | 8 | 8 | **Rescored on HEAD's own 7019 year-20 save.** The game pauses on two AI strikes in 4 months: <ul><li>China on the USA near Belfast (54,000 civilians, 42,408 men);</li><li>China on Iceland near Höfn with a hydrogen bomb (8,000 civilians, 30,012 men).</li></ul> Each has its alert, "Go to" and a ticker row (`critic/c50_an_7019y20.json`, `critic/shots/c50an_7019y20_0_goto.png`). No error. This is the same world's same strikes as runs 39–48, so it shows the rule still holds, not a new strength. |

## Blocking issues

None.

- Every rule checker run reports 0 broken: diploInvariants on 18 runs, landingInvariants on 19 seeds,
  worldInvariants on 5 and workerDeterminism on 2.
- No case of run 49 is worse.
- No page probe logged an error.

Naval is still 7 against a bar of 8, so there is no release. A focused run may follow (ADR-804), and a full run must
come before a release.

## Non-blocking issues (prioritised)

1. **R50-N1 (naval, rules that agree).** One click's last division has no bound on how long its landing waits, but a
   sibling landing's wait is bounded (ADR-836, `SIBLING_WAIT_HOURS`, a month).
   - **The case:** Tokyo to Shanghai, three divisions (20861 page, 20841 headless). The landing waits 35 days at
     Tokyo for 366, marching from western Honshu, then sails 4 days. It lands on day 39.6.
   - **The player** is told the 35 days, truly, but watches two divisions idle a month.
   - **Evidence:** `critic/c50_wait_jap_sh3_20861_1600.json`, `critic/c50_far_20841_jap_sh3.json`.
   - **Fix:** the same bound for the click's own last division as for a sibling: past it, sail without it and let it
     follow, as a sibling does. Or board it at its own nearer port as a sibling landing.
2. **R50-N2 (UI).** A single order row beside a panel is still cut before its meaning:
   - "…366: the transports of its…" on desk;
   - "…not done: there is o…" for a refusal;
   - on the phone, cut before "the landing is over".

   The merged loss rows got short forms (R42b); the single rows did not. Their tooltip does not hold the text.
   **Evidence:** `critic/shots/c50lost_desk_rows.png`, `critic/shots/c50lost_phone_rows.png`,
   `critic/shots/c50wait_jap_qd_20861_1600_d3.png`. **Fix:** a brief for each single kind ("366: transports sunk,
   the landing is over"; "365: not done, no landing there"), and the full text in the tooltip as the merged row has.
3. **R50-N3 (UI, phone).** The merged loss row's names are in its tooltip only, and a phone has no hover, so on a
   phone the row never says which divisions were lost (`critic/c50_lost_phone6.json`: "2 divisions: transports sunk,
   the landing is over"). **Fix:** a tap could show the names, or the panel the click opens could list them all.
4. **R50-N4 (diplomacy readability).** In the ticker the freed rising's two "left its war" rows come before
   "was freed from Netherlands", which is their cause (`critic/shots/c50rise_20429_history.png`, bottom left).
   **Fix:** within the same hour, tick a release before the wars it ends.
5. **R50-N5 (naval, seen headless only).** On 20845 (Germany, two divisions from Berlin to Norwich, at war with the
   United Kingdom), the transport group sailing to Hamburg was sunk at t89. Both divisions were told `TransportsSunk`
   with x = 0 ("no others of its nation can come to its port: the landing is over"), and the landing ended at once
   (the trace shows no landing from t98). Then both still marched on to Hamburg and arrived at t222 and t242, six days
   after being told the landing was over (`critic/c50_far_20845_ger_norwich.json`, evs and trace). That is not R39a
   broken: no group came because the news said none could. But a march to a port for a landing that no longer
   exists is a stale order the player did not give. Not seen in the page; no score moved.
6. **R50-N6 (God Mode).** Revolt and Spawn name the new nation for a province other than the one clicked ("Free
   Saxony" for Bavaria, "Free Silesian Voivodeship" for eastern Poland; `critic/c50_q_20875.json`). This is the same
   as run 48. It may be the province the click resolves to, but the player reads it as the wrong place.
7. Carried, unchanged: the ranking cuts long names; the relations graph overprints labels (illegible on a phone);
   the run-26 scenario is refused; R32-N3; R39-N2, R39-N3, R40-N2; R44-N3, R46-N5, R37-N3, R37-N4, R32-N2, R31-N1,
   R31-N6, R32-N5, R39-N4, R36-N3.

## Run 49's cases re-run

| Run 49 case | `5da444a8` (run 49) | HEAD `3fe138b1` | Evidence |
|---|---|---|---|
| **R49-N4** 20621 landingInvariants | 0 broken; `farPort` note "Weihai 18 days, by Rizhao 10" | 0 broken; **no `farPort` note** | `critic/c50_li_20621_jap.log` |
| **R49-N4** 18705 | `farPort` note "Lianyungang 20, Shanghai 7" | **no note** | `critic/c50_li_18705_jap.log` |
| 19206 | 0 broken; 367: 46.0 days gathering; 364: 31.0; 365: 33.1 | 0 broken; 367: **28.1**; 364: **3.8**; 365: **9.2** | `critic/c50_li_19206_jap.log` |
| 19207, 19113, 19111, 20623–20629, 20673 | 0 broken | 0 broken (19207's 365: 9.1 → 3.5 days) | `critic/c50_li_*.log` |
| **R49-N5** 20661 Tokyo→Shanghai, two divisions | 26 days, the click silent | lands t632/633, as before; **the tooltip says 22 days at the click and counts down; it sails on day 22** (desk; on a phone the marching division's panel line carries the days, the at-port division's does not) | `critic/c50_far_20661_jap_sh.json`, `critic/c50_wait_jap_sh_20661_1600.json`, `_390.json` |
| **R49-N3** the loss rows beside a panel | one cut row; the at-port row off screen | **both rows on screen** (desk, phone, landscape, six divisions); the single at-port row still cut (R50-N2) | `critic/c50_lost_*.json`, `critic/shots/c50lost_*_rows.png` |
| **R49-N1** hero sizes | 55 → 110 px between 10,001 and 9,999 m/px | **blended**: 55, 55, 63, 73, 83, 96, 110 px at 10,001 … 5,000; phone stops at 98 px | `critic/c50_hero.*.log` |
| **R49-N2** freed rising's cause | History only | **in the ticker** (after its effects, R50-N4) | `critic/shots/c50rise_20429_history.png` |
| R49 #6 `transportsSunkMany` number | "their landing … its port" | "their port" in the string; beside a panel the brief form is shown instead, so the full string was not seen rendered | `src/ui/i18n/en.json`, `critic/c50_lost_desk6.json` |
| diploInvariants ten-year 20429, 20491, 20493, 20413, 20495, 20601–20609; 20611 five years | 0 broken | 0 broken | `critic/c50_diploinv_*.log` |
| R48-B1 trace 20429 t13104 | `WarLeft` ×2, `PuppetReleased` | the same; DEI free, not at war | `critic/c50_rise_20429.log` |
| Far routes 20661 Qingdao, 20665 Bremen, 20667 Tokyo, USA Chicago→Norwich, far save | as run 49 | identical landing hours and events | `critic/c50_far_*.json` |
| Sinkings 3517 n3k1, n3k2, n4k2, n5k3, n2k0, with and without a real save | as run 49 | identical, hour for hour | `critic/c50_sunk_3517_*.json`, `critic/c50_sunksave_3517_*.json` |
| workerDeterminism 3517 (2190 h) | `7e113d94` | `7e113d94` on every arm | `critic/c50_wd_3517_2190.log` |
| worldInvariants 20637 | 0 broken | 0 broken | `critic/c50_wi_20637.log` |
| Z, sea clicks, relations graph (run 49's seeds 20653–20659) | clean | rerun on new seeds 20865–20869, 20887, 20889: clean | above |

## Design objections (none blocking, no score lowered)

- **"One click lands together" with a single port (R37c, ADR-836).** The port is the first division's, however far
  the others walk. In R50-N1 the third division walks past the ports of western Honshu to reach Tokyo, and the click
  takes ten times its crossing. ADR-836 already chose to stop waiting for a sibling past a month. Applying that
  choice inside the click would keep R37c for every case a player would call one landing.
- **ADR-834's "was freed from"** still reads the same for a beaten overlord's lost subject and a loyal puppet let go
  (run 49's objection, unchanged).
- **ADR-837's phone ticker.** With two orders' news, no event row shows on a phone. A war declared while the player
  reads a landing's news is not on the screen until the player dismisses it. This is the user's choice; noted, not
  scored.

## Ideas from other games (not scored)

- Hearts of Iron lets each division of a naval invasion embark at its own nearest port and sail to one beachhead.
  That is R50-N1's second fix.
- Europa Universalis words an independence won from a collapsed overlord differently from a subject released by
  treaty (run 49's idea, still open).

## Strengths (verified)

- **The landing's wait is told truly.** On four cases, two nations and two seas, the tooltip and the panel count
  down a day a day, and the landing sails on the day they said (`critic/c50_wait_*.json`). A player can now plan
  around the wait.
- **The world survives being saved.** In the page, a save, a run and a reload on two seeds give the same state hash
  200 and 400 days later, twice each (`critic/c50_sl_*.json`). Headless, the worker hash of 3517 is still `7e113d94`
  after five builds.
