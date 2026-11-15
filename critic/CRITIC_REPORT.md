# Critic report, run 69 (full): Batches 24, 26 and 27 (R80a–l, R81i, R82a–i, R83), on `e5b97c8e`

- **Mode: full.** The spawning message asks for a full run ("Full run. Run as the Warism critic…"; CRITIC_PROMPT, ADR-915).
  Nothing was left out for time. Every dimension is scored afresh.
- **Commit judged:** `e5b97c8e74b0b201812ffec208662ff1f184470c`, HEAD at the start (`critic/c69_commit.txt`) and at
  the end. The tree had three untracked evidence PNGs under `docs/evidence/7.132/` (not the critic's).
- **The last report:** run 68, focused, on `bfda9503`. One blocking issue (R68-B1); God Mode 7, every other dimension 8.
- **What changed since:** 31 commits, 41 files under `src/`, `data/` and `tools/` (4,824 lines added).
  - Batch 24, R80a–l: the replay runs to 31 December 1991. 44 dormant nations, 240 events of 1976–91, a bloc that ends
    (the Warsaw Pact), the Soviet breakup with forces handed over, the German and Yemeni unions, six late techs, the
    dominions freed on their dates, and the returns of R80l at the end.
  - Batch 26, R82a–i: run 68's findings.
    - R82a, Undo and load redraw the burst layers.
    - R82b, Normandy is fought for.
    - R82c, the carrier row.
    - R82d, a colony's distance cost.
    - R82e, the Normandy stage's name.
    - R82f, no AI war outnumbered by over 4 realms to 1.
    - R82h, the chart's names and colours.
    - R82i, a burst's ground drawn under the units.
    - R82g was answered with no code.
  - R81i: the one-line tags at a battle.
  - Batch 27, R83: the "World history" card, and a later year played free with 1938's form.
  - ADR-1058: the deploy's import cycle.
- **Due because the sim changed** (`git diff --stat bfda9503 HEAD -- src/sim data public/data` is not empty):
  - run 61's bulk sets and Malta's 18 were re-run;
  - plain 1938 was not carried (the diff touches `src/sim/ai/strategic.ts`, `systems/war.ts`, `systems/territory.ts`,
    `tick.ts` and `sim.ts`).
- **Setup.**
  - Build: `vite build --outDir critic/c69_dist`, exit 0 (`critic/c69_build.log`).
  - Starts: `npm run saves -- critic/c69_starts`, 54 years to 1991, 513 s, copied into the build
    (`critic/scripts/c69_build.sh`).
  - Served by `vite preview` on 127.0.0.1:5369.
  - Browser: Playwright Chromium on the GPU, at 1600 × 900, 390 × 844 and 844 × 390.
  - Run 68's probes were copied as `c69_*`; the comparers point at `c68_*`.
  - The new seed family is 51xxx (`grep` found no use of it in the repo; the builder's R82f run used 43101–43119).
  - Chains:
    - `c69_runNamed.sh`: 140 headless jobs, 6 at a time, then `landingFuzz --seeds 15 --first 51101`;
    - `c69_chainS.sh`: the starts-based headless cases;
    - `c69_chain1.sh`: `c69_pagesA.sh` and `c69_pagesC.sh`;
    - `c69_chain2.sh`: `c69_pages.sh`, run 68's left-out `suite`, `suite2`, `chainE` and `suiteB`;
    - `c69_chainBulk.sh`;
    - `c69_ev91run.sh`;
    - `c69_chainP_body.sh` (performance, alone and last).
  - New probes:
    - `c69_r83.mjs` (R83's card, form and URL, each URL loaded three times);
    - `c69_ev91.mjs` (the replay's last years on the page);
    - `c69_x_trackend91.mjs` and `c69_endhours91.ts` (the 1991 end);
    - `c69_endleb.ts` (the end hour's annexations);
    - `c69_free.ts` (the rule checkers on a game from a built year, free with R83b's options or on the track past
      1991);
    - `c69_heldfree.ts` (land held at peace in a free game, year by year);
    - `c69_aidcheck.ts` (gold rises against bloc aid);
    - `c69_goldjump.ts` (37009's economy line, hour by hour);
    - `c69_loadscen.mjs` (run 68's untried case: a scenario export loaded after a burst);
    - `c69_undo2y.mjs` (Undo on a 1983 free game).
  - Run 68's commit `bfda9503` was put in `critic/wt` for three cases: the held land, the aid and the few-nation wars.
    It used run 68's own starts (`critic/c68_starts`, built by that commit) through a junction. The junctions were
    unlinked before `git worktree remove`.
- **Incidents, disclosed:**
  - **Faults of my own probes, caught and re-run:**
    - `c69_ev91.mjs`'s first runs: the chain's log names were over Windows' path limit, so the 1990 case never ran,
      and the 1976 and 1983 cases placed the camera by the layer's size, not the cells. All three were re-run by
      `c69_ev91run.sh`; those are the figures used.
    - `c69_r83.mjs`'s first two runs (1983 desk and phone) read the hash from `inspect()`, which has none. They were
      fixed to `sim.hash()`; the other four runs have the hashes.
    - `c69_freeburst.ts` counts `PeaceMade`, which is not an event kind, so its "peaces 0" means nothing (run 68's
      too).
    - `c69_h_zoom.mjs` reads `mpp 19567.9` at every step: its camera never moved, so it measured nothing (run 67's
      the same). Semantic zoom rests on `z_zoom`, `c_battle` and `x_indfps` instead.
    - `c69_g_editor.mjs 39921` stops at its 60-day wait after 15 minutes, with marks to day 30 saved
      (`critic/c69_g_39921.json`). Runs 63 and 67 stopped the same way (a strike pause the probe does not answer);
      the editor's placements, refusal, export and load before it all hold.
    - `c69_chainBulk.sh` ran its three sets one after another; to finish in time I stopped its shell after the
      named landing set had started and ran the stuck-return and next-voyage sets beside it
      (`critic/scripts/c69_bulk2.sh`, 4 at a time each). The landing set ran to its end unchanged.
  - **Not the game's:**
    - `c69_x_editor.mjs 32441` with `MAINSTART=1` clicks the main Start while a scenario file is chosen. That button
      is disabled by design ("A scenario file is chosen: start it or cancel it"), so the probe's expectation is stale.
    - The critic-guard hook refused a `git checkout` inside `critic/wt`, so the few-nation case was not bisected.
- **Writes outside `critic/` by tools at their defaults:**
  - `landingFuzz` to `.cache/landingFuzz/e5b97c8e-51101/`;
  - `npm run sim` to `.cache/runs/*.json`;
  - `breakup.ts` and `heldAtEnd.ts` to `.cache/`.

## Verdict

**Four blocking issues.** Three are rules a checker reports broken, all old, on surfaces no earlier run checked (R69-B1–B3). One contradicts R80d's claim: Russia and Georgia drawn in one colour (R69-B4). R68-B1 is fixed. Two scores move.

- **God Mode, 7 → 8:** R68-B1 is fixed, on run 68's own case. `c69_undo2.mjs 41211` shows 0 px differing for the
  nuke undone; run 68 had 7,028 px.
- **Diplomacy, war and alliances, 8 → 6:**
  - `diploInvariants`' `held` and `worldInvariants`' `economy` break in games played free from a year of the replay.
  - The economy rule also breaks on a named plain-1938 seed.
- **Map visuals, 8 → 7:** the new nations' colours (R69-B4). Russia and Georgia are the same red (ΔE 1.3), and Egypt
  is "United Arab Republic" to 1991.

**The rule checkers on new seeds:**
- diploInvariants, 0 broken:
  - 51001 (1938), 51003 (random), 51005 (heroes) and 51007 (random world), 5 years each;
  - 51009, 10 years;
  - run 68's 41001/3/5/7 and run 67's 39001–39011;
  - the named 33501/3/5, 37001/3/5 and 38001/3/5.
- worldInvariants, every rule set, **1 broken (37009, named; R69-B3)**. 0 broken on:
  - 51051, 51053 (heroes), 51055 (random world) and 51057 (random diplomacy);
  - 41051/3/5 and 39051/3/5;
  - the named 36009/11, 37007/11 and 38007/9/11.
- **`c69_free.ts` on ten games from built years** (the checkers' hourly and daily rules, with no formation of a dead
  nation):
  - 0 broken on the track to 1991 and five years past it (1989 51509, 1991 51511), and in two free games with random
    diplomacy (1975 51503 and 1991 51519, no blocs to aid). The third, 1946 51515, breaks only `held` (R69-B1).
  - **5 to 21 broken lines in every free game with the scenario's diplomacy** (1962, 1975, 1983 ×2 and 1991): R69-B2.
  - **`held` on day 1** of the free games from 1946 and 1962: R69-B1.
- `landingInvariants` via `landingFuzz --seeds 15 --first 51101`: **1 of 90 runs broken**, `slowClick` (51101 3517 g1), under the
  5 % bar, so non-blocking (`critic/c69_landingFuzz.log`).
- `landingRows all`: 115 cases, 20,321 hours, 0 broken (`critic/c69_lrows_all.log`).
- `repulse` on 39071 and 39073: 0 broken.
- The track checker to its new end, 31 December 1991: 0 broken lines on 10 seeds (`critic/c69_track_*.log`).
  - The seeds: 1938, 37301/3, 38301/3, 39301/3, 41301 and the new 51301/3.
  - Each ends with 199 living nations and 3 wars.
- `heldAtEnd` on the new 51311 and 51313: 0 held lines at the 1991 end. 1938 (FRESH, stepped from 1938): 0 (`critic/c69_heldAtEnd_*.log`).
- `blocEnd 51521` (10 years): at most 1 bloc, 0 aid rows, 0 broken. `breakup 51523`: 0 broken.
  `workerDeterminism` 51059: `abce92cb` on every arm.

**The batch did what it claimed, on the critic's own cases:**
- R68-B1 is fixed (God Mode, below).
- R68-N1: 0 of 101 carrier rows name the striker as the target, across every probe's ticker.
- R68-N2: France takes Brazil's capital on 0 of 5 seeds (run 68: 4 of 5).
- R68-N3: the Normandy stage is now "The Normandy beachhead held: Cobra breaks out" on every day of its window.
- R68-N4: 22–23 of 51 Normandy cells are taken in the window, and the Allies lose less than the Germans.
- R68-N5: no war over 4:1 by realm on 15 seeds.
- R83's card works at desk and phone size, and each URL gives the same world on three loads.
- The replay plays to 1991 and the world goes on after it.

**New, non-blocking:**
- R69-N1: on the track's last hour, on every seed, Israel annexes Lebanon.
- R69-N3: the replay's names stop changing in 1971 for some states but not others (Egypt is still "United Arab
  Republic", Ceylon, Dahomey, Zaire as "Congo", Burma).
- R69-N4: the Soviet successors are bankrupt on 1 January 1992, and Tajikistan is a great power at the end on 37601.
- R69-N5: three-nation random worlds now go ten years without a war on half the seeds (19 → 5 wars on the same six
  seeds against run 68's commit).
- Small items (below).

## Scores

### Map visuals and readability: 8 → **7** (scored afresh)

**What I tested.**
- **The new map, 1976–92.** `c69_ev91.mjs` on the replay from 1976, 1983 and 1990 (after 999), at 300–20,000 m/px,
  each place hovered:
  - Kuwait on 3 August 1990 and 1 March 1991;
  - Berlin on 4 October 1990 ("Berlin · capital / Germany");
  - Moscow, Kiev, the Caucasus, Central Asia, the Baltic, Yugoslavia and the world on 27 December 1991;
  - Europe on 3 January 1992;
  - Cambodia 1979, Afghanistan and Iran 1980, the Falklands 1982, Grenada 1983, Chad 1986, Panama and Romania 1989.
  - The new states are labelled and flagged; the tooltips name them (`critic/c69_ev_1990_999.json`,
    `critic/shots/c69ev_1990_1992-01-03_europe_3000m.png`).
- **The title card and the year previews** (R83) at three sizes (`critic/shots/c69r83_1983_51283_1600x900_formset.png`,
  `critic/shots/c69r83_1983_51283_390x844_formset.png`).
- **R81i's one-line tags** on 39915, 7781, 41915 and the new 51915 at 250 m/px: the engaged formations tagged whole,
  the rest one line, none overlapping (`critic/shots/c69c_39915_inf_0250m.png`).
- **R82i:** the burst's ground under the units at 937 m/px.
  - God's H-bomb on Moscow, 51207: the stacks' counters read over the mark at 1, 5, 10 and 15 s
    (`critic/shots/c69b_51207_moscow_937m_strip.png`).
  - The AI's H-bomb on Mongolia, 1991 free 5151 (`critic/shots/c69an_y1991_5151_0_goto.png`).
- **R82h:** "Owned land (km²)" on the chart beside "Land held (km²)" in the Ranking
  (`critic/shots/c69hi_32019_charts.png`).

**Why 7, not 8** (the new nations of R80d; run 68's build has no 1991 map to compare):
- **R69-B4.** Russia (`#8f1d1d`) and Georgia (`#8b1a1a`) are ΔE 1.3 apart. On the page they read (143,29,29) against
  (139,26,26): Georgia is Russia's red with a border line through it
  (`critic/shots/c69ev_1990_1991-12-27_caucasus_1500m.png`). Kazakhstan and Uzbekistan are 8.5 apart; Ukraine and
  Moldova 10.2 (`critic/shots/c69ev_1990_1992-01-03_europe_3000m.png`). R80d's note says "their colours distinct".
- **R69-N3.** Egypt is "United Arab Republic" on the 1991 map's tooltip
  (`critic/shots/c69ev_1990_1991-12-27_world_20000m.png`), and Ceylon, Dahomey and Burma are named as in 1960.
- **R69-B1 on the map.** A free game from 1946 shows Japan hatched "Occupied by United States" three years on, at
  peace (`critic/shots/c69ev_1946_1949-01-02_japan_3000m.png`).

**What the bar needs back at 8:**
- `node critic/scripts/c69_ev91.mjs 1990 999 1991-12-27@caucasus:44:41.5:1500` shows Georgia in a colour ΔE ≥ 30 from
  Russia. The same holds for every pair of the 1991 map's land neighbours (a check like `tools/diag/chartBlues.ts`, on
  the map).
- The world tooltip at 30° E 30° N on 27 December 1991 reads Egypt.

### Diplomacy, war, alliance, puppet, revolt depth: 8 → **6** (scored afresh)

**What I tested.**
- Every checker above.
- `c69_free.ts` on ten games from built years.
- R82f's piles on 15 seeds.
- R82d's far conquests.
- The blocs after 1991 (`c69_afterTrack.ts` on seven seeds).
- `blocEnd` and `breakup` on new seeds.

**What works:**
- **R82f:** no war over 4:1 by realm at day 365 on run 68's ten seeds or the new five. The checker's nation count still
  shows ITA vs POR 1:5 on 39147 and GER vs ENG 2:10 on 51141. `pileSides` puts the latter at 2:5 by realm
  (`critic/c69_piles_p39.log`, `critic/c69_piles_p51.log`, `critic/c69_pileSides_51.log`).
- **R82d:**
  - France takes Brazil's capital on 0 of 5 seeds (`critic/c69_farc_0_a.log`; run 68: 4 of 5).
  - The first-60-day declarations over 6,000 km are 1 of 96 on 39821–39839 and 0 of 97 and 0 of 107 on 41821–41839
    and 51821–51839 (`critic/c69_firstdecl*.log`).
- **After 1991,** on 37601, 37603, 38601, 1938 and 51601 for 10 years:
  - NATO is whole (15/15) and the CIS holds 10/11;
  - 0 days with the leaders on opposite sides, and 0 aid rows (`critic/c69_atx_*.log`).

**Why 6, not 8:** three rules that a checker reports broken, R69-B1, R69-B2 and R69-B3. Each is old (shown on run 68's
commit for B1 and B2), on a surface no earlier run checked.
- **R69-B1:** a free game from 1946 keeps 19,728 cells held at peace for three years.
- **R69-B2:** bloc aid breaks the economy rule every month in a free Cold War game.
- **R69-B3:** a puppet made at the month's start pays that month's tribute.

Also: R69-N1, Lebanon annexed by Israel on the track's last hour on every seed.

**What the bar needs back at 8:**
- `c69_heldfree.ts 1946 51515 3`: 0 pairs held at peace by year 1.
- `c69_free.ts` on 1962 51513, 1975 51501, 1983 51505 and 1991 51507 (`free`, the scenario's options): 0 broken lines.
- `worldInvariants.ts 37009 1825`: 0 broken.
- `c69_endleb.ts 999`: no `NationAnnexed LEB ISR` on 31 December 1991.

### Emergent world dynamics: 8 → 8 (scored afresh)

**Evidence for 8:**
- **R82b, D-Day fought for** (`trackFronts` on 1938, 37701 and 38701):
  - 23, 23 and 22 of the 51 Normandy cells are taken in the window (run 68: 0);
  - the Allies lose 26k, 34k and 19k against the Germans' 45k, 58k and 53k (run 68: 140k against 26–39k).
  - On 24 July 234k Allied men stand against 24k Germans (`critic/c69_dday_1938.log`). The stages before 1944 are
    unchanged (the same lines as run 68).
- **The world after 1991 keeps changing.**
  - `c69_x_lateworld.mjs 1991 free 2001`: ten years at Max. Nations go from 171 to 147; there are war chips every
    half-year; India's realm grows to 9.6M km² (`critic/shots/c69lw_1991free_51991_19_world.png`).
  - On the track past 1991, 74–82 wars are declared in year 1 and 38–44 in year 2 (`critic/c69_atx_*.log`).
- **Twelve-year watches at Max,** 51941 plain and 51943 with heroes: wars every year, 59.7–60 fps, 0 frames over 500 ms
  (`critic/c69_lwplain_51941.json`, `critic/c69_lwhon_51943.json`).

**Not 9:**
- **R69-N5:** the three-nation random world on 51401–51406 has 5 wars in ten years at HEAD and 19 on run 68's commit
  (`critic/c69_few3_51.log` against `critic/c69_wt_few3_51.log`). Three of the six worlds see no war in ten years. On
  run 68's 39401–39406: 10 wars against 21 (`critic/c69_few3.log`, `critic/c68_few3.log`).
- **R69-N4:** the Soviet successors are bankrupt on day 1. Tajikistan disbands 31 formations and Kazakhstan 18, and
  Tajikistan is a great power at the end on 37601.
- **R69-N1:** Lebanon is annexed by Israel on the track's last hour.
- **Far conquests in the free 1975 game:** India takes Helsinki and Finland takes Karachi on 41165 (design objection).

### God Mode: 7 → **8** (scored afresh; moved up)

**R68-B1 fixed,** on run 68's own cases (same seeds as run 68 on `bfda9503`):
- **`c69_undo2.mjs 41211`, the nuke undone after 2 s:** 0 px differ from before (run 68: 7,028).
  - Revolt, nation and raze: 0.
  - City: 130 px, one city label (R69-N6) (`critic/c69_undo2_41211_pix.txt`).
- **`c69_loadruins.mjs 41203`:** shot 02 (loaded) against 04 (fresh) differ by 0 px (run 68: 2,519); the hashes are
  equal (149009271).
- **`c69_undo.mjs 41201 30`:** the map before and after Undo is identical. The 9,760 px differing are the God bar's
  "Undone" line and the selected tool (`critic/shots/c69u_41201_pair_00_04.png`).
- **New seeds:**
  - `c69_undo2 51211` (nuke 0 px);
  - `c69_loadruins 51203` (0 px);
  - `c69_undo 51209 90`.
- **Run 68's untried case:** `c69_loadscen.mjs 41203` and `51205`. A scenario exported at day 10 and loaded after an
  H-bomb on Berlin matches a fresh page by 0 px; against the nuked map it differs by 32,192 px.
- **On a late world:** `c69_undo2y.mjs 51231` (1983 free). Five tools are undone with the hash back.
  - City and raze: 0 px.
  - Revolt: 459 px; nation: 219 px.
  - Nuke: 8,447 px, all in the war-chip rows under the map (UI).
  - Evidence: `critic/shots/c69u2y_51231_diffs_crop.png`.
- **Run 68's God cases:** `q_god_tools 39919` and `k_breakthrough 39979` are SAME. The H-bomb and A-bomb of 39917 and
  51917 give their alerts and rows.
- **God from 1970:** a revolt ends the replay ("Free Saxony broke away from East Germany"; `critic/c69_hg70.json`).

**Not 9:** the city undo leaves a label missing (R69-N6), and the revolt and nation undos on the 1983 world differ by a
few hundred pixels.

### Editor and scenarios: 8 → 8 (scored afresh)

- `x_editor 32443`: painted, undone, redone, exported and loaded. It is SAME as run 68 but for the title card's text (the
  card's new name) (`critic/c69_xe_32443.json`).
- Save and load are bit-identical on 39937 and the new 51937 (`same: true`, `same2: true`).
- The scenario export loaded after a burst is clean (God Mode, above).
- The refused starts:
  - `x_badyear`, `x_badyearsave` and `x_badyear2` refuse as before;
  - the 404 of a start not built is shown as a warning (`critic/c69_bys.json`).
- `os2_scen` with run 26's standoff scenario (`critic/c26_critic_standoff.warsim-scenario`) is offered ("Critic
  standoff 8 … Start this scenario"); its second file, `c69_critic_standoff`, was not found by the probe (my path
  fault), so only the old file was tried.

**Not 9:** the editor's main Start is disabled while a file is chosen, which is right. But no line on the card says why
until the button is hovered (its `title`).

### Stats and history: 8 → 8 (scored afresh)

- **History on the year-20 save of 32019:** 3,050 events in the CSV, with the filters, CSV and JSON (`critic/c69_dl_32019.csv`).
- **The 1991 end:** "2906 of 2906 events" in 177 ms, the kinds list with "History ended" and "Nation born", and the
  charts in 1.5 s (`critic/c69_te91_1991.json`).
- **R82h:** "Owned land (km²)" against "Land held (km²)".
- **R68-N1 fixed:** 0 of 101 carrier rows name the striker (all probes' tickers).
- **The yearly starts** equal the deployed `years.json`: 54 of 54 years, hashes, counts and powers
  (`critic/c69_starts/years.json` against `critic/c69_deployed_years.json`).

**Not 9:**
- **R69-N3, the names in the rows:** "Tamil Tigers made peace with Ceylon" (1991), "Turkey declared war on United Arab
  Republic" (1991 free).
- **"Contras was annexed by Nicaragua":** a plural name with "was".

### UI/UX and polish: 8 → 8 (scored afresh)

- **R83a, the list:** "World history / 1938–1991" and "Random world / 1 January 1938".
  - The heading is "World, 1938" and "World, 1983"; the replay is "World history — Replay".
- **R83b, the free form at 1983, 1991, 1962, 1941 and 1975** (desk, 390 × 844 and 844 × 390): the seed and every option
  are offered.
  - The map size is disabled with its title and its note ("A later year's world is played at the size it was built.").
  - The URL carries `after`, `aggr`, `diplo`, `heroes` and `looping=0`, with no size.
  - Started three times from the same URL, each world is the same at its start and after 10 days. For example, 1991:
    `2227349040` and `3400508852` on all three loads (`critic/c69_r83_*.json`).
- **R82e:** the Normandy stage's Next line reads "The Normandy beachhead held: Cobra breaks out" on every day of the
  window (`node critic/scripts/c69_nextline.mjs critic/c69_st_normandyD.json`).
- **The phone:**
  - `h_phone` at 390 × 844 and 844 × 390: no clipping (`critic/c69_hp_*.json`);
  - the God tab at 390 × 844 is SAME as run 68.
- **`h_blank 120`:** 1,082 samples, 0 blank Next lines.
- Run 67's and 68's left-out suites (`suite`, `suite2`, `suiteB`): 0 page errors. Every probe exits 0 but three: `sbl
  39061` exits 1 by design when a battle is unseen (1 of 69, Naval); `c69_ev91`'s first run (the path fault); and
  `c69_g_editor 39921`, which stops at its 60-day wait (below).
- The relations graph (51939, desk and phone, a year on): every node named (`critic/shots/c69rg_51939_desk_d365.png`).

**Not 9:**
- **The heroes hint in a later year's free form** still says "a named land and sea unit for each of seven great powers".
  A 1983 or 1962 game gives 12 heroes to the six of 1938's powers still living, not to the seven listed on the card
  (`critic/c69_free_1962_51513_free.log`).
- **R69-N3's names.**

### Performance: 8 → 8 (scored afresh)

Run alone and last (`critic/scripts/c69_chainP_body.sh`, after every other job had ended; `critic/c69_pf.status`).
- **Tick, seed 99, 5 years:** mean 2.195 ms (run 68: 2.22), year 1's hash `401d6856`, the pin
  (`critic/c69_tick99.log`). **The replay, 1938h, 5 years:** mean 1.60 ms (run 68: 1.59) (`critic/c69_tick1938h.log`).
- **Frames on 7019's year-20 world, 3,000 to 30 m/px, both looks, three spots:** 51.5–60.2 fps measured by the probe,
  rAF 59.2–60.2, p95 17.7–18.4 ms, worst 111 ms (`critic/c69_pf_7019.json`). `lookFps`: forced 58.8–60 frames/s,
  a draw 0.7–2.5 ms (`critic/c69_lookfps.log`).
- **Individuals, 32111:** 14,212 figures at 28 m/px, 60 fps at x1 and Max, worst 67 ms (`critic/c69_xi.log`).
  **Touch:** 59.5–60.0 fps (`critic/c69_tm_touch.alone.log`).
- **Late worlds at Max** (1965–77, 1989–92, 1991–2001 free): 58.6–60.2 fps, max gap ≤ 167 ms. Long watches 51941 and
  51943: 59.5–60 fps, 0 frames over 500 ms.

**Not 9:** the probe's own fps at 120 and 30 m/px drops to 51.5–57 with three spots in a row (rAF holds 60), as run 68 (its mean at those zooms 55.4 against run 68's 56.0, `critic/c68_pf_7019.json`);
the 1991 world's 199 nations cost nothing visible, but the tick on a 1991 free game was not profiled.

### Stability: 8 → 8 (scored afresh)

- **The yearly starts equal the deployed site's:** 54 of 54.
- **workerDeterminism:** 32059 `b463fdf4`, 39059 `385ea6e2`, 41059 `ff49098c` and the new 51059 `abce92cb`, the same on
  every arm.
- **Save and load** bit-identical on 39937 and 51937. **Undo** gives the hash before the act on 1938 and 1983 worlds.
- **The same URL gives the same world:** three loads each of 1941, 1962, 1975 and 1991 free (UI).
- **Malta's 18** are identical to run 68's, line for line (`critic/c69_malta.log`).
- **The named landing cases** and nvtraces are identical to run 68's line for line. So are the diploInvariants of
  33501/3/5 and the worldInvariants of 36009/11.
- **Run 61's bulk sets** (due: the sim changed), against run 68 file by file (`critic/scripts/c69_bulkcmp.sh`):
  - 396 landing setups: 387 identical, 2 broken, both `slowClick` and both run 68's (27037 15101 g2, 30041 g1)
    (`critic/c69_liab_named_cmp.txt`);
  - 153 stuck returns: 153 identical (`critic/c69_sr_cmp.txt`);
  - 168 next voyages: 164 identical, the same 3 broken as run 68 (30041 3517 g1, 31157 3517 g1, 31175 3517 g1), each
    one `slowClick` (`landingInvariants.ts 31157 3517 120 31157 - 1`: "t1661's click of 366 not ashore after 14.3 days,
    its best way 7.3"; 31175: 18.1 days against 11.1)
    (`critic/c69_nv_cmp.txt`).
- **0 page errors** in every probe but the deliberate 404 of `x_badyear`.
- **The 20-year runs** complete: 7019 `9d7cc54f`, 32019 `012f7230`, 41019 `ae1f5283` and the new 51019 `580fa278`.
  Random 51021 (10 years) gives `357b894a`.

**Not 9:** R69-B1–B3 are rules, scored under diplomacy. Nothing here crashed or desynced.

### Semantic zoom to unit level (needs 8): 8 → 8 (scored afresh)

- **`z_zoom` 39911 and the new 51911, 6,000 to 3 m/px:** figures from 28 m/px (13,837 and 13,830) to 4,442 and 4,428
  at 3 m/px. 39911 is the same as run 68 but for one element count (`critic/c69_z_*.json`).
  - At 18 m/px (step 13 of 51911) every soldier is drawn, and the division tags are whole on the engaged
    (`critic/shots/c69z_51911_13.png`).
- **R81i:** the tags at a battle on four seeds (Map visuals).
- **The late stages:** Vietnam 1968 from 4,000 to 25 m/px (`critic/c69_vn_1968.json`).
- **Kuwait** at 600 m/px in 1990.

**Not 9:** nothing new beyond run 68's crowding at 250 m/px (ADR-1037).

### Naval warfare (needs 8): 8 → 8 (scored afresh)

- **landingFuzz:** 1 of 90 on the new seeds 51101–51129 breaks, one `slowClick` (51101 3517 g1: t1505's click of 367
  not ashore after 13.8 days, its best way 6.7). That is under the 5 % bar, so non-blocking.
- **`landingRows all`:** 0 broken. **`repulse` 39071/39073:** 0 broken.
- **The named landing cases:** identical to run 68, the same `slowClick` breaks. Malta's 18 are identical.
- **Sea battles:**
  - 39061: 69 battles, 68 seen at their cameras. The one not seen is t7308, JAP v FRA in the Skagerrak, with the
    camera 10 cells off (`critic/c69_sbl_39061.log`).
  - 32061: 48; 32063r: 48; 41061: 64; the new 51061: 58 and 51063r: 58 (`critic/c69_sb_*.log`).
- **Run 61's bulk sets:** 387 of 396 landing setups, 153 of 153 stuck returns and 164 of 168 next voyages are
  identical to run 68. The breaks are the same `slowClick` ones (Stability).

**Not 9:**
- The zero-ship "battles" are still there (old): 8 on 39061 and 5 on 32061.
- One battle of 69 is not seen at its camera.

### Tanks (needs 8): 8 → 8 (scored afresh)

- **`c_battle` 39915, 7781, 41915 and the new 51915:** the armoured and motorised divisions at the Polish line on day 5.
  - On 51915 there are 12,154 individual figures at 25 m/px (`critic/c69_c_51915.json`).
  - 39915 is SAME as run 68.
- **`k_breakthrough` 39979:** SAME, 34 engaged in 7 days. The new 51979: 2, 13 and 28 engaged on days 1, 3 and 7.

**Not 9:** nothing new to see of armour after 1945. The late techs (composite armour) are stat changes no panel shows
in a battle.

### Aircraft (needs 8): 8 → 8 (scored afresh)

- **`w_wing`** on 39927, 35127, 41927 and the new 51927: the followed wing's mark is a median of 0 px from its sorties
  at 250 and 3,000 m/px (`critic/c69_w_*.json`).
- **`pl_planes`** 39925 and 51925: sorties found at hour 2.
- **The air war in the 1991 end's rows:** "Yugoslavia's air force struck Croatia this month".

**Not 9:** the p90 at 250 m/px is still 542–675 px, in samples where other sorties of the same nation are near (as run
68).

### AI nuclear use (needs 8): 8 → 8 (scored afresh)

- **An AI's burst on the page,** in a free game from 1991 (after 5151) on 11 November 1991: "People's China struck
  Mongolia with a hydrogen bomb near Olgiy: 1,000 civilians killed; 55,681 men, 218 guns and 123 tanks lost".
  - The alert has "Go to" (`critic/shots/c69an_y1991_5151_0_alert.png`).
  - At 937 m/px after Go to, the struck stacks' counters read over the mark (R82i)
    (`critic/shots/c69an_y1991_5151_0_goto.png`).
- **R82g's answer holds on a new seed:** `nukeIntercepts 51501` over 22 years has 24 launches and 19 bombers, with 13
  stopped against 10.15 expected (`critic/c69_nukeIntercepts_51501.log`).
- **Detonations over 22 years of plain 1938:** 37501/3/7: 3, 0 and 4; 39501: 2, with 1 interception (another world;
  the pin moved) (`critic/c69_nc/*.log`).
- **The arsenals:** at the 1991 end the five nuclear powers are USA, SOV (Russia), ENG, FRA and CCP (`critic/c69_atx_*.log`).

**Not 9:**
- **The 1991 strike near Olgiy hits a stack** whose flags read as People's China's own beside the border; whose men the
  55,681 are is not shown. A lead, not a fault shown.
- **No AI strike** on 7019's year-20 world in 400 days, so run 68's page case of 1958 is gone (another world).

## Blocking issues

### R69-B1 (diplomacy; old, R68b's free start): a game played free from 1946–1971 keeps the occupations held at peace, for years

- **The checker's line.** `c69_free.ts 1946 51515 730 free diplomacy=random`, on day 1:
  - "held: ENG on ICE, 1029 cells at peace";
  - "SOV on CHI, 6840"; "SOV on JAP, 734"; "SOV on AUT, 114"; "USA on AUT, 70"; "SOV on HUN, 407"; "FRA on AUT, 75";
    "ENG on AUT, 128"; "USA on JAP, 1752"; "SOV on IRN, 1516"; "ENG on IRN, 1985"; "ENG on ITA, 6688"
  - (`critic/c69_free_1946_51515_free.log`).
  - `c69_free.ts 1962 51513 730 free heroes=on`: "held: USA on JAP, 6 cells at peace" (Okinawa)
    (`critic/c69_free_1962_51513_free.log`).
- **It lasts** (`c69_heldfree.ts <year> <after> 3`, the scenario's options):
  - **1946 51515:** 12 pairs and 21,338 cells at hour 1; 11 pairs and 19,728 cells after three years.
  - **1954 51525:** 5 pairs and 393 cells. Austria's four go within a year; Okinawa's 6 cells stay three years.
  - **1962 51513:** 6 cells for three years.
  - Logs: `critic/c69_heldfree_1946.log`, `critic/c69_heldfree_1954.log`, `critic/c69_heldfree_1962.log`.
- **On the page:** a 1946 free game three years on, on 2 January 1949. Japan is hatched over its whole land, with the
  tooltip "Japan · Occupied by United States". Northern Korea and Manchuria read "China · Occupied by Soviet Union"
  (`critic/shots/c69ev_1946_1949-01-02_japan_3000m.png`, `critic/c69_ev_1946_51515_free.json`).
- **Old:** run 68's commit with its own 1946 start gives the same 12 pairs and 21,338 cells at hour 1, and 5 pairs and
  16,958 cells after three years (`critic/c69_wt_heldfree_1946.log`).
  - No earlier critic ran the checkers on a game left free mid-track.
  - R80l (ADR-1056) cleared `held` for the track's 1991 end only, through the timeline's returns. `leaveTrack` at an
    earlier year has no such returns.
- **Why blocking:** a rule checker reports it broken (CRITIC_PROMPT: every rule a checker reports broken but
  `slowClick` is blocking). On the map, a free game from 1946–49 has the occupied land of Japan, China and Iran drawn
  as occupied for years, with the holders at peace with the owners.
- **Fix:** when the track is left, the occupations it excused (the timeline's `occupy` still standing) either:
  - go back to their owners; or
  - become a rule a checker knows: an occupation zone with its own end, drawn and named as such.
- **Seen fixed when:**
  - `npx tsx critic/scripts/c69_heldfree.ts 1946 51515 3` shows 0 pairs by year 1, or every pair named by a rule the
    checker reads;
  - `c69_free.ts 1962 51513 730 free heroes=on` shows no `held` line.

### R69-B2 (diplomacy, rules that agree; old, R67e): bloc aid breaks `worldInvariants`' economy rule in every free game from a Cold War year

- **The checker's lines.** In `c69_free.ts` at a month's start, nations' gold rises by about 130–430 against an income
  and tribute of 0.4–118. Free games with the scenario's diplomacy:
  - 1962 51513: 17 lines;
  - 1975 51501: 13;
  - 1983 51505: 12; 1983 51517: 5;
  - 1991 51507: 21.
  - Examples: "1975 free after 51501 day 13604: economy: FIN's gold rose 299.76 at a month's start, more than its
    income and tribute (56.57)"; "ALB's gold rose 278.46 … (1.99)" (`critic/c69_free_*_free.log`).
- **The cause, shown.** In `c69_aidcheck.ts 1975 51501 150`, 5 of 5 rises over 1.5 × income + 50 come in the hour the
  nation gets a `BlocAid` row (USA>FIN, USA>YUG, SOV>EGY) (`critic/c69_aidcheck_1975_51501.log`).
  - `blocAid` (`src/sim/ai/strategic.ts:661`) moves 5 % of the bloc leader's income to the aided at the month's start.
  - The economy rule (`tests/helpers/worldInvariants.ts:163`) allows only income and tribute.
  - With random diplomacy (no blocs), or on the track past 1991 (one bloc), the same checker gives 0 lines.
- **Old:** run 68's commit gives 6 of 6 rises aided (`critic/c69_wt_aidcheck_1975.log`). Aid has existed since R67e
  (ADR-990). No checker run has covered a free game with two blocs.
- **Why blocking:** a rule checker reports it broken. Two rules disagree: aid as ADR-990 states it, and the economy rule
  as the checker states it.
- **Fix:** the economy rule counts the month's aid (the `BlocAid` rows of the hour, `AID_SHARE` of the giver's
  income), or aid is paid as something the checker reads. Then run the checkers on free games from a Cold War year as
  part of the gate's sweep.
- **Seen fixed when:** `c69_free.ts 1975 51501 730 free -` and `1991 51507 1825 free -` show 0 economy lines.

### R69-B3 (diplomacy; named seed 37009, old rule): a puppet made in the month's start hour pays that month's tribute

- **The case:** `npx tsx tools/diag/worldInvariants.ts 37009 1825` shows "37009 scenario day 1430: economy: FRA's gold
  rose 644.68 at a month's start, more than its income and tribute (182.25)" (`critic/c69_wi_37009.log`). Run 68's run
  of the same seed had 0, but in another world (the pin moved).
- **The hour,** from `c69_goldjump.ts 37009 1430 FRA` (`critic/c69_goldjump_37009.log`):
  - On 1 December 1941 at 01:00, France makes peace with Germany and makes it a puppet (`PeaceSigned FRA GER`,
    `PuppetCreated GER FRA`).
  - In the same hour France's gold rises from 1,107.77 to 1,752.45: Germany's tribute (its income 3,293).
  - Germany was not France's puppet in the month it pays for. The checker counts the tribute of the puppets held at
    the month's start.
- **Why blocking:** a rule checker reports it broken on a named seed of the last report.
- **Fix:** a puppet made in the month's start hour pays from the next month, or the peace pass runs after the
  payment.
- **Seen fixed when:** `worldInvariants.ts 37009 1825` shows 0 broken.

### R69-B4 (map visuals; new with R80d): successor states drawn in their parent's colour, against R80d's claim

- **The claim:** ROADMAP R80d, "their colours distinct"; DECISIONS (R80d's ADR): "Colours distinct from every other
  nation's".
- **The case:** Russia `#8f1d1d` and Georgia `#8b1a1a` are ΔE 1.3 apart (from `data/scenarios/1938h/nations.json`). On
  the page, 27 December 1991 at 1,500 m/px, they read (143,29,29) against (139,26,26): Georgia is Russia's red with a
  border line through it (`critic/shots/c69ev_1990_1991-12-27_caucasus_1500m.png`, `node critic/scripts/c69_ev91.mjs
  1990 999 1991-12-27@caucasus:44:41.5:1500`). Also Kazakhstan and Uzbekistan 8.5, Ukraine and Moldova 10.2, Russia
  and Transnistria 14.3 (`critic/shots/c69ev_1990_1992-01-03_europe_3000m.png`).
- **Why blocking:** it contradicts a claimed feature, on the map's newest land.
- **Fix:** new colours for the successors, checked against their land neighbours.
- **Seen fixed when:** every pair of land neighbours on the 1991 map is ΔE ≥ 30 apart, Georgia and Russia first.

## Non-blocking issues (prioritised)

1. **R69-N1 (diplomacy, emergent; new with R80's end): the track's last hour annexes Lebanon to Israel, on every seed.**
   - `c69_endleb.ts` from the 1991 start, after 999, 5151, 6161 and 31337 (`critic/c69_endleb_*.log`). At
     1991-12-31T00, the hour of `TrackEnded`, every seed has `PeaceSigned ISR LEB`, `NationAnnexed LEB ISR` and
     `NationEliminated LEB`.
   - On the page: "31 December 1991 Lebanon was annexed by Israel" (`critic/shots/c69te91_1991_end.png`).
   - The timeline holds Israel's 1982 war on Lebanon frozen "until 2000-05-24". The end lifts the hold, and the war's
     score makes the peace an annexation in the same hour. In a 1983 free game the same happens on day 5 ("Israel
     captured Lebanon's capital", then "Lebanon was annexed by Israel"; `critic/c69_r83_1983_51283_1600x900.json`).
   - **Fix:** the end makes the frozen wars' peace white (or the track's last events end them), as R80l made the
     held land go back.
   - **Seen fixed when:** `c69_endleb.ts 999` shows no `NationAnnexed LEB ISR` in the first week.
2. **R69-N3 (map, stats; old in the replay): names frozen while others change.**
   - Egypt is "United Arab Republic" from 1958 to 1991 (Egypt dropped the name in 1971). The timeline has
     `rename … as UAR` on 1958-02-01 and no rename back.
   - Ceylon (Sri Lanka from 1972), Dahomey (Benin from 1975), "Congo" for Zaire (1971–97) and Burma (Myanmar from 1989)
     are also unrenamed. Meanwhile Upper Volta becomes Burkina Faso, Rhodesia Zimbabwe, and the Soviet Union Russia.
   - Evidence:
     - the world tooltip on 27 December 1991 (`critic/shots/c69ev_1990_1991-12-27_world_20000m.png`);
     - "Tamil Tigers made peace with Ceylon" (`critic/c69_te91_1991.json`);
     - the Relations list of 1992.
   - **Seen fixed when:** the 1991 map's tooltip at 30° E 30° N reads Egypt, and the 1992 Relations list has Sri Lanka,
     Benin, Zaire and Myanmar.
3. **R69-N4 (emergent; R80c): the Soviet successors are bankrupt on their first New Year.**
   - On 1 January 1992: "Kazakhstan could not pay its army and disbanded formations: 18"; "Tajikistan … 31";
     "Lithuania … 2"; "Estonia … 1" (`critic/c69_te91_1991.json`).
   - At the end on 37601, Tajikistan is among the great powers (`critic/c69_atx_37601.log`); ADR-1054 saw Belarus.
     `forces: true` hands a republic the Soviet army on its soil without the purse to keep it.
4. **R69-N5 (emergent; between `bfda9503` and HEAD): three-nation worlds go quiet.**
   - `fewNationWars 3 51401 6 10` gives 5 wars in ten years over six worlds, and 3 worlds with none. Run 68's commit
     gives 19 (`critic/c69_few3_51.log` against `critic/c69_wt_few3_51.log`).
   - On 39401–39406: 10 wars against run 68's 21 (`critic/c69_few3.log`, `critic/c68_few3.log`).
   - The cause is not isolated: a bisect needed a checkout the critic's hook refuses. R82d's and R82f's changes to
     `strategic.ts` are the candidates.
   - **Seen fixed when:** `fewNationWars 3 51401 6 10` has a war on at least 5 of 6 seeds, as run 68's commit does.
5. **R69-N6 (God Mode; small): undoing "Found city" leaves a city's label missing.** Warsaw's name is gone after the
   undo of a city founded near it, while the hash is back (`critic/shots/c69u2_41211_city_0before_crop.png` against
   `critic/shots/c69u2_41211_city_2undone_crop.png`; 130 px).
6. **Small:**
   - **`slowClick` (ADR-914; non-blocking, 1 of 90):** landingFuzz 51101 3517 g1: t1505's click of 367 not ashore after
     13.8 days, its best way 6.7. The named ones are as run 68.
   - **The heroes hint in a later year's free form** says "seven great powers" (UI).
   - **"Contras was annexed by Nicaragua",** "FMLN was annexed by Honduras": "was" with a plural name, and the FMLN
     annexed by El Salvador's neighbour in a 1991 free game (`critic/c69_rc_1991_free_390x844.json`).
   - **Sea battles:** 1 of 69 not seen at its camera (t7308 JAP v FRA, Skagerrak, 39061). The zero-ship battles are
     still there (old).
   - **Kuwait on 3 August 1990,** the day after Iraq declares war, is still Kuwait's at 600 m/px (historically taken in
     two days) (`critic/c69_ev_1990_999.json`).
   - **Probe faults, not the game's:** the four disclosed at the top.

## Run 68's cases re-run

| Run 68 case | Run 68 (`bfda9503`) | Run 69 (`e5b97c8e`) | Evidence |
|---|---|---|---|
| R68-B1 `c68_undo2.mjs 41211` nuke | 7,028 px | **fixed**: 0 px (revolt, nation, raze 0; city 130, R69-N6) | `critic/c69_undo2_41211_pix.txt` |
| R68-B1 `c68_loadruins.mjs 41203` 02 vs 04 | 2,519 px scar | **fixed**: 0 px, hash 149009271 both | `critic/c69_loadruins_41203.json` |
| R68-B1 `c68_undo.mjs 41201 30` | scar at 937 and 150 m/px, 48 h on | **fixed**: map identical, hash back | `critic/shots/c69u_41201_pair_00_04.png` |
| R68-B1 untried: a scenario loaded after a burst | not tried | clean, 0 px (41203, 51205) | `critic/c69_loadscen_*.json` |
| R68-N1 carrier row on its own nation | 1 seen | **fixed**: 0 of 101 rows | all `critic/c69_*.json` tickers |
| R68-N2 `farConquests 0` France takes Brazil | 4 of 5 | **fixed**: 0 of 5 (and 0 of 5 on 51161–51169) | `critic/c69_farc_0_*.log` |
| R68-N2 `firstdecl 60` over 6,000 km | 2 of 96; 3 on 41821 | 1 of 96; 0 of 97; 0 of 107 (51821) | `critic/c69_firstdecl*.log` |
| R68-N3 `nextline` Normandy | D-Day named 2–25 July | **fixed**: "The Normandy beachhead held: Cobra breaks out" | `critic/c69_st_normandyD.json` |
| R68-N4 `trackFronts` Normandy | 0 of 51 cells; Allies lose 140k vs 26–39k | **fixed**: 22–23 of 51; 19–34k vs 45–58k | `critic/c69_tf_*.log` |
| R68-N4 `dday 1938` 24 July | 97.0k Allied vs 16.7k | 234k vs 24.2k | `critic/c69_dday_1938.log` |
| R68-N5 `piles 365` 39139–47 | ITA vs POR 1:5 | ITA vs POR 1:5 by nations, under 4:1 by realm (ADR-1042) | `critic/c69_piles_p39.log` |
| R68-N5 `piles 365` 41139–47 | GER vs NED 2:13 on 41143 | **fixed**: none over 4:1 against a declarer; GER vs NED 3:10 on 41145 | `critic/c69_piles_p41.log` |
| R68 slowClick 41101 15101 g2 and bulk 27037 | broken | the named cases identical to run 68 (the same `slowClick` lines); 27037 15101 g2 still `slowClick` (t2198's click of 277, 8.2 days against 1.2) | `critic/c69_li/named_27037_15101_g2_od-.log` |
| Flags at 250 m/px 39915 | told apart | SAME json; one-line tags (R81i) | `critic/shots/c69c_39915_inf_0250m.png` |
| Bursts 41205 Paris, 41207 London | ring and dot to ~18 s | SAME json; counters over the mark | `critic/c69_burst_*.json` |
| `w_wing` 39927, 35127, 41927 | median 0 | median 0 (and 51927) | `critic/c69_w_*.json` |
| Relations graph 39939, 39931, 41939 | all named | all named (and 51939 desk, phone) | `critic/shots/c69rg_*` |
| Land ranking 1942 (uranus) | Germany 11th | Germany in the top 15 | `critic/shots/c69st_uranus_d1.png` |
| `freeburst` × 5151, 6161 | 1938-left = plain | the same; 1983 and 1991 added: 61–75 wars in year 1 | `critic/c69_fb_*.log` |
| `farlands` 7019, 39811, 39813 | no US landing | the same; ENG and ITA land far | `critic/c69_farlands_*.log` |
| `endhours` 1975 (999/5151/6161/31337) | the 1975 end | not compared (1975 is mid-track now); the 1991 end: no war declared in the end hours, the CIS joins | `critic/c69_endhours91_*.log` |
| `traits 1975`, `landof 1975` | — | SAME | `critic/c69_traits.log` |
| `air69`, `nukes75 6161` | raids on Vietnam 2,108 | 1,206 (the replay moved with ADR-1055/1056); no launch | `critic/c69_air69.log` |
| `fewNationWars 3` 39401 | 21 wars | **10 wars** (R69-N5) | `critic/c69_few3.log` |
| afterTrack (37601/3, 38601, 1938) | after 1975 | after 1991: NATO 15/15, CIS 10/11, 0 days opposed | `critic/c69_atx_*.log` |
| Named landing ×12, nvtraces ×2, diploInv 33501/3/5, worldInv 36009/11 | — | identical line for line | `critic/c69_li_*.log` |
| Malta's 18 (due) | 18 not taken | identical | `critic/c69_malta.log` |
| Run 61's bulk sets (due) | 279/396, 152/153, 128/168 identical to run 67 | 387/396, 153/153, 164/168 identical to run 68; the same breaks (landings 2 `slowClick`, voyages 3) | `critic/c69_*_cmp.txt` |
| workerDeterminism 32059, 39059, 41059 | `847d48a7`, `740d6d44`, `49a669de` | `b463fdf4`, `385ea6e2`, `ff49098c` every arm (another world) | `critic/c69_wd_*.log` |
| 7019, 32019, 41019, 20 years | `f8dadd4b`, `f7225aa1`, `48d7bfa4` | `9d7cc54f`, `012f7230`, `ae1f5283` (the pin moved: ADR-1041, ADR-1042) | `critic/c69_seed*_save.log` |
| worldInvariants 37009 | 0 broken | **1 broken (R69-B3)**, another world | `critic/c69_wi_37009.log` |
| Run 68's left-out suites (`suite`, `suite2`, suite B, `x_trackend`, `x_stage`, `x_places`, `h_phone`, `x_vietnam`, `h_god70`, `x_lateworld`) | left out | all run, 0 page errors; exits as UI/UX says; `h_zoom` measured nothing (probe fault) | `critic/c69_suite*.log`, `critic/c69_pages.log` |
| Perf chain | tick 2.22, replay 1.59 | tick 2.195 (pin `401d6856`), replay 1.60; frames 58.8–60 forced | `critic/c69_pf.status` |

## Design objections (none blocking, no score lowered)

- **The free 1975 world's far conquests** (ADR-1033's re-scoped bar). It is met: 9.2–9.4 far capitals per 100
  nations, against plain 1938's 9.4–9.8 (`critic/c69_farc_*.log`). Britain no longer takes Beijing. Instead:
  - India takes Helsinki on day 500, and Finland takes Karachi on day 382, through a defensive pact, 5,000 km from home
    (41165).
  - The Soviet Union goes to war with People's China on 4 of 10 seeds, and Mongolia takes Beijing.
  - A Cold War card that promises proxy wars delivers Indian armies in Finland.
- **R82f counted by realm** (ADR-1042, the user's choice (a)). The checker is green. But a war of 1 nation against 5
  (ITA vs POR on 39147) or 2 against 10 (GER vs ENG on 51141) still stands at day 365, because colonies count with their
  rulers.
- **Carried:**
  - Stalingrad's own stage is a handover (ADR-1018);
  - D-Day's ground still comes at its handover, though now fought for (ADR-1040);
  - Spain on the card of 1941–49 (ADR-1019).

## Ideas from other games (not scored)

- **Hearts of Iron IV's peace conference** returns occupied land by a choice the player sees. A free start from 1946
  could open such a screen for the standing occupations (R69-B1) rather than leave them hatched for ever.
- **Europa Universalis' country colours** are checked against the neighbours when a nation is released. A successor
  state whose colour is the parent's is told apart by a tint (R69-B4).

## Strengths (verified)

- **The batch fixed every case run 68 named,** on run 68's own probes:
  - the undone burst's scar, 7,028 → 0 px;
  - France's Brazil, 4 → 0 of 5;
  - D-Day's ground, 0 → 22–23 of 51 cells, and the Allied loss under the German;
  - the carrier row, 0 of 101 self-named;
  - the Next line;
  - the chart's names.
- **Fifty-four years of history replay without a broken line** on ten seeds, to the last day of 1991. The world after
  it plays on at 60 fps for ten years. The 54 yearly starts equal the deployed site's by hash, and each free start's
  URL gives the same world on every load.
