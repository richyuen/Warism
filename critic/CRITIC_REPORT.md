# Critic report, run 48 (full): after R39, "a landing whose transports are sunk calls others or says so; named notices; the tooltip above the mouse; R38d by hours"

- **Mode: full.** I decided this from git before anything else (CRITIC_PROMPT, ADR-804). The last three reports were
  all focused: run 47 (`1e1b2cb7`), run 46 (`72c458f7`) and run 45 (`021cf870`) each have `"mode": "focused"`. So
  the third condition for a focused run fails, and this run is the whole brief. Run 44 (`8f6f2628`) was the last full one.
- **Commit judged:** `4ebaee7630b134d0bc91afb7b83568a5158120f4`, HEAD at the start (`critic/c48_commit.txt`).
  **Date:** 2026-11-06.
- **Build:** `vite build --outDir critic/c48_dist`, exit 0 (`critic/c48_build.log`). Served by `vite preview` on
  127.0.0.1:**5299**, driven through Playwright Chromium at desk 1600 × 900, phone 390 × 844 and a landscape phone
  844 × 390.
- **Baseline:** a worktree at run 47's commit `f464db35` (`critic/wt`, `node_modules` linked and unlinked before
  removal) for the new defects found, and run 47's own `c47_*` outputs for its named cases.
- **Runs.**
  - **Run 47's named cases:** the far-port cases (`c47_far.ts`: USA Chicago to Norwich, Soviet Union Moscow to Cyprus
    and to Gotland, Germany Königsberg to Norwich), the sinkings (`c47_sunk.ts`: n3k1, n3k2, n4k2, n5k3, n2k0, both
    partials), the page probe of the rows, the panel and the tooltip's edges (`c48_lost.mjs`: desk, phone and
    landscape phone), landingInvariants 19206, 19207, 19113/15101, 18705 and 19111, and workerDeterminism 3517.
  - **New attacks on R39:** a real save and load in the hour a landing's last group is destroyed
    (`critic/scripts/c48_far_save.ts`), the same on case B (`critic/scripts/c48_sunk_save.ts`), and an hourly trace
    of the Königsberg convoy (`critic/scripts/c48_far2.ts`).
  - **The whole game on new seeds**, with run 44's page scripts renamed `c48_*`:
    - zoom Z 20441, land battle C 20443, God's nukes A 20445, God's tools Q 20447, editor G 20449;
    - Breakthrough K 20451, planes PL 20453, wing W 20455, sea SB 20457 and my own sea-battle click
      (`c48_seaclick.mjs` 20481, 20483);
    - phone and laptop P, UI U, relations graph RG 20459 (heroes), phone zoom PHZ 20461, old scenario OS, force war
      FW 20463;
    - two 12-year page watches at Max (LWHON 20471 with heroes; LW 20473 plain);
    - two headless worlds: 7019 for 20 years (its save is HEAD's own) and new seed 20431 for 25 years;
    - on 7019's year-20 save: AI nukes AN, History HI, exports DL, and the frame rate PF (run alone at the end).
  - **Checkers on new seeds:**
    - landingInvariants 20401, 20403, 20405 (1 group), 20407 (2 groups), 20409, 20411;
    - diploInvariants 20413, 20415 (heroes), 20417 (random), 20419 (random world) to day 180; and 20413, 20429 (random),
      20491 (random), 20493 (random), 20495 to day 3650;
    - worldInvariants 20421 (180 days and 10 years), 20423 (random world), 20425 (heroes);
    - workerDeterminism 3517 (2190 h) and 20427 (8760 h).

## Verdict

**R39 fixes R47-B1 in both of its cases, and its three other parts do what they say. But a ten-year check on a new
seed breaks a rule of war and peace: a puppet "rose against" its overlord and walked free with no war, because its
overlord was overrun. This is R48-B1, blocking. It is the same on `f464db35`, so it is not R39's.**

- **R47-B1 is fixed.**
  - Case A (USA 3517): the division is told `TransportsSunk` "others are on their way" at t273, and group 1123 is called
    from San Francisco. There is no reason-6 refusal. The landing ends at t895 because Norfolk is bombed shut, and
    that is true: Norfolk's damage was 0 when the call was made (`critic/c48_far_save0.json` trace).
  - Case B: those left at the port are told "the transports of its landing were sunk … the landing is over"
    (`critic/c48_sunk_3517_*.json`, `critic/shots/c48lost_desk_portpanel.png`).
- **R39b, R39c and R39d work.**
  - The lost row names the division: "Square infantry division 365: its transports were sunk at sea…" (run 47:
    "A formation").
  - The tooltip is kept above the bottom edge on desk, phone and landscape phone (`critic/c48_lost_*.json`).
  - Moscow to Cyprus keeps Sevastopol's group, as the ADR says.
- **But R39a has a hole: `World.sunk` is not saved.** If the game is saved and loaded in the hour a landing's last
  group goes down, case B's divisions get R47-B1's string again ("no transports … at a port it can reach"). In case A,
  the landing silently calls another group and the sinking is never told (R48-N1).
- **New blocking issue R48-B1** (diplomacy): diploInvariants 20429 (1938, random diplomacy, 10 years) reports 1 broken:
  "DEI rose on NED and is not at war with it". The trace shows the declaration refused as `Overrun`. The player reads
  "Dutch East Indies rose against Netherlands", and no war follows.

## Scores

| Dimension | Run 47 | Run 48 | |
|---|---|---|---|
| Map visuals and readability | 7 | 7 | **Rescored on new seeds.** Z 20441 is one camera from 6,000 to 3 m/px in 18 steps: elements from 1,573 m/px, 13,791 individuals at 28 m/px, no error (`critic/c48_z_20441.json`, `critic/shots/c48z_20441_00.png` … `_17.png`). C 20443 reads cleanly from 3,000 to 10 m/px (`critic/shots/c48c_20443_arm_0250m.png`). **Not 8:** <ul><li>With heroes on, the hero tags cover Europe at world zoom ("P.100 Ercole", "Maus", "Char 2C", "Roma" over Germany, France and Italy in 1940; "HMS Hood" and "Yamato" in 1950: `critic/shots/c48lwhon_20471_y02_world.png`, `_y12_world.png`). It is the same in run 44's `c44lwhon_3517_y05_world.png`.</li><li>The ranking still cuts "French Equatorial…" in every shot.</li><li>On day 365 the relations graph prints "France" over "French West Africa" and "Nationalist Spain" over "Canada" (`critic/shots/c48rg_20459_desk_d365.png`).</li></ul> |
| Diplomacy, war, alliance, puppet, revolt depth | 7 | **6** | **Rescored. Down, for R48-B1:** diploInvariants 20429 breaks `rise` on day 546 (`critic/c48_diploinv_20429r_10y.log`). It is the same on `f464db35` (`critic/c48_rise_20429_wt.log`), so it was found on a new seed, not caused by R39. **Clean:** 20413, 20415 (heroes), 20417 (random), 20419 (random world) to day 180; 20413 (`critic/c48_diploinv_20413s_10y.log`) 20491 and 20493 (random) and 20495 to day 3650 (`critic/c48_diploinv_*_10y.log`). The relations graph RG 20459 matches the sim on day 0 (67 nodes: war 7, alliance 11, guarantee 8, puppet 40), and each kind's click reads a true sentence (`critic/c48_rg_20459_desk.json`). Force war (FW 20463) breaks Japan's bond and makes the war (`critic/c48_fw2_forcewar.20463.log`) |
| Emergent world dynamics over long runs | 7 | 7 | **Rescored on new worlds.** <ul><li>LWHON 20471 over 12 years: the Soviet Union falls, and by 1950 Germany (15.4 M km²), the USA and France lead. Romania takes Turkey's and Greece's capitals in year 1. 85–100 nations live (`critic/c48_lwhon_20471.json`, `critic/shots/c48lwhon_20471_y12_world.png`).</li><li>Headless 20431 over 25 years: 70–100 nations live. The Soviet Union goes from 29.9 % to 17.6 % and back to 21.2 %; Germany from 3.8 % to 13.1 %; the USA from 7.3 % to 15.2 % (`critic/c48_top_20431.txt`).</li><li>7019 over 20 years: the USA, China and Japan overtake the Soviet Union (`critic/c48_top_7019.txt`). History has 3,714 events of 28 kinds.</li></ul> **Not 8:** <ul><li>Canada holds 12.1–12.9 % from year 1 to year 21 on 20431. As in run 44, half the table is frozen.</li><li>Year-one wars are dogpiles: "France +36 ⚔ Brazil", "Nationalist Spain +26 ⚔ Finland +2", "United Kingdom +29 ⚔ Netherlands +1" (`critic/c48_lwhon_20471.json` chips, `critic/shots/c48sc_20481_click.png`).</li></ul> |
| God Mode | 7 | 7 | **Rescored on new seeds.** <ul><li>A 20445: an H-bomb on Paris (3,329,000 civilians, the alert, "Go to", the History row, France's panel "Nuclear strikes on its land", the charts) and an A-bomb on London (`critic/shots/c48a_20445_13_paris_h_strike.png`, `_32_charts.png`).</li><li>Q 20447: revolt (102→103 nations), spawn nation (→104), found and raze a city, each with its ticker row (`critic/c48_q_20447.json`).</li><li>No error.</li></ul> **Not 8:** R37-N3 unchanged, and a God `removeFormation` of a transport group reads as "sunk" (run 47's note, unchanged) |
| Editor and scenarios | 7 | 7 | **Rescored.** G 20449: German and British fleets and a Polish bomber are placed. Poland has 10 warheads. The scenario exports, Cancel works, and it loads with 89/76/50 forces and 10 warheads, as placed (`critic/c48_g_20449.json`). **Not 8:** the run-26 scenario is still refused as "made by an older version" (`critic/c48_os2_c48.json`), and the editor's nation list is a flat list of 100 lines |
| Stats and history | 7 | 7 | **Rescored on HEAD's own 7019 year-20 save.** History opens in 191 ms with 3,714 events of 28 kinds. Each kind filter answers in under 200 ms. The CSV has 3,716 lines (3,714 + header + end), matching the panel (`critic/c48_hi_7019.json`, `critic/c48_dl_7019.json`). **Not 8:** R32-N3 (rows cut mid-word) unchanged |
| UI/UX and polish | 7 | 7 | **Rescored.** **Better:** <ul><li>R47-N1 fixed: the lost row names the division (`critic/c48_lost_desk.json` `afterSink.rows`).</li><li>R47-N2 fixed: hovering 45 px from the bottom puts the box at 761–847 on a 900-px screen (run 47: 871–957). On a landscape phone (844 × 390) a mid-screen hover stands above the mouse, inside the screen (`critic/c48_lost_land.json`).</li><li>The phone's Actions tab scrolls and fits (`critic/shots/c48p_phone_04_actions.png`).</li></ul> **Not 8:** <ul><li>**R48-N2:** with a panel open, the ticker shows one order row of the two lost divisions, cut mid-sentence ("Square infantry division 365: its transports were …"). 364's loss is not on the screen (`critic/shots/c48lost_desk_rows.png`).</li><li>The relations graph overprints its labels (above).</li><li>Carried: R39-N2, R39-N3, R40-N2.</li></ul> |
| Performance | 7 | 7 | **Rescored.** PF ran at the end with nothing else of mine running, on run 44's own 7019 year-20 save (byte-identical to HEAD's new one, `cmp`). I ran it on HEAD and on `f464db35`'s build, one after the other (`critic/c48_pf44_7019.json`, `critic/c48_pfwt_7019.json`). <ul><li>3,000 / 1,200 / 600 m/px: 57.7–60.2 fps on both builds.</li><li>120 m/px: 21.4–29.7 on HEAD, 20.4–29.2 on `f464db35`.</li><li>30 m/px: 22.2–30.4 on HEAD, 21.4–30.9 on `f464db35`.</li><li>HEAD's own save gives the same (`critic/c48_pf_7019.json`).</li><li>Run 44 measured 31–48 at those zooms on this world. **Run 44's own build (`0fba90d8`, worktree `critic/wt44`) gives the same today:** 120 m/px 21.4–27.7, 30 m/px 23.0–29.5 (`critic/c48_pf0f_7019.json`). So the drop is today's machine, not a commit, and it moves no score.</li><li>The two 12-year watches at Max: 59.1–59.9 fps, longest gap 100–250 ms, 0 frames over 500 ms (`critic/c48_lwhon_20471.json`, `critic/c48_lwplain_20473.json`).</li><li>Headless tick: 7019 6.99 ms mean over 20 years, 20431 6.63 ms over 25 (`critic/c48_sim7019.log`, `critic/c48_sim20431.log`).</li></ul> **Not 8:** under 31 fps at unit zoom on a year-20 world, on both builds |
| Stability | 7 | 7 | **Rescored.** <ul><li>No page error in any page JSON of this run (24 probes, two 12-year watches).</li><li>workerDeterminism 3517 at 2190 h ends `7e113d94` on every arm, as in runs 46 and 47 (`critic/c48_wd_3517_2190.log`). New seed 20427 at 8760 h ends `72dc45cd` on all four arms (`critic/c48_wd_20427.log`).</li><li>worldInvariants 20421 to 10 years, 20423 (random world) and 20425 (heroes): 0 broken (`critic/c48_wi_*.log`).</li><li>landingInvariants on 6 new seeds, the short pools included: 0 broken (`critic/c48_li_204*.log`).</li><li>Both 12-year watches ran with 0 frames over 500 ms.</li></ul> **Not 8:** <ul><li>landingInvariants still breaks `stuck` on 19206 and 19207 (R39e held).</li><li>R48-N1: a save and load in one hour changes what the player is told.</li></ul> |
| Semantic zoom to unit level (needs 8) | 8 | 8 | **Re-earned on new seeds.** <ul><li>Z 20441: one camera from 6,000 to 3 m/px in 18 steps, with counters, elements and individuals in turn and no error (`critic/c48_z_20441.json`).</li><li>PHZ 20461: 40 days on the phone from 30,000 to 25 m/px, with no overflow at any tier and a tap that opens China's panel (`critic/c48_phz_20461.json`).</li><li>Sea battle 20481: two cruiser squadrons and a destroyer flotilla are labelled at 600 and 150 m/px inside the battle ring (`critic/shots/c48sc_20481_click.png`, `_150m.png`).</li></ul> |
| Naval warfare (needs 8) | 7 | **7** | **Rescored.** **Better, same cases as run 47:** <ul><li>R47-B1 case A: told and replaced at t273 (run 47: reason 6) (`critic/c48_far_usachi_eng.json`).</li><li>Case B, n3k1/n3k2/n4k2/n5k3: those at the port get `transportsSunk`, not reason 6 (`critic/c48_sunk_3517_*.json`).</li><li>The partials and the Gotland and Königsberg cases are as in run 47 (Gotland lands at the same hour, `{"103":1104}`).</li><li>The Königsberg convoy that came ashore on Germany's coast (run 47: "not judged") was struck from the air at t132 and broke off (`FormationRetreated`). The division is told "its transports broke off; it came ashore away from its target", which is true (`critic/c48_far_gerkon_hourly.json`).</li></ul> **Held under 8:** <ul><li>R48-N1: R47-B1's false refusal comes back after a save and load in the sinking hour (`critic/c48_sunksave_3517_n3k2.json`: `855 refused 366 reason 6`; `critic/c48_far_save1.json`: no `TransportsSunk` at all).</li><li>landingInvariants `stuck` on 19206/19207 (1 broken each, `critic/c48_li_19206_jap.log`, `_19207_jap.log`): a named rule checker still reports a broken rule in this dimension. The builder holds it (R39e).</li><li>SB 20457 found no ships to show at the fight it picked (`critic/shots/c48sb_20457_60m_balls.png`). It is a probe's miss, not scored, but it gives no new evidence for an 8.</li></ul> |
| Tanks (needs 8) | 8 | 8 | **Re-earned on new seeds.** C 20443, Germany–Poland day 5: armoured divisions 40 and 42 are labelled at 250 m/px with leader lines among tank brigades 581–583 and motorised divisions 44–45. At 10 m/px they are tank balls with turrets and tracks among German infantry and wings (`critic/shots/c48c_20443_arm_0250m.png`, `_arm_0010m.png`). No error |
| Aircraft (needs 8) | 8 | 8 | **Re-earned on new seeds.** <ul><li>W 20455: a German fighter is ordered to strike near Warsaw and followed. In 56 samples it flies with its mark in 51, is never shown without one, and sits a median 32 px from its sorties at 3,000 m/px (`critic/c48_w_20455.json`).</li><li>PL 20453, Germany–Poland from 3,000 to 25 m/px in both looks: 37 planes in hour 2, with marks at every tier and no error (`critic/c48_pl_planes.20453_GER_POL_5299.log`).</li><li>worldInvariants with the air rules over 10 years on 20421: 0 broken.</li></ul> |
| AI nuclear use (needs 8) | 8 | 8 | **Rescored on HEAD's own 7019 year-20 save.** <ul><li>The game pauses on two AI strikes in 4 months. China on the USA near Belfast (54,000 civilians, 42,408 men), the same strike as runs 39–44. China on Iceland near Höfn with a hydrogen bomb (8,000 civilians, 30,012 men).</li><li>Each has an alert, "Go to" and a ticker row, and the burst and fallout are drawn over the struck army (`critic/c48_an_7019y20.json`, `critic/shots/c48an_7019y20_1_goto.png`).</li><li>No error.</li></ul> |

## Blocking issues

1. **R48-B1. A puppet "rises" against an overrun overlord and goes free with no war. The rule checker reports it
   broken, and the player reads a revolt that never becomes a war.**
   - **The case.** diploInvariants 20429, 1938 world, random diplomacy, 10 years:
     `20429 random day 546: rise: DEI rose on NED and is not at war with it` (`critic/c48_diploinv_20429r_10y.log`).
   - **The trace** (`critic/scripts/c48_rise.ts`, `critic/c48_rise_20429.log`). The Dutch East Indies fight beside the
     Netherlands in two wars (against Britain's side and against Norway's). At t13104, on the month's start:
     - `PuppetRevolt DEI NED`, `WarLeft DEI ENG`, `WarLeft DEI NOR`, then `WarRejected DEI NED`.
     - From the next hour DEI has no overlord and no war; the next 48 hours bring none.
   - **Why it was refused** (`critic/scripts/c48_rise_why.ts`, `critic/c48_rise_why.log`). After the release and
     `leaveWarsBeside`, `whyNotWar(DEI, NED)` is **`Overrun`**: the Netherlands has most of its land occupied.
     `puppets.ts` handles only the `Allied` and `AlliedRealm` refusals before `declareWar(world, n, o, true)`. Every
     other refusal turns the rising into a free release.
   - **What the player sees** (`critic/scripts/c48_rise_page.mjs`, `&diplo=random`, the page at t13110). The ticker and
     History say "1 July 1939 Dutch East Indies rose against Netherlands", then "left its war with United Kingdom"
     and "…with Norway". No row tells of a war between the two, and none comes, because `WarRejected` has no text
     (`critic/shots/c48rise_20429_history.png`, `critic/c48_rise_page.json`).
   - **Same on `f464db35`:** the same events at t13104 (`critic/c48_rise_20429_wt.log`). It was found on a new seed,
     not caused by R39.
   - **How often:** 1 of 5 ten-year runs (with random diplomacy, 1 of 3: 20429 broken; 20491, 20493 clean; scenario diplomacy 20413, 20495 clean).
   - **Why it blocks.** It breaks a rule checker (`tests/helpers/diploInvariants.ts` `riseBreaks`). Two rules
     disagree: SPEC's "Overrun refuses new wars on it" (l.751) and the rising that is a war of independence
     (`puppets.ts` header, step 2). A rising against a beaten overlord is the case ADR-807 sets out to produce
     ("a losing overlord with a great subject").
   - **Fix (the design's choice).** Either:
     - a rising on an overrun overlord is not refused, as an overrun puppet is still declared on (DECISIONS-2026-10
       l.14381); or
     - it is a release in name and in law: told as "broke free" (`PuppetReleased`), with the checker's rule for
       `rise` saying so in the same commit, as an ADR records.

     Not: the revolt row with no war.
   - **AT.** diploInvariants 20429 random 3650: 0 broken. A unit case: a puppet at loyalty < 20 with a voice, under
     an overlord with ¾ of its land occupied, rises on the month's start: either at war with it, or told released and
     not "rose against".

## Non-blocking issues (prioritised)

1. **R48-N1. `World.sunk` is not saved, so a save and load in the sinking hour brings R47-B1 back.**
   - Groups sunk by air or naval combat go down after `amphibiousSystem` in the tick. `landingSystem` reads
     `World.sunk` only at the next hour, and a save between drops it ("not saved (it words a notice, no more)").
   - **Case A, a real save and load into a fresh `Sim`** (`critic/scripts/c48_far_save.ts`, `SAVE=1`): at t273 the
     landing has no group and `sunk=1`. After the load, `sunk` is empty. 615 gets no `TransportsSunk`: the landing
     silently calls another group, and the player's next word is t895's "port shut" (`critic/c48_far_save1.json`). Without the
     save (`critic/c48_far_save0.json`) it is told at t273.
   - **Case B, `sunk` cleared as a load leaves it** (`critic/scripts/c48_sunk_save.ts`, n3k2): `855 refused 366
     reason 6`. That is R47-B1's string, word for word (`critic/c48_sunksave_3517_n3k2.json`).
   - The window is one hour, but the autosave runs on a timer and when the page is hidden (`src/app/autosave.ts`).
   - **Fix:** save `sunk` while it is not empty (as `embarked`), or decide "sunk" from state that is saved (the
     landing's groups at its last hour). **AT:** both scripts with `SAVE=1` give `transportsSunk`.
2. **R48-N2. Two divisions lost at sea read as one cut row beside a panel.** `Ticker.tsx` shows only the last order
   row beside a panel, and `.ticker.short` cuts it: "Square infantry division 365: its transports were …". 364's loss
   is never on the screen while the panel is open (`critic/shots/c48lost_desk_rows.png`). **Fix:** merge the same
   news of one hour into one row ("2 divisions lost at sea: …"), or let an order row wrap.
3. **R48-N3. Hero tags cover Europe at world zoom** (heroes on): four tags hide Germany, France and Italy in 1940
   (`critic/shots/c48lwhon_20471_y02_world.png`). **Fix:** give hero tags the same collision rule as nation labels,
   or shrink them below a zoom.
4. **R47-N4 / R39e (held):** landingInvariants `stuck` on 19206 and 19207, 1 broken each (`critic/c48_li_19206_jap.log`,
   `critic/c48_li_19207_jap.log`).
   - **Why this checker break is not blocking when R48-B1's is.** `stuck` is a wait limit: its break is a
     division that waits 45 days for a far sibling, then lands. Nothing it is told is false, and the builder
     holds it on the record (ROADMAP R39e), as runs 46 and 47 judged it.
   - `rise` is a hard rule. Its break emits a row ("rose against") that the game then contradicts.
   - It still holds naval under 8.
5. Carried, unchanged: R44-N3, R46-N5, R37-N3, R37-N4, R32-N3, R40-N2, R39-N2, R39-N3, R36-N3, R32-N2, R31-N1, R31-N6,
   R32-N5, R39-N4; the ranking cutting long names; the relations graph's overprinted labels.

## Run 47's cases re-run

| Run 47 case | `f464db35` (run 47) | HEAD `4ebaee76` | Evidence |
|---|---|---|---|
| **R47-B1 A** USA 3517 Chicago→Norwich | t273 refused 615 reason 6 | **fixed**: t273 `TransportsSunk` x=1, 1123 called; t895 `PortShut` (true: Norfolk's damage 0 at the call) | `critic/c48_far_usachi_eng.json`, `critic/c48_far_save0.json` |
| **R47-B1 B** n3k1, n3k2, n4k2, n5k3 | those at the port `refused` reason 6 | **fixed**: `transportsSunk` (x=0, over) | `critic/c48_sunk_3517_n*.json` |
| Partials n2k0_part, n3k2_part; n2k0 | as run 47 | the same news | `critic/c48_sunk_3517_*_part.json` |
| **R47-N1** lost row's name | "A formation: …" | **fixed**: "Square infantry division 365: …" (desk, phone, landscape) | `critic/c48_lost_*.json` |
| **R47-N2** tooltip at the bottom | 871–957 on 900 px | **fixed**: 761–847; landscape phone inside | `critic/c48_lost_desk.json`, `critic/c48_lost_land.json` |
| **R47-N3** Moscow→Cyprus | Leningrad called, shuttles, t222 reason 6 | Sevastopol's group kept; t81 `PortShut` (as at `4040cad6`) | `critic/c48_far_sovmos_cyp.json` |
| Moscow→Gotland | lands t1104 | lands t1104 | `critic/c48_far_sovmos_got.json` |
| Königsberg→Norwich | ashore at t150 in Germany, "not judged" | the same; traced: bombed at t132, the group broke off, told `landedAway` | `critic/c48_far_gerkon_hourly.json` |
| **R47-N4** landingInvariants 19206, 19207 | 1 broken each (`stuck`) | 1 broken each (R39e held) | `critic/c48_li_19206_jap.log`, `critic/c48_li_19207_jap.log` |
| R46-B1 19113/15101; 18705, 19111 | 0 broken | 0 broken | `critic/c48_li_19113_eng.log`, `critic/c48_li_18705_jap.log`, `critic/c48_li_19111_jap.log` |
| workerDeterminism 3517 (2190 h) | `7e113d94` | `7e113d94` on every arm | `critic/c48_wd_3517_2190.log` |

## Design objections (none blocking, no score lowered)

- **SPEC ends a landing whose last group is lost** (l.1290). R39a now calls another group first, which answers run
  47's objection. The message "others are on their way" gives no idea of the wait: in case A it was 26 days, from San
  Francisco to Norfolk. A day count, as the sibling wait has, would set the player's expectation.
- **The run-26 scenario is still refused** as "made by an older version". This has been the objection since run 33.

## Ideas from other games (not scored)

- Hearts of Iron shows "3 divisions lost at sea" as one message: R48-N2's fix.
- Europa Universalis lets a subject that cannot fight its overlord gain independence by a named event ("broke
  free"), not a revolt: one shape for R48-B1's fix.

## Strengths (verified)

- **It runs for decades without a hitch.** Two 12-year page watches at Max held 59.7–59.9 fps with no frame over
  500 ms and no page error (`critic/c48_lwhon_20471.json`, `critic/c48_lwplain_20473.json`). The 25-year headless world
  has 70–100 nations and a changing top five (`critic/c48_top_20431.txt`).
- **R39 is precise.** All of run 47's cases moved only where R39 meant them to. The worker hash of 3517 is unchanged,
  and every checker but the two held `stuck` seeds is clean on the landing seeds.
