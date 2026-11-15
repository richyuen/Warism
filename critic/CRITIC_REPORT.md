# Critic report, run 72 (full): Batch 30 (R86a–f) and the whole brief, on `2ae30ec6`

- **Mode: full.** The spawning message asks for a full run (CRITIC_PROMPT, ADR-915/916): run 71 was focused, with no
  blocking issue and every score at its bar. Every dimension is scored afresh. The spawner also says a game from the
  title now has heroes on and the Countryball look; the page probes start games from the title or with `&heroes=on`
  (`critic/scripts/c72_lib.mjs`, `EXTRA`), and the headless ones with `{heroes:'on'}` where they can
  (`critic/scripts/c72_heroRun.ts`, `c72_free.ts`).
- **Commit judged:** `2ae30ec61d80ac6f6d461cbfc2763ad12070da10`, HEAD at the start (`critic/c72_commit.txt`).
- **The last report:** run 71, focused, on `df93b4c2`: no blocking issue, every dimension 8. The last full run was run
  67 (`5ec7fb7b`).
- **What changed since run 71:** 6 commits, 29 files outside `critic/`: R86a (a God peace in the replay is the
  player's), R86b (a kept war's score has its whole range), R86c (ADR-1069, a nation whose home borders no nation
  reaches from its nearest target), R86d (the end's note once, the card's line where it holds), R86e (57 timeline
  `cityName` renames; `World.cityNames`, saved), R86f (ADR-1070, heroes on from the title).
- **Due because the sim changed:** `git diff --stat df93b4c2 HEAD -- src/sim data public/data` touches `src/sim/ai/`,
  `src/sim/systems/war.ts` and `src/sim/track.ts`. Plain 1938 is not carried, and run 61's bulk sets and Malta's 18
  were run. The 20-year saves end at new hashes (7019 `d28412a4`, 32019 `11ad91b5`; run 71: `ab2bda3e`, `cfec21a0`):
  R86c moves plain play.
- **Left out for time:** no dimension. Not re-run from run 71: `c71_menloss` (the armies at the end; R86b's clamp
  read instead with `c72_clampend.ts`). Two saves made for a second AI-strike page probe (55503 year 16, heroes 55019
  year 15) were not used; the one strike seen on the page is the evidence for AI nukes.
- **Setup.**
  - Build: `vite build --outDir critic/c72_dist`, exit 0. Starts: `npm run saves -- critic/c72_starts`, 54 years
    (513 s), copied into the build; the 54 entries of `years.json` are the same as the deployed site's
    (`critic/c72_deployed_years.json`).
  - Served by `vite preview` on 127.0.0.1:5372; Playwright Chromium at 1600 × 900, 390 × 844 and 844 × 390.
  - Run 71's probes copied as `c72_*` (`critic/scripts/c72_mkcopies.sh`). New seed family: 55xxx.
  - Chains: `c72_runNamed.sh` (`c72_jobsAll.txt`, then `landingFuzz --seeds 15 --first 55101`), `c72_chainS.sh`
    (`c72_startsJobs.txt`), `c72_afterStarts.sh`, `c72_pagesA.sh`, `c72_suiteB.sh` (the whole page suite, about 90
    probes), `c72_pagesC.sh` (Malta's 18, the sea-battle looks), `c72_chainBulk.sh`, `c72_chainP.sh` (performance,
    alone and last).
  - New probes: `c72_heroRun.ts` (a heroes-on game headless, pinned), `c72_title2.mjs` (the title's forms and the
    game they start), `c72_histnames.mjs` (History's place names by year), `c72_oldsave.ts` and
    `c72_oldsavepage.mjs` (a save of the last build's replay on HEAD), `c72_heroPlace.ts` (where a free year places
    its heroes), `c72_capitals.ts`, `c72_capmoves.ts`, `c72_capsurvey.ts` (the replay's capitals), `c72_clampend.ts`
    (R86b's kept wars at ±100), `c72_heropanel.mjs` (hero tags with a panel open), `c72_leadersWar.ts` (the bloc
    leaders on opposite sides after the track).
- **Incidents, disclosed:**
  - My perf chain was started twice (the first copy was waiting unseen; Git Bash's `ps` does not show it). Both ran
    the seed-99 tick at once (2.32 ms each, `critic/c72_tick99_parallel.log`). Both were stopped and one chain re-run
    alone; the figures given are the re-run's.
  - `c72_histnames.mjs … 67` timed out on a History filter option that does not exist (probe error, not the page's);
    its case was read from the `k28` runs.
  - `c72_an_ainuke` on the plain 7019 and 32019 year-20 saves and on 55505 year 13 saw no strike in 400 days; the
    AI strike was taken on the heroes 7019 save, which has one (AI nukes).
- At the end, my clean-up stopped every process whose command line matched `5372|c72_|vite preview`. That stopped
  my preview server, but the pattern also matched some Microsoft Edge helper processes (GPU, network, storage,
  renderers) that were not mine. Edge restarted them itself (`--gpu-recent-crash-count=1`). Open Edge tabs may have
  reloaded. A `vite preview` on port 4173, not mine, was left running.
- The tree outside `critic/` was not touched; its three untracked PNGs under `docs/evidence/7.132/` were there before
  (as run 71).
- **Writes outside `critic/` by tools at their defaults:** `npm run sim` to `.cache/runs/*.json`; `landingFuzz` to
  `.cache/landingFuzz/`.

## Verdict

**No blocking issue.** Every rule checker is 0 broken on new seeds (21 runs of five or ten years, 13 free-year games,
landingFuzz 0 of 90). Run 71's five non-blocking issues are fixed or improved on their own cases; R71-N5 (the city
names) is fixed on its AT but opens two new defects in History.

**No score moves:** every dimension stays at 8, above the first group's bar (7) and at the second's (8).
- The largest new finding is old: in the replay, a capital moved by a capture never goes back (R72-N1). The Soviet
  Union is seated at Tashkent from October 1941 to 1991, France at Cayenne (French Guiana) from June 1940 to 1991,
  Italy at Naples, Transjordan at Al Aqabah, Burma at Chauk. The nation's flag stands there on the map, and with heroes
  now on from the title, a free year's land heroes start there.
- Run 71's starts show the same seats (`critic/c72_capitals_1975_c71starts.log`). Under the brief, a case the same on
  both commits moves no score, so map visuals keeps its 8. R72-N1 is the first non-blocking issue.

**What a player will meet first (non-blocking):**
- **R72-N1:** the replay's capitals moved by capture (above).
- **R72-N2:** R86e names past events with today's names: in the 1991 replay History reads "29 October 1941 A major
  battle began near Tver", in the 1975 replay "… near Kalinin"; "2 April 1945 … near Kaliningrad" (Königsberg
  until 1946).
- **R72-N3:** renames R86e left out: on 31 December 1991 the map reads "Salisbury · capital, Zimbabwe", "Tananarive
  · capital, Madagascar", "Bathurst · capital, The Gambia", "Dacca" and "Canton".
- **R72-N4:** with heroes on by default, their tags overlap counters and each other at world zoom, and with
  Relations open the European heroes' tags pile at the panel's edge, far from their units.

**The rule checkers on new seeds:**
- diploInvariants, 0 broken: 55001, 55005, 55013, 55015 (1938, heroes on 55005/13/15), 55003 (random diplomacy),
  55007 (random world), five years; 55009 (heroes) and 55011 (random world, heroes), ten years. Run 71's 33501, 54001,
  54005: 0 (`critic/c72_diploinv_*.log`).
- worldInvariants, every rule set, 0 broken: 55051, 55053, 55057, 55063, 55055 (random), five years; 55065 ten
  years; run 71's 36009, 37009, 54053: 0 (`critic/c72_wi_*.log`).
- `c72_free.ts` (the checkers' rules on games from built years), 0 broken lines: 1942 55542, 1946 55546, 1951 55551,
  1962 55562, 1966 55566 (random diplomacy), 1975 55575, 1983 55583 (two years), 1991 55611 (five years), all with
  heroes on; run 71's 51501, 51505, 51507, 51513, 51515: 0 (`critic/c72_free_*_free.log`).
- `blocend 54611`: 0 bloc lines in five years (`critic/c72_blocend_54611.log`). Track checker to 1991 and two free
  years on 1938, 55301, 55303: 0. `heldAtEnd 54311`, `55311`: 0. `heldfree 1946`: 0.
- `landingFuzz --seeds 15 --first 55101`: **0 of 90** runs broken (`critic/c72_landingFuzz.log`). `landingRows all`: 0.
- `workerDeterminism 54059`: `459be807` on every arm (as run 71); 55059: `190f4936` on every arm.
- `repulse 55071`, `55073`: 0.

## Scores

### Map visuals and readability: 8 → **8** (scored afresh)

**What I tested:** the replay at every start year at 3,000 m/px and closer over Europe, Asia, Africa and the Americas
(`c72_ev91` stops, 1938 to 3 January 1992); the city names of the day (R86e); the capitals of every living nation in
each built year (`c72_capsurvey.ts`, `c72_capitals.ts`); the title's default look (Countryball) and heroes at every
tier; the colour pairs (`neighbourColours`).

**Evidence for 8:**
- **R71-N5 fixed on its AT:** "Seoul" and "Pyongyang" on 31 December 1975, "Peking" in 1975 and "Beijing" in 1983,
  "Kinshasa" in Zaire, "Jakarta"; "Volgograd" and "St Petersburg" on 31 December 1991
  (`critic/shots/c72ev_1975_1975-12-31_korea_1500m.png`, `…_china_4000m.png`, `critic/c72_ev91_1991names.log`). A
  free 1975 game keeps them (saved in the start).
- **Readable everywhere else:** the 1992 Europe of new states (`critic/shots/c72ev_1990_1992-01-03_europe_3000m.png`),
  the Normandy coast on 5 June 1944 at 600 m/px (`critic/shots/c72st_normandyD_600.png`), Countryball counters at every
  tier in three twelve-year watches (`critic/shots/c72lwhon_55941_y12_world.png`).
- The colour pairs are as run 71, line for line (`critic/c72_neighbourColours_1938.log`): 0 under the builder's ΔE 15;
  the 1991 end 0 of 371 under 30; Zaire and the FNLA still 19.3 on the 1975-12-30 map.

**Not 9: R72-N1, the replay's capitals (old, found now; the same on run 71's starts).**
- `c72_capsurvey.ts` reads each living nation's seat against its own capital city: 6 of 94 nations in 1946, 7 of 101
  in 1955, 7 of 154 in 1975 and 7 of 176 in 1991 are seated away from a capital they own and hold
  (`critic/c72_capsurvey.log`):
  - the Soviet Union at Tashkent (Moscow owned and held by it);
  - France at Cayenne, in South America (Paris its own since 1944);
  - Italy at Naples, Transjordan at Al Aqabah (not Amman), Burma at Chauk (not Rangoon/Yangon).
  - The survey's other two rows, Nationalist Spain at Madrid and the CCP at Peking/Beijing, are the seats history and
    the timeline give them, and are not counted here.
- The cause, by the track's capture rows (`critic/c72_capmoves_1975.log`): the sim's war takes Paris on 10 June 1940
  and **Moscow on 31 October 1941** (Germany never held Moscow), and the seat moves (SPEC §4.4). No rule or timeline
  event moves it back; the timeline has a `capital` change (R62i2) but uses it only for China.
- On the page: the Soviet flag and "Tashkent · capital, Soviet Union" on 2 January 1975
  (`critic/shots/c72ev_1975_1975-01-02_tashkent_1500m.png`).
- Also on the page, not explained: on 31 December 1975 South Korea's flag stands at Pusan and North Korea's at Rason,
  and Seoul's tooltip has no "capital" (`critic/shots/c72ev_1975_1975-12-31_korea_1500m.png`). The survey does not
  list the Koreas (it counts only a nation seated away from a capital city it owns); I have not read why they sit
  there.
- The same on run 71's starts (`critic/c72_capitals_1975_c71starts.log`: Tashkent, Cayenne, Naples), so it is not
  this batch's, and it moves no score (the brief: a case the same on both commits).
- What it does in play (with heroes on by default): a free 1975 or 1991 game places the T-42 at Tashkent and the Char
  2C at Cayenne (`critic/c72_heroPlace_1975.log`, `critic/c72_heroPlace_1991.log`,
  `critic/shots/c72t2_free1975_55205_1600x900_2start.png`).
- **Seen fixed when** `npx tsx critic/scripts/c72_capsurvey.ts` seats the Soviet Union at Moscow, France at
  Paris, Italy at Rome, Transjordan at Amman and Burma at Rangoon in 1946, 1975 and 1991 (0 nations seated away from a
  capital they own, but those the timeline moves: Bonn, Peking…); on the page `c72_ev91 1975` shows "Moscow · capital"
  and the Korean flags at Seoul and Pyongyang.

**Also, not 9:**
- **R72-N4 (heroes, now default):** at world zoom the Maus tag sits on a German counter and the Char 2C under Richelieu
  and Roma (`critic/shots/crop_c72t2_55201_d360_europe.png`). With Relations open, the European heroes' tags are pushed
  to the panel's edge, far from their units: the T-42's tag stands over Britain
  (`critic/shots/c72hp_55929_12000_0none.png` against `…_1relations.png`; `critic/shots/c72rg_55929_desk_d365.png`).
- **R72-N3** (Stats, below): five capitals keep colonial names to 1991.

### Diplomacy, war, alliance, puppet, revolt depth: 8 → **8** (scored afresh)

**Evidence for 8:**
- **R71-N2 fixed (R86b):** `c72_warlong 1942 54601 god`: GER v SOV reaches 45 by day 90, 65 by day 150, and peace at
  90 on 9 August 1942 (`critic/c72_warlong_1942god_54601.log`). On the page, Germany taken by Take control: "War score"
  14 → 75 by 30 July (`critic/c72_ts_1942_GER_240_1600x900.json`).
- **Outcomes over the year left:** 1942 God act: Germany beats the Soviet Union (July–September 1942, 76–90) and
  Britain (October 1942–February 1943, 50–55); Japan puppets China on every seed. 1943 free: the Soviet Union wins at
  −100 (`critic/c72_warlong_*.log`).
- **R86b's clamp:** `c72_clampend.ts`: no kept war sits at ±100 at the track's end; only 1944 GER v SOV starts at −13
  in hour 1 (`critic/c72_clampend.log`).
- **R85b holds:** `c72_freewar`: 0 peaces in the first hour of 1941, 1942 (God act, Take control), 1943, 1944 and the
  1966 replay (`critic/c72_freewar_*.log`).
- **Every checker 0 broken** (above), the bloc rule included on 54611's end of Russia's bloc.
- **R82d, R82f held, identical to run 71 line for line** (and so plain 1938's diplomacy outside R86c's reach unmoved):
  `farConquests 0` 9.2 far per 100 nations (`critic/c72_farc_0_*.log`); `firstdecl` 0 over 6,000 km of 96 and 87;
  `piles` none over 4:1; `pileSides 51` 0 (`critic/c72_piles_p*.log`, `critic/c72_pileSides_51.log`).

**Not 9:**
- **The bloc leaders at war after the track (observation):** `c72_afterTrack 55601`: the United States and the Soviet
  Union on opposite sides for 417 days of year 3 (1994). The chain: Cuba declares on Jamaica, the Dominican Republic,
  the Bahamas; the United States declares on Cuba on 14 March 1994, and Mexico and the Soviet Union join Cuba within the
  hour (`critic/c72_leadersWar_55601.log`). The Warsaw Pact's bloc has ended (R80b, ADR-1045), so only one bloc counts
  and deterrence is off by design; the checkers break 0 times. A player sees a US–Soviet war over Cuba in 1994, told
  as an ordinary war.
- Lebanon's war held to 2000 still ends white on 31 December 1991, "… as history's course ended"
  (`critic/c72_endleb_*.log`), as specified.

### Emergent world dynamics: 8 → **8** (scored afresh)

**Evidence for 8:**
- **Three twelve-year watches on the page, 1938–1950** (`c72_long_watch2`): with heroes on (55941) and plain (55943,
  55945). Every year has wars on the banners and turns in the ticker: Italy takes Sweden's capital in 1938, France
  fights Britain in 1945, the United States takes Canada's capital in 1946; by 1950 France holds 17.9M km² and Japan
  12.6M (`critic/c72_lwhon_55941.json`, `critic/shots/c72lwhon_55941_y12_world.png`).
- **Free 1975 to 1977 (`c72_lw_1975free_6161`):** the Khmer Rouge, Somalia–Ethiopia, People's China against India
  (China takes India's capital in March 1976), Uganda–Tanzania; every quarter's banners change
  (`critic/c72_lw_1975free_6161.json`).
- **R71-N3 (accepted by the user for two nations):** three nations, `fewNationWars 3`: 53401 6/6, 51401 6/6, 55411
  6/6; new 55401 4 of 6 (`critic/c72_few3_*.log`). Two nations 55421: 5 of 6. Sixty nations 55431–3: 113, 107 and
  108 wars in five years (`critic/c72_few60_55.log`).
- **R86c (ADR-1069) leaves plain 1938's far reach as it was:** `farConquests` identical to run 71.

**Not 9:**
- **Small worlds still stall:** 55404 (three nations) has no war in ten years: #2 borders no one and the two
  neighbours, aggression 16 and 80, stand at 4.3M against 0.2M strength; at day 1,000 nothing has changed but the
  treasuries (`critic/c72_fewwhy_3_55404.log`).
- **Heroes do not change the shape of a decade:** the twelve-year watch with heroes reads like the plain ones; the
  heroes come and go in the ticker ("Bismarck is back with Germany near Bremerhaven", "United Kingdom lost TOG II near
  Bergen").

### God Mode: 8 → **8** (scored afresh)

**Evidence for 8:**
- **R71-N1 fixed (R86a):** a God peace in the 1942 replay reads "Japan made peace with United States" and "Germany made
  peace with Soviet Union", no "as history's course ended" (`critic/c72_gp_1942_*.json`); Lebanon's end peace keeps it.
- **God tools at work:** a hydrogen bomb on Paris and an atomic bomb on London on 1 January 1938, with the alert, the
  cloud and the fallout chart (`critic/shots/c72a_55917_14_paris_h_2h.png`, `…_33_chart_*.png`); revolt, spawn,
  breakthrough, territory, found and raze city, each in the ticker (`critic/c72_q_55919.json`).
- **Undo:** `undo2 41211` 0 px for nuke, revolt, nation, city and raze; `undo2y 51231` 0 px but the nuke's 10,010 px of
  the banners' row, as run 71 (`critic/c72_undo2_*.json`).
- **Old save, told clearly:** a 1975 replay save of the last build on HEAD ends the track at once and says "History's
  course ended: the game was saved with another timeline…" (`critic/c72_os_1975.json`).

**Not 9:** the year left decides the war (run 71's observation: every 1942 God act goes Germany's way, every 1943
start the Soviet Union's); the nuke's Undo still moves the banners' row (10,010 px).

### Editor and scenarios: 8 → **8** (scored afresh)

- **Editor:** a paint of French cells for Germany, undone and redone (owners [19,19,19] ↔ [1,1,1]), exported as a
  scenario of 591,624 bytes and loaded back from the title (`critic/c72_xe_32443.json`); fleets set for Germany and
  Britain afloat over 120 days, a carrier strike in History (`critic/c72_g_55921.json`).
- **Scenario file:** the standoff file loads in 3.3 s from the title's "Choose a file" (`critic/c72_os2_scen.*.log`).
- **The title's forms (R86f):** heroes "On", the URL `heroes=on`, look "balls"; a game from it has 14 heroes, a free
  1975 or 1991 year 12; 0 errors at desk and phone (`critic/c72_t2_*.json`, `critic/c72_title2.*.log`). The free card's line about wars held
  past 1991 shows only on 1983 and later (`critic/shots/c72rc_1983_free_1600x900_card.png`; R86d).
- **Not 9:** the card's capital-wrong world (R72-N1) is what the player starts from in 1975 and 1991.

### Stats and history: 8 → **8** (scored afresh)

**Evidence for 8:**
- **R71-N1 fixed** (God Mode). **History of the replay's years** reads as before: blank Next lines 0 of 1,082
  (`critic/c72_h_blank.120.log`), the Greek civil war's Next rows (`critic/c72_h_next.1030_96_greece.log`).
- **Charts** (Warheads, Nuclear dead, Land under fallout) after the God bombs (`critic/shots/c72a_55917_33_chart_*.png`).
- **History's export** on 32019's 1957 world: 2,606 of 2,606 events to CSV (2,608 lines) and JSON
  (`critic/c72_dl_32019.json`).

**Not 9:**
- **R72-N2 (new, R86e): History renames the past.** `c72_histnames.mjs`: the same 1941 battle reads "near Kalinin" in
  the 1975 replay and "near Tver" in the 1991 one; "2 April 1945 A major battle began near Kaliningrad" in both
  (Königsberg until July 1946) (`critic/c72_hn_1975_replay_1938-1975_k28_1600x900.json`,
  `critic/c72_hn_1991_replay_1938-1991_k28_1600x900.json`,
  `critic/shots/c72hn_1991_replay_1938-1991_k28_1600x900_1941.png`). The cause: `historyRows` names a city at render
  time from `World.cityNames` (R86e's note). R86e's title is "the cities' names of the day"; History is where the day
  is told.
- **R72-N3 (R86e's list):** on 31 December 1991 "Salisbury · capital, Zimbabwe" (Harare from 1982), "Tananarive ·
  capital, Madagascar" (Antananarivo from 1975), "Bathurst · capital, The Gambia" (Banjul from 1973), "Dacca,
  Bangladesh" (Dhaka from 1982), "Canton" (Guangzhou, the 1979 pinyin set R86e names)
  (`critic/c72_ev_1990_998.json`, `critic/shots/c72ev_1990_1991-12-31_zimbabwe_*.png`). None is in
  `data/scenarios/1938h/timeline.json`'s 57.
- R72-N1's tooltip ("Tashkent · capital").

### UI/UX and polish: 8 → **8** (scored afresh)

**Evidence for 8:**
- **R71-N4 fixed (R86d):** the phone's God tab has one note, in the map tools (`critic/shots/c72hgt_390x844_tab.png`);
  the phone's History has no banners over it (`critic/shots/c72gp_1942_GER_SovietUnion_390x844_2history.png`).
- **The whole page suite** at 1600 × 900, 390 × 844 and 844 × 390: phone layout clipping 0 (`critic/c72_p_phone..log`),
  keys, box select and orders (`critic/c72_x_mouse.55421_10_1600_900.log`: 7 of 7 ordered to Warsaw, 6 closer after
  10 days), the action bar's 28 icons with labels, Continue (`critic/c72_x_continue.55415_40_GER_60.log`: the same
  hash as the unbroken game), world building in 3.6–3.9 s to stats (`critic/c72_xb_*.json`). 0 page errors in every
  probe.

**Not 9:** R72-N4 (heroes' tags).

### Performance: 8 → **8** (scored afresh)

Run alone and last, the preview server idle, pinned to the performance cores (`critic/scripts/c72_chainP.sh`):
- **Tick, seed 99, five years:** 2.293 ms mean (run 71: 2.340), year 1 at `ae4ce317`, the pin
  (`critic/c72_tick99.log`).
- **The default game now (heroes on):** seed 99 five years 2.363 ms with heroes, 2.257 ms without, the same script
  (`critic/c72_tick99h.log`, `critic/c72_tick99off.log`): heroes cost about 5 %.
- **The replay:** 1938h five years 1.591 ms (`critic/c72_tick1938h.log`).
- **Frames, 7019's year-20 world** (`c72_pf_lookfps`): 60 fps at 3,000, 1,200 and 600 m/px in both looks; 54–55 fps
  at 120 and 30 m/px; the worst frame 113–118 ms in Classic at 1,200 and 120 m/px (run 69: 102–111)
  (`critic/c72_pf_lookfps.log`, `critic/c69_pf_lookfps.log`). The heroes game's year-20 world: the same, 53.7–60 fps,
  the worst 126 ms (`critic/c72_pf_lookfps_h.log`).
- **On the page over twelve years** (`long_watch2`): 59.5–60 fps every year, the longest gap 100 ms, 0 gaps over
  500 ms, with heroes or without (`critic/c72_lwhon_55941.json`, `critic/c72_lwplain_55943.json`).
- **`tools/diag/lookFps.ts` on the same world:** 58–60 forced frames/s at 3,000, 1,200 and 120 m/px, p95 17.6–18.4 ms,
  a draw 0.75–2.8 ms; the worst frame 124 ms once at 1,200 m/px (`critic/c72_lookfps.log`; run 69 at 58.8–60,
  `critic/c69_lookfps.log`).
- **Touch and the individual tier:** `c72_tm_touch` 59.4–59.7 fps with and without a selection
  (`critic/c72_tm_touch.alone.log`, run 69 59.6–60); `c72_x_indfps 32111` 58.8–60 fps at 28, 18 and 12 m/px, one
  150 ms frame at 12 m/px ×1 (run 69: 17) (`critic/c72_xi.log`).

**Not 9:** the 30 and 120 m/px tiers at 54 fps on a 1958 world; ~800 ms first-year spikes in the tick (with or without
heroes, `critic/c72_hmax_55031_*.log`).

### Stability: 8 → **8** (scored afresh)

- `workerDeterminism` on 54059 and 55059: every arm the same.
- **Save and load:** the page's save, reloaded, the same hash (`critic/c72_saveload_page.55937_200.log`: `same`,
  `same2`); a 1942 God game saved and loaded headless, the same hashes over 30 days (`critic/c72_saveload_1942god.log`);
  Continue the same as the unbroken game.
- **Old saves:** run 71's 7019 year-20 save loads on HEAD and runs a year (`fc2d0be3`,
  `critic/c72_loadold_7019.log`); the last build's 1975 replay save ends its track with a note
  (`critic/c72_os_1975.json`).
- **Long runs:** 20 years of 7019 and 32019, plain and with heroes (7019 heroes `1b76416c`, 12 heroes alive at the
  end), and three twelve-year page watches with 0 errors.
- **The starts** are the deployed site's (54 of 54).

### Semantic zoom to unit level: 8 → **8** (scored afresh)

- `c72_z_zoom 55911`: 18 steps from 6,000 to 3 m/px following one division: the drawn units (`el`) from 1,573 m/px
  (8,181) down to 84 at 3 m/px, the individual marks (`ind`) from 28 m/px (13,126), the followed division on screen at the
  end (`critic/c72_z_55911.json`).
- `c72_hz` and `c72_hero.55425_300_hon`: the hero counters at every tier: 12 tagged at 15,000 m/px, the three nearest
  named and scaled to 2,500 (`critic/c72_hero.55425_300_hon.log`); at phone size the same
  (`critic/c72_hero.55427_300_hphone_390_844.log`).
- The phone's tap on a counter opens its card (elements, men 9,030 of 20,580) (`critic/c72_phz_55933.json`).
- **Not 9:** R72-N4's overlapping hero tags at world zoom.

### Naval warfare: 8 → **8** (scored afresh)

- **landingFuzz `--seeds 15 --first 55101`:** **0 of 90** broken, `slowClick` included (`critic/c72_landingFuzz.log`).
- **Run 61's bulk sets (due), against run 71's:** the 396 named landing setups, 153 stuck returns and 168 next voyages
  are **identical line for line** (but timings) (`critic/c72_liab_named_cmp.txt`, `critic/c72_sr_cmp.txt`,
  `critic/c72_nv_cmp.txt`); the same 2 named `slowClick` breaks (27037 15101 g2, 30041 3517 g1), the same stuck-return
  checker break (27037), the same 3 next-voyage breaks.
- **Malta's 18:** 12 thrown back near Catania and 6 broken off near Palermo, row for row as run 71
  (`critic/c72_malta.log`).
- **The named `slowClick` cases** as run 71: 30041 13.0 d against 5.9; 27037 8.2 against 1.2; 51101 13.8 against 6.7;
  53125 9.5 against 2.4 (`critic/c72_li_*.log`).
- **Sea battles:** 55061, 43 battles in three years, 43 of 43 seen at their camera, 60 sinkings out of battle
  (`critic/c72_sbl_55061.json`); 31501, 16 battles (`critic/c72_sb_31501.log`). Heroes at sea: Bismarck, Yamato, USS
  Iowa, Sovetsky Soyuz lost and back after 60 days in the ticker.
- **Not 9:** the `slowClick` named cases; Malta still never held.

### Tanks: 8 → **8** (scored afresh)

- `breakthrough 55979`: 30 formations engaged by day 7 (`critic/c72_k_55979.json`); `55923` the same shape.
- **The land heroes (default now):** `tools/diag/heroCeiling.ts` on ten new seeds × 3 years (55181–55190): 79 of 127
  lives at or above the top-decile regular, 0.62 (`critic/c72_heroCeiling3_*.log`); 55081 7/7, 55083 1/9, 55085 4/5.
  ADR-795 closed this AT not done at 0.64 (1481–1490); the figure is the same, as decided.
- **D-Day on the page:** 5 June 1944 at 600 m/px, the German divisions on the Normandy coast and the Next line naming
  Omaha and Utah (`critic/shots/c72st_normandyD_600.png`); `c72_dday`: on 26 July, Allies 233k men in Normandy against
  Germany's 22k (`critic/c72_dday_1938.log`).

### Aircraft: 8 → **8** (scored afresh)

- `c72_pl_planes 55925`: the wings' marks at every tier in both looks (`critic/c72_pl_planes.55925_GER_POL_5372.log`).
- `c72_w_wing 55927`: a followed wing keeps its mark (median 0 px from it at 3,000 m/px; p90 78–204 px); at 250 m/px
  24 of 58 samples flying with a mark (`critic/c72_w_wing.55927.log`).
- The month's air rows: "France's air force struck United Kingdom over the past month: 4,535 men…" in the watch.
- **Not 9:** at 250 m/px a followed wing has its mark in fewer than half the samples.

### AI nuclear use: 8 → **8** (scored afresh)

- **A strike on the page:** the heroes 7019 game from 27 December 1957: on 30 May 1958 the United Kingdom strikes Japan
  with an atomic bomb near Chungking; the game pauses, the alert says "183,000 civilians killed; 16,936 men and 60 guns
  lost", Go to lands on the cloud (`critic/c72_an_h7019y20.json`, `critic/shots/c72an_h7019y20_0_goto.png`).
- **Counts:** `nukecount` 22 years: 55501 4, 55503 10, 55507 0 detonations (`critic/c72_nc_*.log`); `nukeIntercepts
  53501` 17 launches.
- **Not 9:** three year-20 saves (7019 and 32019 plain, 55505) show no strike in 400 days of the page; the strikes come
  in a few years of a few seeds.

## Blocking issues

None.

## Non-blocking issues (prioritised)

1. **R72-N1 (map, old): the replay's capitals moved by capture never return.**
   - **The case:** `npx tsx critic/scripts/c72_capsurvey.ts` (the built starts): the Soviet Union at Tashkent, France at
     Cayenne, Italy at Naples, Transjordan at Al Aqabah, Burma at Chauk from the 1940s to 1991
     (`critic/c72_capsurvey.log`); `c72_capmoves.ts`: Moscow taken by Germany on 31 October 1941
     (`critic/c72_capmoves_1975.log`); the Korean flags at Pusan and near Rason in 1975.
   - **Seen fixed when** `c72_capsurvey.ts` seats those five at their own capitals in 1946, 1975 and 1991, and a free
     1975 game places the T-42 at Moscow and the Char 2C at Paris (`c72_heroPlace.ts 1975`).
2. **R72-N2 (stats, from R86e): History names past events with the newest name.** "29 October 1941 … near Tver" in
   the 1991 replay; "2 April 1945 … near Kaliningrad". **Seen fixed when** `c72_histnames.mjs 1991 replay 1938 1991
   28` reads "Kalinin" for 1941 and "Königsberg" for 1945, as the 1975 replay does for 1941.
3. **R72-N3 (stats, R86e's list):** Salisbury, Tananarive, Bathurst, Dacca and Canton to 1991. **Seen fixed when** the
   1991-12-31 stops of `c72_ev91 1990` read Harare, Antananarivo, Banjul, Dhaka and Guangzhou.
4. **R72-N4 (UI, heroes default):** hero tags over counters at world zoom, and pushed far from their units by an open
   panel (`critic/shots/c72hp_55929_12000_1relations.png`). **Seen fixed when** `c72_heropanel.mjs 55929` shows each tag
   by its unit or hidden while the panel covers it.
5. **`slowClick` (ADR-914):** the four named cases as run 71. landingFuzz on 55101–55129: 0 of 90.
6. **Small worlds (R71-N3, accepted for two nations):** three nations 55404, no war in ten years.

## Run 71's cases re-run

| Run 71 case | Run 71 (`df93b4c2`) | Run 72 (`2ae30ec6`) | Evidence |
|---|---|---|---|
| R71-N1 `godpeace 1942 JAP`, `GER 390 844` | "… as history's course ended" | **fixed**: "Japan made peace with United States" | `critic/c72_gp_1942_*.json` |
| R71-N1 Lebanon at the end | "… as history's course ended" | the same (kept) | `critic/c72_endleb_*.log` |
| R71-N2 `warlong 1942 54601 god` | 39 from day 90 to peace | **fixed**: 45, 65, peace at 90 on 9 Aug 1942 | `critic/c72_warlong_1942god_54601.log` |
| R71-N2 `takescore 1942 GER 240` | "War score 39" April–August | **fixed**: 14 → 75 by 30 July | `critic/c72_ts_1942_GER_240_1600x900.json` |
| R71-N3 `fewNationWars 2 54421` | 3 of 6 | 4 of 6 (accepted by the user) | `critic/c72_few2_54.log` |
| R71-N3 `few3 53401`, `51401` | 6/6, 6/6 | 6/6, 6/6 | `critic/c72_few3_5*.log` |
| R71-N4 the phone's God tab | the note three times | **fixed**: once | `critic/shots/c72hgt_390x844_tab.png` |
| R71-N4 the card's line | on every year | **fixed**: 1983 on | `critic/shots/c72rc_*_card.png` |
| R71-N4 banners over phone History | a row hidden | **fixed** | `critic/shots/c72gp_1942_GER_SovietUnion_390x844_2history.png` |
| R71-N5 "Keijō", "Peiping", "Léopoldville" 1975 | 1938 names | **fixed**: Seoul, Peking, Kinshasa; but R72-N2, R72-N3 | `critic/shots/c72ev_1975_*` |
| `freewar` 1941–44, 1966 | 0 peaces in hour 1 | 0 | `critic/c72_freewar_*.log` |
| `g42 1942 replay 53542` | the front hatched | the same | `critic/shots/c72g42_*` |
| `free` 51501, 51505, 51507, 51513, 51515 | 0 | 0 | `critic/c72_free_*_free.log` |
| `blocend 54611` | 0 | 0 | `critic/c72_blocend_54611.log` |
| `heldAtEnd 54311`, `heldfree 1946` | 0, 0 | 0, 0 | `critic/c72_heldAtEnd_54311.log` |
| `undo2 41211`, `undo2y 51231` | 0 px; nuke 10,010 px (banners) | the same | `critic/c72_undo2_*.json` |
| `slowClick` named four | broken | the same figures | `critic/c72_li_*.log` |
| Run 61's 396 setups, 153 returns, 168 voyages | 2, 1, 3 broken | identical line for line | `critic/c72_*_cmp.txt` |
| Malta's 18 | 11 thrown back, 7 broke off (run 71's text) | 12 and 6, the same rows as run 71's log | `critic/c72_malta.log`, `critic/c71_malta.log` |
| landingFuzz (new seeds) | 0 of 90 | 0 of 90 | `critic/c72_landingFuzz.log` |
| `farConquests 0`, `firstdecl`, `piles`, `pileSides` | 9.2 far per 100; 0; none; 0 | identical | `critic/c72_farc_0_*.log` |
| `workerDeterminism 54059` | `459be807` | `459be807` | `critic/c72_wd_54059.log` |
| 7019, 32019, 20 years | `ab2bda3e`, `cfec21a0` | `d28412a4`, `11ad91b5` (R86c moves plain play) | `critic/c72_seed*_save.log` |
| `loadold` 7019 | runs a year | runs a year (`fc2d0be3`) | `critic/c72_loadold_7019.log` |
| `afterTrack 37601` | as run 70 | 0 days of the leaders opposed | `critic/c72_atx_37601.log` |
| `nukeIntercepts 53501` | 5 launches | 17 launches (the world differs since run 71) | `critic/c72_nukeIntercepts_53501.log` |
| Tick, seed 99, alone | 2.340 ms | 2.293 ms; year 1 at the pin | `critic/c72_tick99.log` |
| Objection: ADR-1060 empties occupied France | 146 German formations at peace in Vichy | the same (1.11M men) | `critic/c72_freewar_1941free.log` |

Note on Malta: run 71's text says 11 and 7; its own log has 12 and 6 by the same count, and this run's rows are the
same as that log's.

## Design objections (none blocking, no score lowered)

- **ADR-1060 still empties occupied France when the replay is left** while R85b keeps the war with Britain: a 1941 free
  start leaves 146 German formations, 1.11M men, in Vichy France at peace (`critic/c72_freewar_1941free.log`). As run 71.
- **Heroes on by default (ADR-1070) put them in the player's first view** while the land heroes' AI is closed short of
  its bar (ADR-795): 0.62 of lives at the top decile on new seeds. A player who reads "far stronger than any other" on
  the card meets a hero below the top-decile regular in 38 % of its lives.

## Ideas from other games (not scored)

- **Hearts of Iron IV** moves a capital back when its city is retaken. A rule that a nation at peace seats itself at
  its own capital city when it owns and holds it would mend R72-N1 in the replay and in free play alike.
- **Civilization** keeps a city's names in its history ("Leningrad (St Petersburg)"); History could show the name of
  the row's day, with today's in brackets.

## Strengths (verified)

- **Every run 71 issue is fixed on its own case**, and R86b turns the kept Second World War into wars that end: GER v
  SOV at 90 in August 1942 on its seed, Japan taking China on every seed, the Soviet Union winning from 1943.
- **The default game holds up:** with heroes on from the title, the checkers are 0 broken on 13 free-year games and ten
  years of 1938, the page runs at 59.5–60 fps for twelve years, and heroes cost 5 % of the tick.
