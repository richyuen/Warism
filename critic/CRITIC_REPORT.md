# Critic report, run 62 (focused): Batches 14 and 15, the historical track

- **Mode: focused.** The spawning message asked for a run "per CRITIC_PROMPT.md" and not for a full run, so the run is
  focused (ADR-804, ADR-915).
  - Run 61 (full, `d971a46b`) had no blocking issue and every dimension at its bar.
  - So the dimensions scored afresh are those the changed files touch (`git diff --stat d971a46b HEAD`, 224 files).
  - The batch is the historical track (`1938h`, R62a–R62m, R63) plus run 61's findings (R59a–e, R60a–e).
  - The sim changed (`src/sim`: `landings.ts`, `track.ts`, `world.ts`, the AI and eleven systems gated on
    `world.steered` / `world.holds`), so the bulk sets were due to be re-run.
- **Commit judged:** `9e094f50a56e285fab163341343346549c919c80`, HEAD at the start, on a clean tree (`critic/c62_commit.txt`).
- **Setup:**
  - Build: `vite build --outDir critic/c62_dist`, exit 0 (`critic/c62_build.log`).
  - Server: `vite preview` on 127.0.0.1:5299.
  - Browser: Playwright Chromium at 1600 × 900, 390 × 844, 844 × 390, 932 × 430, 1024 × 500 and 667 × 375.
  - Probes: `critic/scripts/c62_*` (new ones `c62_h_*.mjs`, `c62_track.ts`, `c62_nagasaki.ts`; run 61's page probes
    copied as `c62_*` and pointed at 5299).
  - Run 61's headless job list was replayed on HEAD by `tools/diag/replayCritic.ts --run 61 --jobs 4 --out
    critic/c62_replay61` (`critic/c62_replay61.log`).
- **What was left out for time (ADR-917, about an hour aimed at):**
  - Run 61's bulk landing sets were not re-run: the 396 named setups (`c61_liab.sh named`), the 153 stuck-return runs,
    the 168 next-voyage runs and Malta's 18. In their place:
    - the required 90 `landingInvariants` runs on new seeds;
    - run 61's three `slowClick` breaks;
    - run 61's seven named `landingInvariants` cases and the R60-N1 / R60-N2 next-voyage traces, run directly
      (`critic/scripts/c62_jobsNamed.txt`);
    - the part of run 61's 37-job replay that finished (listed below).
  - The replay of run 61's 37 jobs was stopped after 15 of them to free the machine for the named cases. The jobs it
    finished are compared below; the rest (landingRows `all`, seaBattles 31501 and 28061, workerDeterminism 31401,
    topArea, piles, the repulse and held-by probes) are not claimed.
  - Not measured:
    - performance alone: no quiet machine, so every page figure here was taken beside 4 to 8 headless sims;
    - `seaBattlesLook` (R60-N5);
    - an editor edit as the track's intervention (Take control and a God Mode revolt were driven);
    - save and Continue mid-track in the page.
  - The dimensions not touched by the batch's game code for plain worlds are **carried**:
    - `semanticZoom`, `tanks`, `aircraft`, `aiNukes` and `performance` (see each row for why).
    - `world.steered` and `world.holds` are false in every world without a track and once a track has ended
      (`src/sim/world.ts`, `Track.held` returns false when `ended`).
    - Plain 1938's 20-year worlds are bit-identical to run 61's: 7019 ends at `99caf939` and 32019 at `4702acef`, as in
      run 61 (`critic/c62_replay61/c61_seed7019_save.log`, `…/c61_seed32019_save.log`).

## Verdict

**No blocking issue. Every dimension is at its bar (8).**

- **No checker breaks a rule on new seeds:**
  - `landingInvariants` via `landingFuzz --seeds 15 --first 33101`: **0 of 90 runs broken** (0.0 %), with R59b's new
    `leftAgain` rule (`critic/c62_landingFuzz_summary.txt`, logs in `critic/c62_lf/`).
  - diploInvariants: 0 broken on 33501 (1938, 5 y), 33503 (random, 5 y) and 33505 (heroes, 5 y)
    (`critic/c62_diploinv_*.log`).
  - worldInvariants: 0 broken on 33507, 33509 and 33511 (heroes), 5 years each, every rule set (`critic/c62_wi_*.log`).
  - **The historical track's checker** (`tests/helpers/historyTrack.ts`, run by `critic/scripts/c62_track.ts`):
    - the scenario's own seed 1938: 0 broken lines, 0 events passed over, the track ended on 27 July 1953
      (`critic/c62_track_1938.log`);
    - new seeds 33301 and 33303 (warnings only, ADR-950): 0 broken, one event passed over by rule (event 18, the
      Spanish war's end, the Republic already dead) (`critic/c62_track_33301.log`, `critic/c62_track_33303.log`).
- **Every finding of runs 60 and 61 that the batch set out to fix, and this run re-ran, is fixed on this build.** Case
  by case (the table at the end):
  - R61-N1, R61-N2, R61-N3 and R61-N5;
  - R60-N1, R60-N2, R60-N3 and R60-N4.

  R61-N4 is now specified and holds on new seeds. R60-N5 (seaBattlesLook's "no fleet") was not run.
- **The historical track works as specified and is the best thing in this build to watch.** Its own seed was played
  from the title screen by mouse at Max to February 1954 with 0 page errors (`critic/c62_hw_desk.json`).
  - It holds history's dates: Paris German on 14 June 1940 and French again on 26 August 1944.
  - Its births fall on history's days: Slovakia 15 March 1939, Vichy 23 June 1940, Israel 15 May 1948, the two Koreas
    in August and September 1948, the two Germanys in 1949, Indonesia on 28 December 1949.
- **What it gets wrong is in the telling, not in the rules** (non-blocking, below):
  - One click ends it. "Take control" on day 3, or one God Mode revolt, ends the 15-year replay for good.
    - No warning comes first: not on the button, the God Mode bar or the form, and no confirm.
    - The ticker gives no row of it; only the History has one (R62-N1).
  - Rows written for the builder reach the player ("The Pacific: the timeline's stages, island by island"), and some
    news is told twice (R62-N2).
  - "The mobilisation" is named 22 times without saying whose (R62-N3).
  - On 8 May 1945 the player reads "Germany was annexed by Soviet Union" an hour after the four zones were drawn (R62-N4).

## Scores

| Dimension | Run 61 | Run 62 | |
|---|---|---|---|
| Map visuals and readability | 8 | 8 | **Carried, with new sight of the track's maps.** `MapView.ts` and `flagStore.ts` changed only for the track's flags and names. <ul><li>The track's maps read as history: October 1940, Vichy France beside an occupied, hatched north, Slovakia, Hungary and Romania (`critic/shots/c62hw_desk_10_europe.png`).</li><li>August 1950: People's China, India, the two Koreas (`critic/shots/c62hw_desk_48_world.png`).</li><li>Flags of the track's own nations: Vichy, Croatia, People's China.</li></ul> **Not 9 (old):** run 61's corridor, Caribbean chip pile and relations hairball were not re-shot (carried). The track's line under the date is 0.72 em, about 9 px on a phone (`critic/shots/c62hp_390x844_bar.png`). |
| Diplomacy, war, alliance, puppet, revolt depth | 8 | 8 | **Scored afresh.** <ul><li>**diploInvariants and worldInvariants, 0 broken on new seeds:** 33501, 33503 (random), 33505 (heroes); worldInvariants on 33507, 33509 and 33511 (heroes), every rule set (`critic/c62_diploinv_*.log`, `critic/c62_wi_33507.log`).</li><li>Run 61's 10-year diploInvariants cases 32001–32011: all 0 again (`critic/c62_replay61/c61_diploinv_*.log`).</li><li>**The track's checker: 0 broken** on its own seed and on 33301 and 33303. No war or peace off the timeline, the rules of exit, realm and held kept for 15½ years (`critic/c62_track_*.log`).</li><li>The track's wars and peaces arrive on their days in the page, for example "28 October 1940 Italy declared war on Greece" (`critic/c62_hn_greece.json`). The Korean War opens with "North Korea ⚔ South Korea +6" and closes at Panmunjom on 27 July 1953 (`critic/c62_hw_desk.json`, samples 48–60).</li><li>After the track the world's own diplomacy resumes. On the own seed, 48 wars in two years and 2 detonations (`critic/c62_track_1938.log`).</li></ul> **Not 9:** <ul><li>R62-N4: "Germany was annexed by Soviet Union" at the surrender.</li><li>The world after 1953 forgets the blocs at once: the Soviet Union declares war on Norway two days after the armistice (Design objections).</li><li>Run 61's "alliances ignore the map" is not re-checked (plain 1938 unchanged, `99caf939`).</li></ul> |
| Emergent world dynamics | 8 | 8 | **Scored afresh.** <ul><li>**1938h is a world worth watching for 15 years:**<ul><li>the fronts move by the track's stages (`critic/shots/c62hw_desk_17_world.png`, Case Blue, Lae and Salamaua in July 1942);</li><li>the Reich's end (`critic/shots/c62hw_desk_27_europe.png`, February 1945);</li><li>the Chinese civil war's chips renamed as the People's Republic is proclaimed (sample 45);</li><li>Korea (sample 48).</li></ul></li><li>The fighting is the sim's own. Paris falls by the fighting on 14 June on 1938 and 33301 and on 15 June on 33303 (R63's claim holds on my new seeds).</li><li>**R61-N4 re-run:** 32403 still has no war in 10 years with 3 nations, nor in 15 with 2 (`critic/c62_few.log`). SPEC §3.4 now says why. On new seeds 33403–33408 with 3 nations, **6 of 6** went to war: on days 6–454, and 2,386 once.</li><li>Plain 1938's 20-year worlds are bit-identical to run 61's.</li></ul> **Not 9:** <ul><li>The same history every game: the track's seed is fixed by design (Design objections).</li><li>After 1953 the world falls into 39–48 wars in a year (new seeds 33301, 33303 and the own seed).</li></ul> |
| God Mode | 8 | 8 | **Carried, with the batch's one change to it checked.** God Mode's tools are not changed; a God act now ends the track. <ul><li>On 1938h, opening and closing the Editor and God Mode panels leaves the "Next" line.</li><li>One revolt by mouse (Bavaria, day 2) is applied ("Free Saxony broke away from Germany", "Germany declared war on Free Saxony") and ends the track that hour, told in History (`critic/c62_hg.json`, `critic/shots/c62hg_history.png`).</li></ul> **Not 9 (old, plus R62-N1):** the God Mode bar says nothing of its tools ending the replay (`critic/shots/c62hg_god_open.png`). |
| Editor and scenarios | 8 | 8 | **Scored afresh.** <ul><li>**R61-N2 fixed:** with a file pending, the 1938 Start is disabled with "A scenario file is chosen: start it or cancel it under Scenario file". The browser's "No file chosen" is replaced by the game's "Choose a file", and Cancel is styled (`critic/shots/c62xe_32441_title.png`; `MAINSTART=1 node critic/scripts/c62_x_editor.mjs 32441` times out on the disabled button).</li><li>The editor's path end to end on 32443: paint, undo, redo, export (591,613 bytes, as in run 61), load, start, the paint there (`critic/c62_xe_32443.json` and its log).</li><li>**R61-N3 fixed:** a cut file is told "Could not load: the file is damaged or incomplete"; plain text is still told "not a Warism scenario file" (`critic/c62_xb_trunc.json`, `critic/shots/c62xb_trunc.png`).</li><li>**The new scenario:** "World, 1938 — Historical" is listed on the title. Its form says "A replay of history: the same world every game, with no seed or option to choose" (`critic/shots/c62hw_desk_title.png`). Its seed is its own whatever the URL: `?seed=5`, `?seed=77` and none give hash `4149540175` at day 30, and `?after=22` differs only in the track's section (`critic/c62_hseed.json`).</li></ul> **Not 9:** <ul><li>R62-N1: the form does not say that taking a nation, a God Mode act or an editor edit ends the replay.</li><li>The track defines a nation it never uses: `VIE` (Hanoi) is in `1938h/nations.json` and no event names it, so it is never born on any seed (`critic/c62_track_*.log`, "never: VIE").</li></ul> |
| Stats and history | 8 | 8 | **Scored afresh.** <ul><li>**R61-N5 fixed:** on 32019's year-20 save, the same hour's rows follow their head with "↳". "United States made peace with Free San Salvador" now reads before "↳ … was annexed" and "↳ … was destroyed" (`critic/shots/c62hi_32019_history.png`). History opens in 168 ms with 3,129 events, as run 61 had (`critic/c62_hi_32019.json`).</li><li>The track's events reach History and the ticker by name: "History's events", "History ended", and "History's course ended at your first intervention, and the world goes its own way" (`critic/shots/c62hi_1600x900_history.png`).</li></ul> **Not 9:** <ul><li>R62-N2: builder's words in the rows, and double rows.</li><li>R62-N3: "The mobilisation" ×22.</li><li>R62-N5: the Nagasaki strike's row (below).</li></ul> |
| UI/UX and polish | 8 | 8 | **Scored afresh.** <ul><li>**R61-N1 fixed:** after a landing order, the landings bar stands beside the panel at 844 × 390 (bar 558–837, panel to 551), 932 × 430, 1024 × 500 and 667 × 375. The element at the ×'s centre is the × and a click closes the panel at every size (`critic/c62_xcb_21103_*.json`, `critic/shots/c62xcb_21103_844x390.png`).</li><li>**R60-N4 fixed:** at 667 × 375 the panel ends at 305, above the bar, and its last row is reachable (`critic/c62_mw_31201_GER_667x375.json`, `critic/shots/c62mw_31201_GER_667x375_last.png`).</li><li>**R60-N3 fixed:** the order rows are dated ("3 January 1938 Infantry division 326: …") (`critic/c62_wt_ITA_31211_h114.json`).</li><li>The track's "Next, 12 March 1938: The Anschluss" line fits the bar at 390 × 844 and 844 × 390, with no overflow (`critic/c62_hp_*.json`, `critic/shots/c62hp_390x844_bar.png`). Stepped by 6 hours, it moves on in the step its event fires in (`critic/c62_hn_greece.json`).</li><li>0 page errors in every c62 page probe.</li></ul> **Not 9:** <ul><li>R62-N1: the one-click end of the track, unwarned and untold in the ticker.</li><li>R62-N6: at Max the "Next" line names an event already past in 14 of 60 samples.</li><li>The order rows dated 3 January stand after a 4 January row in the ticker (`critic/c62_wt_ITA_31211_h114.json`).</li><li>The track's line is small on a phone.</li></ul> |
| Performance | 8 | 8 | **Carried; nothing measured alone.** <ul><li>The whole track in the page at Max, 1600 × 900, measured beside 4–8 headless sims: 58.3–60.2 fps in each of 63 quarter-year spans, longest gap between frames 100 ms, 0 frames over 500 ms (`critic/c62_hw_desk.json`).</li><li>The track's 15½ years headless with its checker took 279–398 s for 136,465 ticks, about 2.0–2.9 ms a tick including the checker, under load (`critic/c62_track_*.log`); the budget is 6.5 ms.</li><li>Plain 1938's 7019 20-year run: mean tick 3.03 ms under load against run 61's 2.86 (`critic/c62_replay61/c61_seed7019_save.log`): same hash, a busier machine.</li></ul> |
| Stability | 8 | 8 | **Scored afresh.** <ul><li>**Determinism across commits:** 7019 and 32019 end their 20 years at `99caf939` and `4702acef`, as on run 61's commit.</li><li>The three `slowClick` cases of run 61 give the same lines word for word (`critic/c62_li_*.log`).</li><li>**The track is the same each run:** one hash for three URLs' seeds (`critic/c62_hseed.json`). The page's own run ends 1953 with the timeline's births and wars, as headless.</li><li>The second seed is taken at the intervention: two pages with `?after=11` and `?after=22`, both taking Germany on day 3, are at different hashes 200 days on (`critic/c62_hi_1600x900.json`).</li><li>The page ran 1938 → 1954 at Max with 0 page errors (`critic/c62_hw_desk.json`).</li><li>All c62 page probes record 0 page errors.</li></ul> **Not 9:** save and Continue mid-track in the page not driven this run (left out for time). |
| Semantic zoom to unit level (needs 8) | 8 | 8 | **Carried.** No render or zoom code changed but `MapView.ts`'s flag lookup (4 lines). Plain 1938 worlds are bit-identical to run 61's. |
| Naval warfare (needs 8) | 8 | 8 | **Scored afresh** (`landings.ts` changed: R59a's next-voyage days, R59b's boarding order). <ul><li>**landingInvariants on new seeds: 0 of 90 broken** (33101–33129 odd × six shapes), `slowClick` included, under the checker's new `leftAgain` rule (`critic/c62_landingFuzz_summary.txt`).</li><li>Run 61's `slowClick` cases (R61-SC) are unchanged word for word: 32167 g2 and g1 ("t450's click of 366 not ashore after 13.2 / 12.8 days") and 32115 15101 g2 ("t562's click of 274 … 9.3 days") (`critic/c62_li_*.log`).</li><li>Run 61's seven named cases (30041 g1, 31099 g1, 203997, 204017, 29043 15101, 28037 od8, 28039 g1) are text-identical to run 61's logs: four with their old `slowClick` line, three at 0 (`critic/c62_li_*.log`).</li><li>**R60-N1 fixed** (31173's 366, R59a): run 61 told "next voyage, about 1 day" from t831 to t934. Now it says "about 5 days" at t831 and counts down 4, 3, 2, 1 to the voyage at t935, which is the truth (`critic/c62_nvtrace_31173_366.log`).</li><li>**R60-N2 fixed** (31127's 272, R59b): left at the port at t423, it now boards the group's next voyage at t510 and is ashore by t567. Run 61's 272 was left again at t510 and told "about 5 days" more (`critic/c62_nvtrace_31127_272.log`).</li><li>The next voyage told as dated rows in the ticker (`critic/c62_wt_ITA_31211_h114.json`).</li><li>The track's war at sea is on: carrier strikes of the United States on Japan's ships, sea battles, the Pacific by stages (`critic/c62_hw_desk.json`).</li></ul> **Not 9 (old):** the `slowClick` tail of R61-SC; Malta never taken (not re-run, sim of landings unchanged for AI worlds by hash). |
| Tanks (needs 8) | 8 | 8 | **Carried.** `combat.ts` changed by one gate (`world.holds`), false outside a running track; plain 1938 bit-identical. |
| Aircraft (needs 8) | 8 | 8 | **Carried.** No air code changed. The track's air war is told monthly ("People's China and United States fought in the air this month", 1951–53, `critic/c62_hw_desk.json`). |
| AI nuclear use (needs 8) | 8 | 8 | **Carried.** `nuclear.ts` changed by one gate (`world.steered`): the AI strikes nothing while the track runs, as SPEC §7.7 says. Plain 1938 is bit-identical. After the track the AI strikes again: 2 detonations in two years on the own seed, 1 in a year on 33301 (`critic/c62_track_*.log`). The track's own two strikes are a timeline event; their telling is R62-N5. |

## Blocking issues

None.

- `landingInvariants` on 90 new runs: 0 broken (no `slowClick` either).
- diploInvariants on 3 new seeds and run 61's 6, worldInvariants on 3 new seeds and run 61's 4: 0 broken.
- The track's checker on its own seed and 2 new seeds: 0 broken.
- 0 page errors.

## Non-blocking issues (prioritised)

1. **R62-N1 (UI, track, new): one click ends the historical replay, unwarned and untold in the ticker.**
   - The case: `node critic/scripts/c62_h_interv.mjs 1600 900`. Open 1938h, select Germany, click "Take control" on
     day 3.
   - The "Next, 12 March 1938: The Anschluss" line vanishes and the track has ended for good.
     - Before: `critic/shots/c62hi_1600x900_notinterv.png`. After: `critic/shots/c62hi_1600x900_taken.png`.
   - Nothing said beforehand that it would:
     - the button reads "Take control" as in any world;
     - the form says only "A replay of history: the same world every game, with no seed or option to choose"
       (`critic/shots/c62hw_desk_title.png`).
   - The ticker has no row of it. The History alone has "History's course ended at your first intervention, and the
     world goes its own way" (`critic/shots/c62hi_1600x900_history.png`).
   - The same happens with one God Mode revolt by mouse on day 2 (`critic/c62_hg.json`).
     - The track ends that hour; the ticker tells the revolt, not the end.
     - The God Mode bar has no word that its tools end the replay (`critic/shots/c62hg_god_open.png`).
   - These do not end it, as SPEC says (checked: the line stays; `afterNotInterv` in `critic/c62_hi_1600x900.json`, and
     `critic/c62_hg.json`):
     - pause, speed and selection;
     - History and Statistics;
     - opening the Editor and God Mode panels without an act.
   - **Fix:** while the track runs, say on the form and on the first act's button (or by a confirm) that it ends the
     replay. Tell the end in the ticker.
2. **R62-N2 (stats/readability, track, new): builder's words and double rows in the player's news.**
   - Rows the player reads:
     - "The Pacific: the timeline's stages, island by island";
     - "The China front: Japan advances by its stages";
     - "The Soviet offensive: the timeline's stages" (`critic/c62_hw_desk.json`, samples 17, 29; the ticker in
       `critic/shots/c62hw_desk_17_world.png`).
   - Doubled news:
     - "Soviet Union declared war on Japan" beside "The Soviet Union declares war on Japan";
     - "31 January 1945 The Vistula-Oder; Budapest besieged: the Germans fall back" beside "… Budapest besieged";
     - "Kharkov, Sevastopol, Case Blue to the Don and Rostov: the pockets" beside "… to the Don and Rostov";
     - "India independent" beside "India" (samples 27, 17, 29, 37).
   - **Fix:** notes are player text: drop "the timeline's", and tell one event once (the war's own row or the note,
     not both; a `withdraw` with its stage, not twice).
3. **R62-N3 (readability, track, new): "The mobilisation" ×22, whose not said.**
   - 22 `forces` events of the Soviet Union, 15 July 1941 to 15 May 1944, are all noted "The mobilisation". So the line
     under the date reads "Next, 15 March 1944: The mobilisation" quarter after quarter (`critic/c62_hw_desk.json`,
     samples 17–24), and the History says so 22 times without the Soviet Union's name.
   - **Fix:** "Soviet reserves: 15 rifle divisions at Moscow", or leave the arrivals unnamed and out of the "Next" line.
4. **R62-N4 (diplomacy readability, track, new): "Germany was annexed by Soviet Union" at the surrender.**
   - On 8 May 1945 the timeline draws the four zones at hours 2–4. Then event 381 annexes what is left of the Reich to
     the Soviet Union ("The Reich ends: what is left of it, between the zones and the Oder").
   - The player's ticker reads "8 May 1945 Germany was annexed by Soviet Union" (`critic/c62_hw_desk.json`, sample 28).
     A viewer takes it as the Soviet Union taking Germany.
   - **Fix:** tell that row by its note alone, or give the remnant to the zones' holders by ring.
5. **R62-N5 (nukes readability, track, new): Nagasaki "where no nation holds the land".**
   - The page's ticker on 15 August 1945 reads "9 August 1945 United States set off an atomic bomb near Nagasaki where
     no nation holds the land: 72,000 civilians killed; no troops in the blast" (`critic/c62_hw_desk.json`, sample 29).
   - Nagasaki was Japan's.
   - Hiroshima's burst, three days before, is on Japan's held land (`critic/c62_nagasaki.log`: t66584, every cell
     around it JAP/JAP).
   - Nagasaki's burst (t66659) is on a sea cell, owner 0 and holder 0, with Japan's held land on the next cells
     (`critic/c62_nagasaki.log`). The timeline's `at` [129.87, 32.75] rasterises to water, so the row says no nation's
     land beside 72,000 dead.
   - **Fix:** put the timeline's `at` on land (or snap a strike to its nearest land cell), and never pair "no nation
     holds the land" with civilians killed.
6. **R62-N6 (UI, track, new): at Max the "Next" line names an event already past.**
   - In the page's watch at Max, 14 of 60 samples read a "Next" dated before the date beside it, by up to 28 days.
     Examples (`critic/c62_hw_desk.json`):
     - "26 February 1946 · Next, 2 February 1946: Southern Sakhalin annexed";
     - "18 August 1950 · Next, 31 July 1950: The other contingents".
   - The cause: the line rides on `nationStats`, which is posted at most once a second (`STATS_INTERVAL_MS`,
     `src/worker/server.ts`), while the date moves every frame.
   - A second later the line is right. The bar in the later shot reads "27 February 1946 · Next, 17 April 1946: Syria
     independent" (`critic/shots/c62hw_desk_31_bar_crop.png`).
   - **Fix:** do not show a "Next" whose date is before the shown date, or send the next event's tick with the frame.
7. **R61-SC (naval, carried as is): run 61's three `slowClick` breaks, word for word** (`critic/c62_li_*.log`). 0 new
   breaks in 90 runs.
8. **Small:**
   - Ticker order rows out of date order: "4 January 1938 Romania declared war on Bulgaria" above "3 January 1938
     Infantry division 326: …" (`critic/c62_wt_ITA_31211_h114.json`).
   - `VIE` defined and never born.
   - The track's line is about 9 px on a phone.
9. **Old, carried (not re-run, plain 1938 unchanged by hash):** the phone's panel over the corridor; alliances
   ignoring the map; "0 civilians killed" beside large military losses; the ranking's Land figure has no unit; Malta
   never taken.

## Run 61's cases re-run

| Run 61 case | Run 61 (`d971a46b`) | Run 62 (`9e094f50`) | Evidence |
|---|---|---|---|
| R61-N1 `c61_x_closeblock 21103` at 844 × 390, 932 × 430, 1024 × 500 | bar over the ×, click fails | **fixed**: bar beside the panel, × topmost, click closes, at all three and 667 × 375 | `critic/c62_xcb_21103_*.json`, `critic/shots/c62xcb_21103_844x390.png` |
| R61-N2 `MAINSTART=1 c61_x_editor 32441` | main Start drops the file | **fixed**: main Start disabled with its reason; "Choose a file" | `critic/shots/c62xe_32441_title.png` |
| Editor by mouse 32443 | paint kept, 591,613 bytes | the same | `critic/c62_xe_32443.json` |
| R61-N3 cut file | "Failed to fetch" | **fixed**: "the file is damaged or incomplete" | `critic/c62_xb_trunc.json` |
| R61-N4 32403, 3 and 2 nations | 0 wars in 10 / 15 years | the same; now in SPEC §3.4. New 33403–33408: 6 of 6 at war | `critic/c62_few.log` |
| R61-N5 32019 y20 History | same-day rows backwards | **fixed**: "↳" rows under their head, in order | `critic/shots/c62hi_32019_history.png` |
| R61-SC 32167 g2, g1; 32115 15101 g2 | 1 `slowClick` each | the same lines | `critic/c62_li_*.log` |
| R60-N3 31211 h114 ticker | order rows undated | **fixed**: dated | `critic/c62_wt_ITA_31211_h114.json` |
| R60-N4 31201 at 667 × 375 | the panel's foot under the bar | **fixed**: panel ends at 305, above the bar | `critic/shots/c62mw_31201_GER_667x375_last.png` |
| 7019 and 32019, 20 years | `99caf939`, `4702acef` | the same | `critic/c62_replay61/c61_seed*_save.log` |
| diploInvariants 32001–32011 (6 runs) | 0 | 0 | `critic/c62_replay61/c61_diploinv_*.log` |
| worldInvariants 32051, 32053h, 32055, 32057rw | 0 | 0 on all four | `critic/c62_replay61/c61_wi_*.log` |
| seaBattles 32061, 32063r | 75, 87 battles | 75, 87 | `critic/c62_replay61/c61_sb_*.log` |
| workerDeterminism 32059 | `cf5a4a7f` on every arm | the same | `critic/c62_replay61/c61_wd_32059.log` |
| Named landingInvariants: 30041 g1, 31099 g1, 203997, 204017, 29043 15101, 28037 od8, 28039 g1 | 4 with a `slowClick`, 3 at 0 | text-identical | `critic/c62_li_*.log` |
| R60-N1 31173 366 | "about 1 day" for 4.3 days | **fixed**: 5, 4, 3, 2, 1 days, then sails | `critic/c62_nvtrace_31173_366.log` |
| R60-N2 31127 272 | left again at t510 | **fixed**: boards at t510, ashore by t567 | `critic/c62_nvtrace_31127_272.log` |
| The rest of run 61's 37 jobs (landingRows all, seaBattles 31501/28061, workerDeterminism 31401, topArea, piles, repulse, held-by) | | replay stopped; not claimed | `critic/c62_replay61.log` |
| The 396 named setups, 153 stuck-return, 168 next-voyage, Malta's 18 | | **not re-run, for time** | — |

## Design objections (none blocking, no score lowered)

- **The world after 1953 forgets the Cold War at once.** On the own seed the Soviet Union declares war on Norway on 29
  July 1953, two days after Panmunjom, and the United Kingdom on Italy six days after. On new seeds Italy invades
  Ethiopia again on 31 July 1953. In all, 39–48 wars come in the first year after the track (`critic/c62_track_*.log`).
  - ADR-944 measures this as an ordinary game's opening pace, and that is true. But a viewer who has watched 15 years
    of history sees it fall apart in a week.
  - The blocs the track built (NATO, the Warsaw Pact) are not in its timeline, so nothing holds the world after.
- **The same history every game** (the seed fixed, ADR-919): replays differ only after the end or the first
  intervention, and a viewer who has seen it once has seen it all.

## Ideas from other games (not scored)

- Hearts of Iron asks before a player leaves "historical focus" mode; Warism could ask once before the first act that
  ends the replay.
- Paradox games name a mobilisation by its country and size in the event log ("Soviet Union: 15 divisions raised").

## Strengths (verified)

- **The historical track is faithful to its dates and clean to the checker.** On its own seed it runs 1938 → 1953 with:
  - 0 broken lines and 0 events passed over;
  - Paris German on 14 June 1940 and free on 26 August 1944;
  - every birth on history's day.

  It does so in the page at Max at 58–60 fps with 0 page errors (`critic/c62_track_1938.log`, `critic/c62_hw_desk.json`).
- **The batch fixed what it set out to fix.** Six of run 61's findings are fixed on the same probes that found them,
  and the 90 new landing runs are clean.
