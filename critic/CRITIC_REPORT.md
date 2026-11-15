# Critic report, run 70 (focused): Batch 28 (R84a–l), on `b6bd706b`

- **Mode: focused.** The spawning message asks for no full run (CRITIC_PROMPT, ADR-915). Scored afresh:
  - the dimensions run 69 scored under the bar or blocked on: map visuals (R69-B4) and diplomacy (R69-B1–B3);
  - the dimensions the batch's files touch: God Mode (R84i), emergent dynamics (R84g, R84h), stats (R84j's rows),
    UI/UX (R84j, R84k, R84l) and stability (the save format, `table.ts`).
  - Carried from run 69, marked "carried": editor, performance, semantic zoom, naval, tanks, aircraft, AI nukes.
- **Commit judged:** `b6bd706b1d46ea4b12b4b1481f819dbfffe8f52e`, HEAD at the start (`critic/c70_commit.txt`). The tree
  had three untracked evidence PNGs under `docs/evidence/7.132/` (not the critic's).
- **The last report:** run 69, full, on `e5b97c8e`. Four blocking issues (R69-B1–B4); map visuals 7, diplomacy 6,
  every other dimension 8.
- **What changed since:** 14 commits; 212 files, most of them the critic's own scripts.
  - Under `src/sim`: `ai/strategic.ts`, `systems/puppets.ts`, `track.ts`, `sim.ts`, `tick.ts`, `world.ts` and
    `core/table.ts`.
  - Data: 81 nations recoloured, five late renames, `timeline.json`.
  - App: the hero's Overview row (R84k), a free year's options (R84l), city labels on Undo (R84i).
- **Due because the sim changed:** `git diff --stat e5b97c8e HEAD -- src/sim data public/data` is not empty, and it
  touches `src/sim/ai/`, `src/sim/systems/`, `tick.ts` and `sim.ts`. So plain 1938 is not carried, and run 61's bulk
  sets and Malta's 18 are due.
- **Left out for time:**
  - Run 61's bulk sets (396 landing setups, 153 stuck returns, 168 next voyages) and Malta's 18, though due. The bulk
    chain was stopped before it began.
  - From run 69's case table, not re-run:
    - run 69's 35 page suites: `z_zoom`, `c_battle`, `w_wing`, `pl_planes`, `x_editor`, save and load, `loadruins`,
      `loadscen`, bursts, the relations graph, `h_phone`, `h_blank`;
    - the headless cases: `trackFronts` and `dday`, the track checker on 37301/3, 38301/3, 39301/3, 41301 and 51303,
      `blocEnd`, `breakup`, `heldAtEnd` 51311/3, `freeburst`, `farlands`, `traits`, `air69`, `nukecount` on run 69's
      seeds, workerDeterminism 32059/39059/41059, the 41019 and 51019 20-year runs, `repulse`;
    - the performance chain. One tick measure of seed 99 was run alone at the end (Performance).
  - Their dimensions are the carried ones, or they rest on what was run.
- **Setup.**
  - Build: `vite build --outDir critic/c70_dist`, exit 0.
  - Starts: `npm run saves -- critic/c70_starts`, 54 years in 557 s, copied into the build
    (`critic/scripts/c70_build.sh`).
  - Served by `vite preview` on 127.0.0.1:5370. Browser: Playwright Chromium on the GPU at 1600 × 900 and 390 × 844.
  - Run 69's probes were copied as `c70_*`, their port set to 5370; the comparers point at `c69_*`. New seed family:
    53xxx (not used in the repo).
  - Chains:
    - `c70_runNamed.sh` (`c70_jobs.txt`);
    - `c70_chainS.sh` (`c70_startsJobs.txt`, from the starts);
    - `c70_chain2.sh` (`c70_jobs2.txt`, run 69's R82d/R82f cases);
    - `c70_pagesR.sh` (the page cases);
    - `landingFuzz --seeds 15 --first 53101`.
  - New probes:
    - `c70_freewar.ts`: the wars, occupied land and stranded formations in the hour a game leaves the track, by a free
      start, a God act or Take control (headless `setPlayer`);
    - `c70_god42.mjs`: the same on the page;
    - `c70_aidhour.ts`: the hour of a bloc-aid line;
    - `c70_heroorder.mjs`: a hero ordered from its Overview row by a real mouse click;
    - `c70_heroes60.mjs`: heroes in a later year played free.
  - Run 69's commit `e5b97c8e` was put in `critic/wt`, with a `node_modules` junction and run 69's own starts
    (`critic/c69_starts`), for the track's-end wars and the few-nation worlds. The junction was unlinked before
    `git worktree remove` (`node_modules` intact after).
- **Incidents, disclosed:**
  - `c70_pagesR.sh`'s first `c70_ev91` call had a log name over Windows' path limit (run 69's fault again). It was
    re-run by hand with a short log name (`critic/c70_ev91_1990.log`).
  - `c70_heroorder.mjs`'s first row was the Bismarck, and my click was on land. The game rightly refused it ("a fleet
    goes only to water or a port"). The land hero (Maus) was run as row 1.
  - `c70_god42.mjs`:
    - its war-chip read finds nothing (wrong selector), so the wars are read from the ticker and the shots;
    - its JSON's `after` key is overwritten by a shot path (the second seed is in the file name).
  - I wrote `critic/c70_named.done` by hand to start the second chain while the first's last long jobs ran. I started
    landingFuzz by hand after stopping the first chain's shell, which was waiting on one 54-year `afterTrack` job.
- **Writes outside `critic/` by tools at their defaults:** `npm run sim` to `.cache/runs/*.json`; `landingFuzz` to
  `.cache/landingFuzz/`.

## Verdict

**One blocking issue (R70-B2), small.** All four of run 69's blocking issues are fixed on run 69's own cases, and so
are its five non-blocking issues and its small items.

R70-B2: in the 1991 free game named in R69-B2's bar, the bloc rule breaks in the hour a bloc dissolves, because the aid
is paid before the alliance pass in that hour.

**Scores that move:**
- **Map visuals, 7 → 8:** R69-B4 is fixed. Georgia reads ΔE 33.5 from Russia on the page, and the four pairs run 69
  named are 33.5–34.1 in the data. R69-N3's names are fixed too.
- **Diplomacy, 6 → 7:** R69-B1–B3 and R69-N1 are fixed. Not 8, because of R70-B2, a rule a checker reports broken.

**The biggest thing a player will meet is under "Design objections":** leaving the track during the Second World
War ends it in its first hour.
- This happens with a free start from 1941–45, any God act or Take control.
- Every war the timeline holds makes a white peace, and every occupation goes back. Germany's 169 formations
  (1.07M men) stand in Soviet land at peace.
- SPEC §7.7 specifies this since R84e (ADR-1063), so it is not scored. The player is not told why the war ended
  (R70-N1, scored under God Mode and UI as readability).

**The rule checkers on new seeds:**
- diploInvariants, 0 broken:
  - 53001 (1938), 53003 (random), 53005 (heroes) and 53007 (random world), five years each;
  - the named 33501 and 51001.
- worldInvariants, every rule set, 0 broken:
  - 53051, 53053 (heroes), 53055 (random world) and 53057 (random diplomacy);
  - the named 36009 and 51051, and 37009 (R69-B3's own case).
- `c70_free.ts`, the checkers' hourly and daily rules on games from built years, 0 broken on:
  - 1946 (random diplomacy), 1950, 1962 (heroes on), 1968 (heroes on);
  - 1975, 1979, 1983 (×2) and 1987;
  - the track from 1989.
  - **2 broken on 1991 51507** (R70-B2).
- The track checker to 1991 (`c64_track.ts`): 0 broken lines on 1938 and the new 53301.
- `heldAtEnd 53311`: 0. `heldfree` from 1950 (53521) and 1958 (53523): 0 pairs at hour 1 and in each of two years.
- `landingInvariants` via `landingFuzz --seeds 15 --first 53101`: 1 of 90 runs broken, `slowClick` (53125 15101 g2),
  under the 5 % bar (ADR-914), so non-blocking (`critic/c70_landingFuzz.log`).
- `landingRows all`: 0 broken (`critic/c70_lrows_all.log`).
- `workerDeterminism 53059`: `8abd99a9` on every arm.
- `neighbourColours` on the world at the 1991 end (`critic/c70_starts/1991.sav`): 385 pairs, 0 under ΔE 30. Births
  from a parent: 162 pairs, 0 under ΔE 30.

## Scores

### Map visuals and readability: 7 → **8** (scored afresh; moved up)

**What I tested:**
- `c70_ev91.mjs 1990 999` on the late replay at 600–20,000 m/px (`critic/c70_ev_1990_999.json`):
  - Kuwait on 3 and 4 August 1990;
  - the Caucasus, Egypt, Central Asia, Sri Lanka, Benin, Zaire and Myanmar on 27 December 1991;
  - Europe on 3 January 1992.
- The 1938 replay at 3,000–8,000 m/px: Europe, Africa, Central America, the Middle East and China
  (`critic/shots/c70ev_1938_1938-01-02_*`).
- `neighbourColours.ts` on the timeline's maps and on the world at the end.
- Run 69's own measure (`critic/c70_mapcheck.log`): the page's pixels, and ΔE (CIE76) from `nations.json`.

**Why 8.** Run 69's "what the bar needs" is met, by run 69's measure.
- **R69-B4 fixed:**
  - on the page at 1,500 m/px, Georgia reads (187,85,0) against Russia's (143,29,29): ΔE 33.5
    (`critic/shots/c70ev_1990_1991-12-27_caucasus_1500m.png`; run 69 read 1.3);
  - in the data, run 69's four pairs are all at or above 30:
    - Russia and Georgia 33.5;
    - Kazakhstan and Uzbekistan 33.5;
    - Ukraine and Moldova 34.1;
    - Russia and Transnistria 34.0.
  - `neighbourColours critic/c70_starts/1991.sav 30`: 0 of 385 land pairs under ΔE 30 at the end
    (`critic/c70_neighbourColours_1991.log`).
- **R69-N3 fixed:** the tooltips of 27 December 1991 read Egypt (30° E 30° N), Sri Lanka, Benin, Zaire and Myanmar
  (`critic/c70_ev_1990_999.json`, `critic/shots/c70ev_1990_1991-12-27_world_20000m.png`).
- **The 1938 map with 20 nations recoloured** still reads: Europe at 3,000 m/px has every state distinct
  (`critic/shots/c70ev_1938_1938-01-02_europe_3000m.png`).

**Not 9:**
- **R70-N2:** Belgian Congo is now `#334400`, read on the page as (51,68,0), L* 26. That is near the sea's 22 and
  darker than any neighbour (Angola's L* is 40). Its grey name reads faintly, and the lakes on its border nearly vanish
  (`critic/shots/c70ev_1938_congo_crop.png`, `critic/shots/c70ev_1938_1938-01-02_africa_8000m.png`). It has no
  likeness to Belgium's `#b8a13a`.
- **Earlier maps' close pairs,** which the builder's own bar on those maps (ΔE ≥ 15) allows:
  - 17 pairs under 30 on 1 January 1938, the closest France and French West Africa (16.1) and China and Manchukuo
    (17.7);
  - Somalia and Djibouti 17.8 from 1980 (`critic/c70_neighbourColours_maps.log`).

### Diplomacy, war, alliance, puppet, revolt depth: 6 → **7** (scored afresh; moved up)

**Run 69's bar, case by case (all met):**
- **R69-B1 fixed:** `c70_heldfree.ts 1946 51515 3` gives 0 pairs at hour 1 and in each of three years. Run 69 had
  12 pairs and 21,338 cells (`critic/c70_heldfree_1946.log`). `c70_free.ts 1962 51513 730 free heroes=on`: 0 lines.
- **R69-B2 fixed:**
  - `c70_free.ts 1975 51501 730`: 0 lines (run 69: 13);
  - `1991 51507 1825`: 0 economy lines (run 69: 21), but 2 bloc lines (R70-B2);
  - `critic/c70_free_*_free.log`.
- **R69-B3 fixed:** `worldInvariants.ts 37009 1825` gives 0 broken (`critic/c70_wi_37009.log`).
- **R69-N1 fixed:** `c70_endleb.ts 999` and the new 53283 show `PeaceSigned ISR LEB` at 1991-12-31T00, with no
  `NationAnnexed`. Lebanon joins an alliance in January 1992 (`critic/c70_endleb_*.log`).
- **R82d held after R84h's change to it:**
  - France takes Brazil's capital on 0 of 10 seeds (6161, 41161–41167 and the new 53161–53169);
  - first-60-day declarations over 6,000 km: 0 of 96 (39821–39839) and 0 of 87 (53821–53839);
  - logs: `critic/c70_farc_0_*.log`, `critic/c70_firstdecl*.log`.
  - Far capitals per 100 nations: 9.2 on run 69's seeds (run 69: 9.2–9.4). On the new seeds it is 11.0, new seeds and
    not compared.
- **R82f held:** none over 4:1 by realm at day 365 (`pileSides`: ITA vs POR 1:2 and ITA vs FRA 2:3 on 53143/53147;
  GER vs ENG and GER vs NED 2:5 on 51141/51143; `critic/c70_pileSides.log`). By nations, 1:5 to 2:10 (ADR-1042, an
  objection carried).

**Why 7, not 8:** R70-B2 (blocking): a rule a checker reports broken, on the 1991 free game R69-B2 was judged on.

**What the bar needs back at 8:**
- `c70_free.ts 1991 51507 1825 free -`: 0 broken lines.
- `c70_aidhour.ts 51507 1993-09-01`: either no `BlocAid` row in the hour Russia's alliance dissolves, or the checker
  reading the blocs at the hour's start.

### Emergent world dynamics: 8 → 8 (scored afresh)

**Evidence for 8:**
- **R69-N4 fixed:** `successorPurse.ts 999` and `53601` on the 1991 start show no successor disbanding in 1992
  (`critic/c70_successorPurse_*.log`). Run 69 saw Kazakhstan disband 18 and Tajikistan 31.
- **R69-N5, by its AT:** `fewNationWars 3 51401 6 10` gives a war on 5 of 6 seeds, 13 wars (the builder writes 15).
  Run 69 had 5 wars on 3 of 6 (`critic/c70_few3_51.log`). On 39401–39406: 15 wars on 4 of 6 seeds (run 69: 10).
- **Free games from built years go on with wars:**
  - every `c70_free.ts` year from 1946 to 1991 has its first declarations within days;
  - 1991 51507 to 1996 has wars every year (`critic/c70_free_1991_51507_free.log`).

**Not 9:**
- **R70-N3: three-nation worlds on new seeds.** `fewNationWars 3 53401 6 10` gives 9 wars, with 3 of 6 worlds and no
  war in ten years (`critic/c70_few3_53.log`). Run 69's commit gives the same, seed for seed
  (`critic/c70_wt_few3_53.log`): old, so it moves no score.
- **R84g's successors** (Design objections): 9 of the 14 republics born in 1991 hold 0 formations at the end.

### God Mode: 8 → 8 (scored afresh)

**Evidence for 8:**
- **R69-N6 fixed.** `c70_undo2.mjs 41211` and the new 53211 give 0 px differing for nuke, revolt, nation, city and
  raze undone (`critic/c70_undo2_pix.txt`; run 69: city 130 px). The city act founds "New Town" beside Łódź
  (`critic/shots/c70u2_53211_city_1act.png`).
- **On late worlds,** `c70_undo2y.mjs 51231` (1983 free) and the new 53231 give 0 px on all five acts, with the hash
  back (`critic/c70_undo2y_pix.txt`). Run 69 had revolt 459, nation 219 and nuke 8,447 px.

**Not 9, R70-N1** (the act's consequence is not told):
- In the 1942 replay, a revolt in Brazil ("Free Mato Grosso") ends the Second World War in that hour, as SPEC §7.7
  now says. The rows read "Germany made peace with Soviet Union" and "Germany made peace with United States".
  Nothing says the peace is the replay's end, not the two powers' choice.
- The God bar says only "Any God Mode act ends the replay of history."
- Evidence: `critic/shots/c70g42_1942_replay_53542_0before_east.png` against
  `critic/shots/c70g42_1942_replay_53542_1after_east.png`; `critic/c70_g42_1942_replay_53542.json`.

### Editor and scenarios: 8 (carried from run 69)

No file of the editor changed. In passing: run 69's 20-year save of 7019, made by `e5b97c8e`, loads on HEAD and runs a
year (`critic/c70_loadold_7019.log`).

### Stats and history: 8 → 8 (scored afresh)

- **R84j's plural:** "FMLN were annexed by Honduras" in a 1991 free game at 390 × 844
  (`critic/c70_rc_1991_free_390x844.json`).
- **The free start's row:** "History's course left at the start of your game, and the world goes its own way"
  (`critic/c70_r83_*.json`).
- **The 1991 end's rows** (`critic/c70_ev_1990_999.json`):
  - the white peaces of 31 December;
  - "History's course ended on its last day…".
  - Kuwait's stage line: Kuwait City is Iraq's by 4 August 00:00, the stage at noon on 3 August. At 3 August 00:00 it is
    still Kuwait's, which is right by the stage's hour.

**Not 9:**
- **R70-N4:** "1 January 1992 Yugoslavia's air force struck Croatia this month: 2,096 men…" follows "31 December 1991
  Yugoslavia made peace with Croatia". The monthly air row is dated the 1st and means the month before, so it reads as
  a strike after the peace (`critic/shots/c70ev_1990_1992-01-03_europe_3000m.png`).
- **R70-N1's rows,** above.

### UI/UX and polish: 8 → 8 (scored afresh)

- **R84k:** Germany taken by the panel's "Take control" (53184), heroes on; its Overview's Maus row clicked; then a
  real mouse click on the map 140 px to its west.
  - The Maus is the selection ("Playing Germany · 1 selected"); it marched 4.9 cells in 48 hours
    (`critic/c70_ho_53184_GER.json`, `critic/shots/c70ho_53184_GER_1_*.png`).
  - The Bismarck's row, clicked on land, gives "not done: a fleet goes only to water or a port": the order is sent and
    rightly refused.
- **R84l:** `/?…&heroes=on&year=1960&mode=free` (the form's URL) gives 12 heroes on the page at day 0 and day 10:
  Yamato, O-I, USS Iowa, T28, Sovetsky Soyuz, T-42, HMS Hood, TOG II, Richelieu, Char 2C, Roma and P.100 Ercole
  (`critic/c70_heroes_1960_53260.json`).
- **R84j:** the heroes hint reads "1938's seven great powers still living at the start"
  (`critic/shots/c70rc_1943_free_1600x900_card.png`).
- **Same URL, same world:** 1960 free and 1983 free at desk and phone size, three loads each (`critic/c70_r83_*.json`).
- **Page errors:** 0 in every page probe.

**Not 9, R70-N1 on the card:**
- The 1943 card under "Play free" says "The world as history left it on 1 January 1943, played on from there on its
  own course". By its first hour the game has four peace rows and no world war
  (`critic/shots/c70rc_1943_free_1600x900_card.png`, `critic/shots/c70g42_1943_free_53543_0before_east.png`).
- No line on the card for 1941–45 says that the war ends when history is left.

### Performance: 8 (carried from run 69)

R84i's label memory (`render/timing.ts`) runs only on a God act. The seed-99 tick for 5 years, run alone after every other
job: 2.322 ms mean against run 69's 2.195 (+6 %, inside the ±10 % of one sequential run), year 1 at the pin `4896702e`
(`critic/c70_tick99.log`). Frames were not measured (left out for time).

### Stability: 8 → 8 (scored afresh)

- **`workerDeterminism 53059`:** `8abd99a9` on every arm (plain, quiet, start, every).
- **A save from before the new column** (`nations.puppetAt`, R84c's `zeroIfAbsent`) loads: run 69's 7019 year-20 save
  runs a year on HEAD (hash `b92c568f`, `critic/c70_loadold_7019.log`).
- **The 20-year runs** complete: 7019 `505a4102`, 32019 `cb474a57` (another world: the pin moved, ADR-1061, ADR-1062,
  ADR-1065).
- **Undo** gives the hash before the act on 1938 and 1983 worlds (God Mode). The same URL gives the same world (UI).
- **0 page errors** in every probe.

### Semantic zoom to unit level: 8 (carried from run 69)

### Naval warfare: 8 (carried from run 69)

- **landingFuzz `--seeds 15 --first 53101`:** 1 of 90 runs broken, `slowClick` (53125 15101 g2: t870's click of 271,273
  not ashore after 9.5 days, its best way 2.4). That is under the 5 % bar, so non-blocking (`critic/c70_landingFuzz.log`,
  `critic/c70_fuzz_53125_15101_g2.log`).
- In passing: `seaBattles 39061`, with `seaBattlesLook` on the page, shows 62 of 62 battles seen at their camera
  (R84j; run 69: 68 of 69) (`critic/c70_sbl_39061.log`). The new 53061: 65 battles.

### Tanks: 8 (carried from run 69)

### Aircraft: 8 (carried from run 69)

### AI nuclear use: 8 (carried from run 69)

In passing: `nukeIntercepts 53501` over 22 years has 5 missile launches on Chinese-held land
(`critic/c70_nukeIntercepts_53501.log`). `nukecount 53503`: 0 launches in 22 years.

## Blocking issues

### R70-B2 (diplomacy, rules that agree; old rule, a new case): bloc aid paid in the hour its bloc dissolves (`bloc` rule)

- **The checker's lines.** `c70_free.ts 1991 51507 1825 free -`, the free game named in R69-B2's bar
  (`critic/c70_free_1991_51507_free.log`):
  - "1993-09-01: bloc: aid by USA with 1 bloc(s)";
  - "bloc: aid by SOV with 1 bloc(s)".
- **The hour,** from `c70_aidhour.ts 51507 1993-09-01` (`critic/c70_aidhour_51507.log`):
  - at 1993-09-01T01 the blocs are USA's (15) and Russia's (2) before the hour;
  - in the hour, USA pays aid to People's China and Russia pays aid to Algeria, Niger and Libya (`BlocAid`);
  - then Mongolia leaves and Russia's alliance is dissolved (`AllianceLeft`, `AllianceDissolved`);
  - after the hour there is one bloc.
  - The strategic AI pays at the month's start, before the alliance pass of the same hour. The checker
    (`tests/helpers/diploInvariants.ts:140`) reads the blocs after the hour.
- **Why blocking:** a rule checker reports it broken (CRITIC_PROMPT: every broken rule but `slowClick`).
- **Fix:** either the checker reads the blocs at the hour's start, when aid is paid, or aid is paid after the
  alliance pass.
- **Seen fixed when:** `c70_free.ts 1991 51507 1825 free -` shows 0 broken lines.

## Non-blocking issues (prioritised)

1. **R70-N1 (God Mode, UI, stats): the track's end ends the held wars without saying so.**
   - **The case.** In the 1942 replay, one God act or Take control ends four wars in its hour: JAP-CHI, GER-ENG,
     GER-SOV and GER-USA. In a 1943 free start, five end; in 1944, six. In each case the rows read as ordinary peaces.
   - **What is missing.** The God bar's note ("Any God Mode act ends the replay of history"), Take control's note and
     the 1941–45 free card ("played on from there on its own course") do not say that the war ends.
   - **Evidence.** The headless cases are in Design objections. On the page:
     - `critic/shots/c70g42_1942_replay_53542_1after_east.png` and `critic/c70_g42_1942_replay_53542.json`;
     - `critic/c70_rc_1943_free_1600x900.json`.
   - **Seen fixed when** the God bar, Take control and the card in 1941–45 say the wars held then will end in white
     peace, and the end's peaces are told as the replay's ("…as history's course ended").
2. **R70-N2 (map): Belgian Congo recoloured near-black** (`#334400`, L* 26 on the page).
   - Its name reads faintly, and its border lakes almost vanish (`critic/shots/c70ev_1938_congo_crop.png`).
   - **Seen fixed when** its land is at least as light as its neighbours' (L* ≥ 35).
3. **R70-N3 (emergent, old): three-nation worlds on 53401–53406.** 3 of 6 have no war in ten years, the same on run 69's
   commit.
4. **R70-N4 (stats, small): the monthly air row after a peace.** "1 January 1992 Yugoslavia's air force struck
   Croatia this month" follows the 31 December peace.
5. **`slowClick` (ADR-914):** the named cases are as run 69:
   - 30041 3517 g1: t729's click of 366, 13.0 days against 5.9;
   - 27037 15101 g2: t2198's click of 277, 8.2 days against 1.2;
   - 51101 3517 g1: t1505's click of 367, 13.8 days against 6.7.
   - Logs: `critic/c70_li_*.log`.
   - New, from landingFuzz (1 of 90): 53125 15101 g2, t870's click of 271,273 not ashore after 9.5 days against 2.4
     (`critic/c70_fuzz_53125_15101_g2.log`).

## Run 69's cases re-run

| Run 69 case | Run 69 (`e5b97c8e`) | Run 70 (`b6bd706b`) | Evidence |
|---|---|---|---|
| R69-B1 `heldfree 1946 51515 3` | 12 pairs, 21,338 cells at hour 1; 11 pairs after 3 years | **fixed**: 0 at hour 1 and each year | `critic/c70_heldfree_1946.log` |
| R69-B1 `free 1962 51513 heroes=on` | held: USA on JAP 6 | **fixed**: 0 lines | `critic/c70_free_1962_51513_free.log` |
| R69-B1 `free 1946 51515 diplomacy=random` | 12 held lines | **fixed**: 0 | `critic/c70_free_1946_51515_free.log` |
| R69-B2 `free 1975 51501` | 13 economy lines | **fixed**: 0 | `critic/c70_free_1975_51501_free.log` |
| R69-B2 `free 1991 51507 1825` | 21 economy lines | 0 economy; **2 bloc lines (R70-B2)** | `critic/c70_free_1991_51507_free.log` |
| R69-B2 `free 1983 51505`, `51517` | 12, 5 | 0, 0 (51505 with options at their defaults this run) | `critic/c70_free_1983_*_free.log` |
| R69-B3 `worldInvariants 37009 1825` | 1 broken | **fixed**: 0 | `critic/c70_wi_37009.log` |
| R69-B4 Caucasus at 1,500 m/px | ΔE 1.3 | **fixed**: ΔE 33.5 on the page; the 4 pairs 33.5–34.1 | `critic/c70_mapcheck.log` |
| R69-N1 `endleb 999` | `NationAnnexed LEB ISR` | **fixed**: white peace, Lebanon living (and 53283) | `critic/c70_endleb_*.log` |
| R69-N3 names | UAR, Ceylon, Dahomey, Congo, Burma | **fixed**: Egypt, Sri Lanka, Benin, Zaire, Myanmar | `critic/c70_ev_1990_999.json` |
| R69-N4 successors' purse | KAZ 18, TJK 31 disbanded | **fixed**: none disbands (999, 53601) | `critic/c70_successorPurse_*.log` |
| R69-N5 `fewNationWars 3 51401` | 5 wars, 3 of 6 | **fixed by its AT**: 13 wars, 5 of 6 | `critic/c70_few3_51.log` |
| R69-N5 `fewNationWars 3 39401` | 10 wars | 15 wars, 4 of 6 | `critic/c70_few3.log` |
| R69-N6 `undo2 41211` city | 130 px | **fixed**: 0 px, every act (and 53211) | `critic/c70_undo2_pix.txt` |
| `undo2y 51231` (1983) | revolt 459, nation 219, nuke 8,447 px | 0 px every act (and 53231) | `critic/c70_undo2y_pix.txt` |
| Small: heroes hint | "seven great powers" | **fixed** | `critic/shots/c70rc_1943_free_1600x900_card.png` |
| Small: "Contras was annexed" | "was" | **fixed**: "FMLN were annexed" | `critic/c70_rc_1991_free_390x844.json` |
| Small: Kuwait | Kuwait's on 3 August 00:00 (stage then 28 August) | Iraq's by 4 August 00:00 (stage at noon on 3 August) | `critic/c70_ev_1990_999.json` |
| Small: `sbl 39061` | 68 of 69 seen | 62 of 62 seen | `critic/c70_sbl_39061.log` |
| `slowClick` 51101 3517 g1, 30041 g1, 27037 15101 g2 | broken | the same three breaks | `critic/c70_li_*.log` |
| R82d `farConquests 0` 6161/41161–7 | France takes Brazil 0 of 5; 9.2–9.4 far per 100 | 0 of 5 (and 0 of 5 on 53161–9); 9.2 | `critic/c70_farc_0_*.log` |
| R82d `firstdecl 60` | 1 of 96 (39821) | 0 of 96; 0 of 87 (53821) | `critic/c70_firstdecl*.log` |
| R82f `piles 365` 39139–47, 51139–47 | ITA vs POR 1:5; GER vs ENG 2:10 by nations | ITA vs POR 1:5 (39147); GER vs ENG 2:9, GER vs NED 2:9 by nations; ≤ 2:5 by realm | `critic/c70_piles_*.log`, `critic/c70_pileSides.log` |
| diploInvariants 33501, 51001; worldInvariants 36009, 51051 | 0 | 0 (another world: the pin moved) | `critic/c70_diploinv_*.log`, `critic/c70_wi_*.log` |
| Track checker, 1938 | 0 broken | 0 (and 53301) | `critic/c70_track_*.log` |
| `landingRows all` | 0 broken | 0 broken | `critic/c70_lrows_all.log` |
| 7019, 32019, 20 years | `9d7cc54f`, `012f7230` | `505a4102`, `cb474a57` (the pin moved) | `critic/c70_seed*_save.log` |
| landingFuzz (new seeds) | 1 of 90 `slowClick` (51101–) | 1 of 90 `slowClick` (53125 15101 g2), under the 5 % bar | `critic/c70_landingFuzz.log` |
| Tick, seed 99, 5 years, alone | 2.195 ms mean | 2.322 ms mean (+6 %, within a single run's ±10 %); year 1's hash `4896702e`, the pin | `critic/c70_tick99.log` |
| afterTrack 37601 (R69-N4's Tajikistan) | Tajikistan a great power at the end | **fixed**: no successor but Russia among the greats in 10 years | `critic/c70_atx_37601.log` |
| R82d free 1975 far conquests (new seeds 53161–9) | — | 7.1 far per 100 (plain 1938 on the same seeds 11.0); new seeds, not compared | `critic/c70_farc_1975_c.log` |
| Run 61's bulk sets, Malta's 18 (due) | — | **left out for time** | — |
| Run 69's page suites, perf chain, other headless sets | — | **left out for time** (see the top) | — |

## Design objections (none blocking, no score lowered)

- **R84e as SPEC states it ends the Second World War on any departure from the track** (ADR-1063; SPEC §7.7: "each war
  a hold of the timeline's freezes in that hour makes a white peace"). The timeline holds the war's fronts until
  1944–45, so a free start from 1941–45, any God act or Take control ends them all in that hour. R84a then returns
  every occupation.
  - **The cases** (`npx tsx critic/scripts/c70_freewar.ts <year> <after> <free|god|take> 30`):

    | Case | HEAD `b6bd706b` | Run 69's commit `e5b97c8e` |
    |---|---|---|
    | 1942 replay, Take control of Germany (headless `setPlayer`) | 4 peaces in hour 1 (JAP-CHI, GER-ENG, GER-SOV, GER-USA); occupied cells 23,648 → 473; **GER: 169 formations, 1.07M men on Soviet land at peace** (`critic/c70_freewar_1942take.log`) | (the same path as God) |
    | 1942 replay, one God act (a province's unrest) | 4 peaces; 23,648 → 473 (`critic/c70_freewar_1942god.log`) | 1 peace (ENG-GER); 22,047 kept; 5 wars on at day 30 (`critic/c70_wt_freewar_1942god.log`) |
    | 1943 free | 5 of 5 wars end; 24,666 → 0 (`critic/c70_freewar_1943.log`) | 3 of 5 end; 10,922 kept (`critic/c70_wt_freewar_1943.log`) |
    | 1944 free | 6 of 6 end; 25,092 → 0 (`critic/c70_freewar_1944free.log`) | 5 of 6 end; 16,949 kept (`critic/c70_wt_freewar_1944free.log`) |
    | 1941 free | JAP-CHI and GER-ENG end; ITA-GRE goes on (`critic/c70_freewar_1941free.log`) | not run |
    | 1966 replay, God act | VCG-INC, PTL-LAO, IDN-MAL end: 3 of 3 (`critic/c70_freewar_1966god.log`) | not run |

  - **On the page**, the 1942 replay with one revolt in Brazil (`node critic/scripts/c70_god42.mjs 1942 53542
    replay`):
    - before: the Eastern Front hatched from Leningrad to the Crimea;
    - after: the Soviet Union whole and red, with Germany's counters inside it
    - (`critic/shots/c70g42_1942_replay_53542_0before_east.png`, `…_1after_east.png`).
  - **The 1943 "Play free" card** promises "The world as history left it on 1 January 1943". The game opens with four
    peace rows and "Germany declared war on Switzerland" (`critic/c70_rc_1943_free_1600x900.json`).
  - **Old in part:** on run 69's commit, a free 1943–44 start already ended most of these wars in the first hour (by
    the score the holds had kept, R69-N1's cause). That was unspecified, and no SPEC line covered it then.
  - **Why it is wrong.** The replay's main use is taking a side in the war or touching it. Doing either ends the
    war. Korea (1951–52) and Vietnam (1965–72) are the same case on a smaller scale.
  - **The alternative.** End white only the wars whose hold outlives the timeline (Lebanon's, to 2000). On an early
    end, lift the hold and keep the war, with its score reset so the kept score buys nothing, as Hearts of Iron IV's
    joined wars keep their occupations.
- **R84g hands the successors almost nothing** (ADR-1064). At the 1991 end, 9 of the 14 republics born from the
  Soviet Union hold 0 formations (Belarus among them, gross income 51). Russia keeps 339 formations with an upkeep of
  1,865 a month against a gross income of 852, and is kept afloat by a 108k treasury
  (`critic/c70_successorPurse_999.log`). The rule fixes run 69's bankrupt Tajikistan by making Russia the only army
  in eight of the new states.
- **Carried:** R82f counted by realm (ADR-1042), and the free 1975 world's far conquests.

## Ideas from other games (not scored)

- **Hearts of Iron IV** lets a player join a war in progress from any start date, with its occupations and war score
  in hand. A free 1943 should open with the war on.
- **Europa Universalis' map modes** give a colony a tint of its ruler's colour. Belgian Congo's new near-black is
  neither its ruler's nor readable (R70-N2).

## Strengths (verified)

- **Every one of run 69's named cases is fixed, on run 69's own probes and seeds:**
  - the held land of a 1946 free game, 21,338 → 0 cells;
  - the aid lines, 13 and 21 → 0 economy lines;
  - 37009's tribute line;
  - Georgia's colour, ΔE 1.3 → 33.5 on the page;
  - Lebanon;
  - the five late names;
  - the successors' purses;
  - the city label of Undo.
- **Undo is now pixel-exact** on every God act, on a 1938 and a 1983 world, across four seeds. Run 69 had hundreds to
  thousands of pixels on the late world.
