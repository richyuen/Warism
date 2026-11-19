# Critic report, run 79 (full): Batch 46 (R163 to R166) and the whole brief, on `79058a5a`

## The run

- **Mode: full.** The spawning message asks for a full run (CRITIC_PROMPT, ADR-915, ADR-916).
  - Run 78 (focused, on `d7b981dd`) had no blocking issue and every score at its bar. Every dimension is scored afresh
    here.
- **Commit judged:** `79058a5acedb876c3d68a8893f57431bcbf7cf0c`, HEAD at the start (`critic/c79_commit.txt`).
- **Time:** 18:21 to 20:22 by the machine's clock. A full run is not bounded.
- **Left out:** no dimension. Of run 78's left-outs, all were run (`heroPop`, `markerPop`, `markers`, `seaBattlesLook`,
  `seaclick`, the 1280 × 720 and 844 × 390 monkeys, five-minute monkeys, `bannerOwn 1942`, `massSeen 56211`).
  - Not run: run 61's bulk landing sets and Malta's 18. They are "plain 1938 unchanged, carried" (ADR-959, below).
  - Not tested: a nation that died and came back, on the time-lapse (R165). I did not look for one.

### What changed since run 78

- **Size:** 9 commits (one of them run 78's report). Outside `critic/` and the documents: 12 files (9 under `src/` and
  `data/`, and 3 tests).
  - `git diff --stat d7b981dd HEAD -- src/sim data public/data` lists one file, `data/scenarios/1938h/timeline.json`
    (one note: "Rome" became "Rome falls to the Allies").
  - `src/`: `App.tsx`, `style.css`, `shared/history.ts`, `MapTooltip.tsx`, `TimeLapseBar.tsx`, `historyText.ts`,
    `i18n/en.json`, `worker/historyRows.ts`.
- **Batch 46:**
  - **R163, ADR-1132** (R78-N2): R147 pooled on twelve seeds; the attacker bar at 13.2 %. No code change.
  - **R164** (R78-N1): track rows name the alliance joined, start with a capital, keep a note with a semicolon whole;
    Rome's note rewritten.
  - **R165** (run 78's time-lapse items): the tooltip says "Gone by now: nothing to select" over a nation dead now; at
    the first month the "from" label is hidden.
  - **R166** (run 78's small item): opened war banners each their own height.

### Carry checks (ADR-959)

- **Plain 1938 is unchanged:** the two 20-year saves end at run 78's hashes.
  - 7019: `ab927e1b`, 78 nations (`critic/c79_seed7019_save.log`).
  - 32019: `c3520016`, 76 nations (`critic/c79_seed32019_save.log`).
  - The heroes' 7019 run ends at run 77's `a980a729` (`critic/c79_hero_7019_20.log`).
  - The diff touches nothing under `src/sim/`.
- So run 61's bulk landing sets and Malta are "plain 1938 unchanged, carried". Every other set of run 78 was run again.

### Setup

- **Builds:**
  - HEAD in `critic/c79_dist`, with the replay's 54 starts built from HEAD (`npm run saves`, 560 s, exit 0;
    `critic/scripts/c79_build.sh`). Served on 127.0.0.1:5391.
  - Run 78's build (`critic/c78_dist`, `d7b981dd`) on 5392, for the batch's own cases beside HEAD.
- **Browser:** Playwright Chromium on the GPU, at 1600 × 900, 1400 × 800, 1024 × 768, 1920 × 1080, 2560 × 1440,
  1280 × 720, 390 × 844, 844 × 390, and 3840 × 2160 for the frames.
- **New seed family:** 64xxx.
  - Disclosed: my `warOpening` seeds 64211, 64213 and 64215 turned out to be one of ADR-1132's own sets
    (`.cache/r160/on_64211.json`). My run repeats the builder's figures exactly. It confirms them, but it adds no new
    seed to the pool.
- **Scripts:**
  - Headless: `c79_runNamed.sh` runs `c79_jobsAll.txt` (60 cases, then `landingFuzz` from 64101).
  - Replay starts: `c79_chainS.sh` runs `c79_startsJobs.txt` (run 78's 40 cases and 5 new ones), then `c79_jobsB.txt`
    (run 78's named headless cases).
  - Page lanes: `c79_laneA.sh` (the batch, UI, stats), `c79_laneB.sh` and `c79_laneC.sh` (run 75's whole page suite on
    new seeds), `c79_laneD.sh` (look, zoom, monkeys, sea battles).
  - Performance: `c79_chainPerf.sh`, alone, last.
  - Every page probe was copied as `c79_<name>.mjs` from its newest version, its output names made `c79`
    (`c79_mkprobes.sh`). Run 78's outputs, the comparison baseline, are untouched.
  - New probes: `c79_liftTrace.ts` (R79-B1), `c79_glWarn.mjs`, `c79_glSpot.mjs` and `c79_lookW.mjs` (R79-N2),
    `c79_rw2.mjs`, `c79_trackTexts.ts`.
  - Extended: `c79_tlDead.mjs` (STEP, the "gone" note, the "from" label's visibility) and `c79_deathTitle.mjs` (each
    banner's box, cut text, lines).
- **Probe failures of mine, and three items unjudged since run 77, settled:**
  - **`x_continue`, `h_continue` (the title's Continue):** they stood since run 77 because Settings > Main menu now asks
    to confirm (`settings-menu-yes`). Probe fault. Mended, both are whole:
    - 64415: continued at tick 960, the hash of the game left, "Playing Germany" in the corner. Sixty days later it is
      the unbroken game's hash (`critic/c79_xc_64415_GER.json`, `critic/shots/c79xc_64415_continued.png`).
    - The replay: the same, with the track's "Next" line kept (`critic/c79_h_continue.mend_400_120.log`).
  - **`rw_random`:** its war selector (`war-chip`) is stale, so it read no wars. Mended as `c79_rw2.mjs`. The random
    world runs two years on the page with 60 nations, 4 to 15 wars and 0 errors (`critic/c79_rw2_64965.json`).
  - **`dirHand`'s History act on a phone:** the probe is not at fault. History opens under the nation panel the act
    before opened. Filed as R79-N3.
  - `x_editor` with MAINSTART: the title's Start is disabled while a scenario file is chosen. Run 75 judged this as
    designed; so do I.

### At the end

- Both preview servers (5391, 5392) were stopped by the process ids that held their ports. No probe, sim, browser or
  monitor of mine is left. No worktree. A `vite preview` on port 4174, not mine, was left running.
- After the performance chain, three short page probes and one headless check were run alone: `c79_liftJump.ts`,
  `c79_xcRow.mjs` and `c79_ownFirst.mjs`.
  - The last two looked into whether the played nation's war is first on the banner row after Continue. It is: Germany
    is in "Italy & 2 ⚔ Austria & 3" (`critic/c79_ownFirst_64415_w.log`). No finding.
  - A small one, though: the banner hides the played nation behind "& 2".
- `git status` shows nothing new outside `critic/`. The eight untracked PNGs under `docs/evidence/7.132/` were there
  before.
- **Writes outside `critic/` by tools at their defaults:** `npm run sim` to `.cache/runs/`, and `landingFuzz` to
  `.cache/landingFuzz/79058a5a-64101`.

## Verdict

**One blocking issue: R79-B1.** `diploInvariants 64015 random 1825 --heroes` breaks `lift`.
- On day 1411 Argentina declares war on #105 across the sea, with 16,294 men to lift for a room of 25,200.
- The AI's own gate refused it in every hour before:
  - `noLift(ARG, callSides(ARG, #105))` is true in each of the six hours before.
  - The sides `[[ARG],[#105]]` touch nowhere.
- So a door that does not ask the gate declared it. This is R76-B1 again, by another door.
- It is the only break in 17 checker runs on new seeds (10 `diploInvariants`, 7 `worldInvariants`); the 3 on earlier
  seeds are clean. The sim is the same as run 78's, so run 78's build gives the same.

**Every other checker run is clean:**
- `diploInvariants`: 0 broken on the other nine of 64001 to 64019 (1938, random diplomacy, heroes, the random world;
  two of ten years), and on run 76's and 78's 33501 and 63001.
- `worldInvariants`: 0 broken on 64051 to 64061, 64065 (ten years) and 63051.
- `landingFuzz --seeds 15 --first 64101`: **0 of 90** broken, `slowClick` included (`critic/c79_landingFuzz.log`).
- `landingRows all`: 115 cases, 20,321 hours, 0 broken, as in run 77 (`critic/c79_lrows_all.log`).
- `workerDeterminism`: 54059 ends at `ed05e7b5` on every arm, as in runs 76 and 77; 64059 at `a01d68d7`.
- `seaBattlesLook`: 51 of 51 and 35 of 35 battles seen.
- The replay's free starts: 0 broken lines in 13 runs (5 of them new seeds), and `blocend` 0 on 54611 and 64611.

**The batch is fixed on its own cases, with run 78's build beside it:**

| case | run 78's build | HEAD |
|---|---|---|
| R165: the tooltip on Sweden, January 1938 | "Sweden" | "Sweden / Gone by now: nothing to select" |
| R165: the "from" label at step 0 | visible | hidden; visible at January 1948 |
| R166: the neighbour of the death banner, opened, 1400 × 800 | 78 px tall | 31 px |
| R164: "Italy occupies Rome" | on the page (run 78's report) | "4 June 1944 Rome falls to the Allies" on the page |
| R164: "Romania joins the alliance" | no alliance named (run 78's report) | "Romania joins the Anti-Comintern Pact", through `trackText` with the key `historyRows` sends; not seen on the page |

**No score moves.** Every dimension is at 8, at or over its bar. With R79-B1 blocking, this run does not clear a
release (ADR-916).

## Scores

### Map visuals and readability: 8 → **8**

**What I tested:**
- `look` on new seeds:
  - 64901 at 1600 × 900, days 45, 180 and 400.
  - 64903 on a phone.
  - 64907 at 2560 × 1440, days 120 and 500.
  - Every tier, both looks.
- The opened banners at six sizes (R166).
- The time-lapse's map on two worlds.
- The random world after two years.

**Evidence for 8:**
- **The fronts read at every tier.** In February 1939 on 64901, at 3,000 m/px over Europe, there are hatched occupied
  France, arrows, named capitals and each army's men (`critic/shots/c79look_64901_1600x900_d400_3eur3000.png`).
  - At 100 m/px on the Franco-German front: the line's glow, named divisions, their men, the hatching
    (`critic/shots/c79look_64901_1600x900_d400_f0_100m.png`).
  - 0 page errors at desk and phone size (`critic/c79_look.64901_1600_900_45_180_400.log`,
    `critic/c79_look.64903_390_844_60_240_phone.log`).
- **R166:** opened, every banner without the death line is 31 px tall (27 on a phone) at 1400 × 800, 1600 × 900,
  1024 × 768, 1920 × 1080, 390 × 844 and 844 × 390. The death banner is 78 (68). There is no cut text and nothing off
  the screen (`critic/c79_dt_7019_400_*.json`, `critic/shots/c79dt_7019_400_1400x800_opened.png`).
  - Run 78's build at 1400 × 800: the neighbour is 78 px (`critic/c79_dt_c78build_7019_400_1400x800.json`).
- **The time-lapse's map and its tooltip** (see UI/UX): Sweden, Norway and Germany on 7019, Manchukuo and French Morocco
  on 32019, are each marked gone (`critic/shots/c79tld_390x844_smid_hover.png`).
- **The world over 12 years** (`long_watch2 64941`) is legible at the world's zoom to 1950
  (`critic/shots/c79lwhon_64941_y12_world.png`).

**Not 9:**
- **Heroes' names over Europe's counters at the world's zoom**, worst on a phone ("Maus", "Bismarck", "P.100 Ercole",
  "Sovetsky Soyuz", "Richelieu", "Roma" in one heap over France, `critic/shots/c79pt_64903_390x844_opened.png`). ADR-1111
  keeps this (Design objections).
- **A WebGL warning at 2560 × 1440** (R79-N2). Nothing was seen missing in the picture.
- **In the random world, banner text wraps mid-phrase** (R79-N1).

### Diplomacy, war, alliance, puppet, revolt depth: 8 → **8** (R79-B1 blocking)

**Evidence for 8:**
- **16 of 17 checker runs on new seeds are 0 broken** (above), and the 3 on earlier seeds.
- **Wars that open:** on `warOpening` 64211 to 64215, of 68 wars with a border, the attacker has no man near in 10
  (14.7 %; ADR-1094's bar 15 %) and the defender is ahead at day 30 in 10 (14.7 %) (`critic/c79_warOpening_64.log`).
  - This is ADR-1132's own set, and it repeats exactly.
  - R78-N2's case 57211 to 57215 repeats run 78 (sim unchanged): 8 of 64 (12.5 %), the defender ahead 20.3 %
    (`critic/c79_wo_57.log`).
  - ADR-1132's pooled 13.2 % stands. R78-N2 is settled as the builder's decision, for the user's review.
- **The first declarations:** 58 on ten seeds in 60 days, none over 6,000 km (`critic/c79_firstdecl_64.log`).
- **Piles:** at day 365, 2 of ten seeds have a war over 4:1, both Italy on Portugal at 1:5 realms (64139, 64149;
  `critic/c79_piles_*64.log`). Run 77 had 2 of 30. `pileSides` finds 0 of 63 declarations born over the bar: the pile
  grows after (`critic/c79_pileSides_64.log`).
- **Massings told:** 50 told, 43 followed by war, 6 given up, 3 called off with no rule broken
  (`critic/c79_massTold_64.log`). The three given up in silence were each at war with the target already. Run 77's 57613
  repeats run 77 line for line.
- **Few-nation worlds:** 2, 3 and 60 nations go to war and live (`critic/c79_few*_64.log`).
- **On the page:**
  - The peace button is enabled at +25 and refused with its reason at +0, at two sizes
    (`critic/c79_peacebtn.64217_*.log`).
  - Ten wars' buttons fit in a phone's panel (`critic/c79_manywars.*.log`).
  - The relations graph says each tie in words, at desk and phone size, with heroes and with random diplomacy
    (`critic/c79_rg_relations.*.log`).

**Under 9, and blocking:** R79-B1. A war declared across the sea with no lift, through a door the gate does not
guard, is the second such door after R76-B1.
- The score stays 8, as in run 76 with R76-B1: the break is one run of 17.
- The rule it breaks is the builder's own (ADR-1119).

### Emergent world dynamics: 8 → **8**

**Evidence for 8:**
- **Two 12-year watches on the page**, with and without heroes (`long_watch2 64941` and `64943`), 0 errors each
  (`critic/c79_long_watch2.*.log`). Wars stand on
  every continent through 1950, the map changes each year (`critic/shots/c79lwhon_64941_y*_world.png`).
  - By 1950 the Soviet Union fights Belgium & 7 and France & 3; China fights Siam.
- **No runaway:** `topArea 64097` over 25 years has the Soviet Union, the largest, at 16 to 23 % of the land. The second
  is the United States, Brazil or France at 7 to 14 % (`critic/c79_toparea_64097.log`).
- **Twenty years with heroes:** 80 nations live, 6 to 12 wars declared a year to the end (`critic/c79_hero_64019_20.log`).
- **The random world on the page:** 60 nations, 4 to 15 wars a month, one nation dead in two years
  (`critic/c79_rw2_64965.json`).
- **After the track** (`afterTrack` 55601, 37601, ten years): 207 and 222 wars declared, the same as run 78.

**Not 9:**
- Alliances join across the world for no reason a watcher can see: "Afghanistan joined the Balkan Entente" on
  13 January 1938 (`critic/c79_histgrep.64309_FRA_540_joined.log`).
- In the 1942 game left free, Finland, Switzerland and Sweden join a war on Siam within 30 days
  (`critic/c79_freewar_1942god.log`; the same since run 71).

### God Mode: 8 → **8**

**Evidence for 8:**
- **Strikes:** `a_god_nuke 64917` puts a hydrogen bomb on Paris and an atomic bomb on London. The alert names the toll,
  and the ring and cloud stand over Paris (`critic/shots/c79a_64917_14_paris_h_2h.png`).
- **Each tool works and each is undone:** `q_god_tools 64919` (Prague razed, told in the ticker), and `undo2 41211` /
  `undo2y 51231` undo all five tools (`critic/c79_undo2.41211.log`).
- **A breakthrough** is told in the ticker, in History, in the CSV and in the JSON export (`critic/c79_kwhist.64951.log`).
  `kw_breakthrough 64923` tells it in the ticker at once (`critic/c79_kw_breakthrough.64923.log`).
- **On the replay:**
  - `godpeace 1942 JAP` says what a God act does to the replay (`critic/c79_godpeace.1942_JAP_United_States.log`).
  - `god42 1942 64542`: 0 errors.
  - `takescore 1942 GER`: the player's wars are first on the row.
- **Forced war:** `fw2_forcewar 64935` breaks the bonds in its way.

**Not 9:** the strike's ring covers the city's own name ("Pari", `critic/shots/c79a_64917_14_paris_h_2h.png`).

### Editor and scenarios: 8 → **8**

**Evidence for 8:**
- **Paint, undo, redo, export and load:** `x_editor 64443` paints French cells German and undoes them. It exports the
  file and loads it from the title as painted (`critic/c79_x_editor.64443.log`).
- **Bad files are refused** with the Start gone (`critic/c79_x_badfiles.log`).
- **The standoff file** loads in 5.3 s (`critic/c79_os2_scen.*.log`). `g_editor 64921` runs 120 days with ten warheads
  given to Poland (`critic/c79_g_editor.64921.log`).
- **The replay's starts, built from HEAD:**
  - 13 free starts from 1942 to 1991, 0 broken lines each (`critic/c79_free_*_free.log`).
  - `saveload 1942`: the same hash after 30 days.
  - `capsurvey 1975`: 2 of 154, as in run 78.
  - Run 78's 1975 start loads on HEAD and plays the track to its end (`critic/c79_oldsave_1975.log`).
- **The page's own save:** saved and loaded twice, then the same hash 200 days on (`critic/c79_saveload_page.64937_200.log`).
- **Continue:** whole on both kinds of game (Setup above).
- **The stages:** `x_stage normandyD` and `stalin` run with the track's "Next" line and their notes
  (`critic/c79_x_stage.*.log`).

**Not 9:** the game is started from the title only by an exact path; a chosen file disables the title's own Start with a
sentence, not a choice.

### Stats and history: 8 → **8**

**Evidence for 8 (R164):**
- **On the page:**
  - "4 June 1944 Rome falls to the Allies" (`critic/shots/c79tr_1943_1600x900_Rome.png`).
  - "30 August 1940 The Second Vienna Award to Hungary", and "The First Vienna Award to Hungary"
    (`critic/c79tr_1940_1600x900.json`).
  - "Bagration and Lvov-Sandomierz; Romania: the Germans fall back" whole (`critic/c79tr_1944_1600x900.json`).
- **Through `trackText`, with the alliance's key as `historyRows` sends it** (`critic/c79_trackTexts2.log`):
  - "Romania joins the Anti-Comintern Pact", "Czechoslovakia joins the Eastern Bloc", "France joins the North Atlantic
    Treaty".
  - Bagration's row is not told as an occupation.
  - Run 78's own probe, which passes no alliance key, still prints "joins the alliance" nine times
    (`critic/c79_trackTexts_now.log`). That is the probe, not the game.
- **History itself:** on 32019 at year 20, 2,650 of 2,650 events, 29 kinds of filter, opened in 200 ms
  (`critic/c79_hist.32019_critic_c79_seed32019_y20.bin.log`). The CSV and JSON exports agree
  (`critic/c79_dl_export.*.log`).
- **R165's time-lapse plate** (UI/UX).

**Not 9 (R79-N4):**
- "Romania joins the Anti-Comintern Pact" (23 November 1940) sits under Hungary's row of three days before, "The
  Tripartite Pact: Hungary". The game names one pact for the other.
- Still bare: "Thailand's alliance with Japan", "The Sino-Soviet treaty", "Canada in NATO as since 1949".

### UI/UX and polish: 8 → **8**

**Evidence for 8:**
- **R165 on the time-lapse** (`c79_tlDead`, run 76's 7019 world, and HEAD's 32019 world):
  - At step 0, the middle month and on a phone, the tooltip names the dead nation and says "Gone by now: nothing to
    select". A click selects nothing.
  - Living nations are named without the note: Denmark (`critic/c79tld_1600x900_s0.json`, controlTips).
  - The "from" label is hidden at January 1938 and shown at January 1948. Resume closes the plate
    (`critic/c79tld_*_s*.json`).
  - Run 78's build: "Sweden" alone, the "from" label shown at step 0 (`critic/c79tld_c78build_1600x900_s0.json`).
- **The banners' row:**
  - `bannerRank 57901 150`: 11 quiet banner-days while a fought war was behind "+n" (run 78: 8, 20, 17; the bar under 44).
    On 64901: 8 (`critic/c79_bannerRank.*.log`).
  - `bannerFlip` 57901, 58901, 57903: 8, 4, 5 changes, and the banner under a resting cursor changed 1, 0, 2 times. This
    is run 78 to the figure (`critic/c79_bannerFlip.*.log`).
  - `bannerHourly 57901`: 3 changes in 480 hours, none back within three hours.
  - **After a load, with a war fought an hour before** (`bannerLoad 64901` at days 90, 120, 150, with and without a
    load): the row is the same, `lastBattle` is back after the load, and there are 0 changes in 72 hours
    (`critic/c79_bannerLoad.*.log`). This was untested in run 78.
- **Monkeys:** 0 page errors in 16 minutes, and the game was running at each end, neither hung nor left
  (`critic/c79_monkey.*.log`). The two touch monkeys left the game mostly paused (ticks 52 to 671, 360 to 1,606): they
  test the controls more than a running world.
  - 1600 × 900, 5 min, 1,957 acts; ticks 38 to 7,967.
  - 390 × 844 touch, 5 min.
  - 1280 × 720, 3 min.
  - 844 × 390 touch, 3 min.
- **Nine window sizes** in a running game: 0 chrome off the screen, the canvas the window's size
  (`critic/c79_resize.64821_60.log`).
- **The phone's layout:** 0 controls off the screen or clipped in 10 states (`critic/c79_p_phone..log`). The ticker
  stands clear of the opened banners (`critic/c79pt_64903_390x844.json`).
- **The rest of run 75's suite:** keys, the first cue, filters, the build menu, the mine and corridor marks, the
  interventions and the late worlds. All exited 0 with 0 page errors. `x_title` wrote its JSON and no log line
  (`critic/c79_x_title.json`). `nvpage 64213` found no next voyage to read, as run 75's 58213 did not.

**Not 9:**
- **R79-N1:** in the random world, banners wrap names and the "& 1" counts onto two lines ("Eastern / Cape",
  "Orientale & / 1") with room beside them (`critic/shots/c79rw2_random_64965_banners_crop.png`).
- **R79-N3:** on a phone, History opens under an open nation panel. Its rows with links are hidden behind it
  (`critic/shots/c79dh_59955_390x844_history.png`).
- **On a phone, three opened banners repeat the same death sentence** word for word ("Nationalist Spain fights to the
  death…", `critic/shots/c79pt_64903_390x844_opened.png`). Together the opened banners take 286 of 844 px.

### Performance: 8 → **8**

**What I measured** (`critic/scripts/c79_chainPerf.sh`, alone, after every lane; each step exit 0, `critic/c79_pf.status`).
Run 78 carried this dimension, so HEAD is set beside run 77's chain, the last one run:

| measure | run 77 (`7066d800`) | HEAD |
|---|---|---|
| seed 99, 5 years, the pin's game: mean tick, year 5 p95 | 1.809 ms; 4.06 ms (`ca4700f1`) | 1.818 ms; 4.02 ms (`ca4700f1`) |
| seed 99 with heroes, 5 years: mean tick; year 5 p95, max | 1.629 ms; 4.71, 220.5 ms | 1.617 ms; 4.65, 221.7 ms |
| frames on 7019's year-20 world, 1600 × 900, every tier, both looks: mean fps, p95, worst | 59.4 to 60.2; 18.2 ms; 131 ms | 59.6 to 60.1; 18.2 ms; 116 ms |
| the same at 2560 × 1440 | 59.7 to 60.2; 18.4; 122 | 59.5 to 60.1; 18.4; 126 |
| the same at 3840 × 2160 | 59.3 to 60.1; 19.5; 122 | 59.5 to 60.1; 19.1; 119 |
| the same, heroes' world | 59.3 to 60.2; 18.0; 128 | 59.4 to 60.1; 18.2; 118 |
| touch, ticks a second with a selection / without | 383 / 268 | 380 / 271 |
| a 12-year watch at Max, alone: a year's wall time; the longest gap between frames (seeds differ: not compared) | 17 to 34 s; 83 ms (58941) | 11 to 36 s; 83 ms (64945) |

Files: `critic/c79_tick99*.log`, `critic/c79_pf_lookfps*.log`, `critic/c79_lookfps.log`, `critic/c79_tm_touch.alone.log`,
`critic/c79_lw_64945_alone.log`.

**Evidence for 8:**
- Every figure is run 77's within noise. The sim is unchanged, and the batch's page changes (a tooltip line, a CSS rule)
  cost nothing measurable.
- 60 frames a second at every tier up to 4K, with a p95 of 18 to 19 ms.
- `lookFps` 7019: forced 58.8 to 60 fps at 3,000 and 1,200 m/px, a draw 2.0 to 3.3 ms (`critic/c79_lookfps.log`).
- The 20-year world plays a 240-month time-lapse (`critic/c79_tm_lapse20.log`).
- A year of the 20-year world runs in 15.8 s (run 78's save; run 77 loaded run 76's: not compared).

**Not 9:**
- The worst frame at 1,200 m/px in the classic look is still 108 to 126 ms at each size: one frame a run that a player
  sees as a hitch.
- With heroes, a 20-year game's tick reaches 3.2 to 3.4 ms mean, with a max of 400 ms, in its late years
  (`critic/c79_hero_64019_20.log`).

### Stability: 8 → **8**

**Evidence for 8:**
- **0 page errors in every probe of this run**, about 170 page runs, and 16 minutes of monkeys at four sizes. The one
  console line is R79-N2's WebGL warning.
- **Determinism:** `workerDeterminism` repeats run 77's hash on 54059 on every arm. Plain 1938's 20-year hashes repeat
  run 78's. The page's saves load to the same hash (`saveload_page`, `x_continue`, `h_continue`).
- **Old saves:** run 78's 7019 year-20 save loads on HEAD and runs a year (15.8 s, `07e768a6`, `critic/c79_loadold_7019.log`). Run 78's 1975 start plays to the
  track's end.
- **Long runs:** two 12-year page watches with 0 errors. The longest gap between frames at Max is 133 ms
  (`critic/c79_long_watch2.64941_12__heroes_on_hon.log`).

### Semantic zoom to unit level: 8 → **8**

**Evidence for 8:**
- **`z_zoom 64911`:** 18 tiers from the world to 3 m/px over a German division, with 64 elements and 3,194 indices at the
  last (`critic/c79_z_zoom.64911.log`).
- **`markerPop` 64951 and 56951:** 0 leaps and 0 pops gliding 1,300 to 1,100 m/px and running 15 s. A frame's p95 is
  19 ms (`critic/c79_markerPop.*.log`).
- **`heroPop`:** zooming 9,000 to 4,000 m/px gives 0 jumps on 56901 and on new seed 64905. 57905 gives 5, as run 77's
  `hpz` gave on that seed (`critic/c79_heroPop.*.log`).
- **`markers`:** at 600 m/px, 0 or 1 pairs over 30 px on two seeds (`critic/c79_markers.*.log`).
- **`look`'s tiers:** 1,200 to 30 m/px over two fronts on three seeds, both looks.

**Not 9:**
- At 1,800 m/px, 12 marker pairs touch on 56951 (`critic/c79_markers.56951_*.log`).
- Zooming in, Char 2C's counter jumps 5 times on 57905.

### Naval warfare: 8 → **8**

**Evidence for 8:**
- **`landingFuzz`:** 0 of 90 on new seeds (64101 to 64129), `slowClick` included. `landingRows all`: 115 cases, 0 broken (`critic/c79_lrows_all.log`).
- **Sea battles:** `seaBattles 64061` (3 years, 51 battles) and `64069` (35). On the page every battle is seen at its
  camera with both sides (`critic/c79_sbl_*.log`). `seaclick 64913` finds the battle's row and flies to it
  (`critic/shots/c79sc_64913_150m.png`).
- **Landings on the page:**
  - `lland` 64903, 64907 and 64909: the landings sail, land, or are told when their transports are sunk.
  - `lhold 64905` (Malta).
  - `turnback 64901`: the cancel brings the divisions back.
  - `lbar` and `lbox` on a phone (`critic/c79_l*.log`).
- **Repulses** are told in words ("over: 1 landed, 2 thrown back"), with 0 broken (`critic/c79_repulse_*.log`).
- **Run 77's named `landingInvariants`:** each the same line as run 77. Three break `slowClick` (a timing bound,
  ADR-914), one breaks nothing.

**Not 9:** in a Spanish civil war's sea battle both sides fly the same red-and-yellow flag at 150 m/px. Only the names
tell them apart (`critic/shots/c79sc_64913_150m.png`).

### Tanks: 8 → **8**

**Evidence for 8:**
- **`c_battle 64915` and run 75's 7781:** the armoured fight at 250, 80, 25, 10 and 15 m/px live, with wrecks and
  sorties drawn (`critic/c79_c_battle.*.log`). At 15 m/px, Armoured division 40's tanks against white-and-red infantry
  across the red contact line, a dead white-and-red ball, Maus beside, two planes beside it
  (`critic/shots/c79c_64915_arm_15m_live_2.png`).
- **Land heroes:** `heroCeiling` on three new seeds passes 25 of 36 lives, as run 77's 92 of 131 (70 %)
  (`critic/c79_heroCeiling3_641*.log`). `heroBattle 64081`: Char 2C in battle 81 of 487 days at war.
- **The fronts' arrivals:** at day 60, 92 % of Poland's men are at the German front, and 90 % of China's at the Japanese
  front (`critic/c79_fa_*.log`).

### Aircraft: 8 → **8**

**Evidence for 8:**
- **`pl_planes 64925`:** air marks from 3,000 to 25 m/px in both looks (`critic/c79_pl_planes.*.log`,
  `critic/shots/c79pl_64925_GER_POL_5391_0250m_balls.png`).
- **`w_wing 64927`:** a followed wing is marked in 58 of 58 samples at 3,000 m/px (`critic/c79_w_wing.64927.log`).
- **Air war in History and the ticker:** "Italy and United Kingdom fought in the air over the past month: Italy lost
  21 aircraft" (`critic/c79_h_interv.*.log`).
- **The build menu** offers fighters and bombers with their price and time. A strategic bomber not researched is shown
  disabled (`critic/c79_new.build_*.log`).

### AI nuclear use: 8 → **8**

**Evidence for 8:**
- **Launches on new seeds over 22 years:** 7, 0, 3 and 10 (`critic/c79_nc_*.log`).
  - `nukeIntercepts 64501`: 26 launches, 9 bombers, 4 stopped, against an expected 3.6.
- **On the page:** in `an_ainuke 64511` (13 years), the Soviet Union's strike on France near Paris is told in the alert
  with its toll: 183,000 civilians, 56,936 men and 226 guns (`critic/c79_an_ainuke.64511_*.log`). "Go to" lands on
  Paris; at 3,000 m/px a dark ring marks the burst (`critic/shots/c79an_64511y13_0_z03000.png`). France's answer near
  Tórshavn follows within two days.
  - The 20-year worlds 7019 and 32019 (with and without heroes) play up to 400 more days with 0 errors.
- **In the free 1991 start, 2 detonations in five years** (`critic/c79_free_1991_64611_free.log`).
- **The kinds a player reads:** `NukeDecided` and `NukeMeansLost` reach History (`critic/c79_interceptTold.log`).

**Not 9:** where the AI's bomb fell, the paused game shows only a faint dark spot under Paris's counter at 600 m/px
(`critic/shots/c79an_64511y13_0_z00600.png`). God's bomb, two hours on, stands as a cloud in a ring
(`critic/shots/c79a_64917_14_paris_h_2h.png`). Run 75's AI strike looked the same (`critic/shots/c75an_58505y13_0_goto.png`).

## Blocking issues

1. **R79-B1 (diplomacy; ADR-1119's lift): a war across the sea declared with no lift, through a door the gate does not
   ask.**
   - **The case:** `npx tsx tools/diag/diploInvariants.ts 64015 random 1825 --heroes` gives 1 broken:
     `64015 random, heroes day 1411: lift: ARG declared on #105 over the sea, 16294 men to lift for a room of 25200`
     (`critic/c79_diploinv_64015rh.log`).
   - **The trace:** `D=105 npx tsx critic/scripts/c79_liftTrace.ts 64015 random 1411 ARG --heroes`
     (`critic/c79_liftTrace_64015_D2.log`).
     - In each of the six hours before, `callSides(ARG, #105)` is `[[ARG],[#105]]`, the sides touch nowhere, and
       `noLift` is **true**.
     - #105 is at war with Brazil. Argentina is its land neighbour by ownership (`neighbourMap`), not
       by control.
     - In the hour of the declaration, Brazil makes peace with #105 and takes it as a puppet.
     - Argentina's lift is 84,894 men in the hour after. That jump is the war's own effect, not something earlier in the
       hour: at tick 33864, `seaLift` is 16,294 and `noLift` true; `declareWar(ARG, #105)` by hand, with no step, makes it
       84,894 (`npx tsx critic/scripts/c79_liftJump.ts`, `critic/c79_liftJump_64015.log`). So the gate, asked before
       the declaration, said no.
   - **What a player sees:** Argentina at war with a nation it cannot reach by land, its sea lift short of a group's room.
     It is the rule R139 (ADR-1119) claims to hold.
   - **Fix:** find the door that declared it, and ask `noLift` there, as R145 did for massings. Or narrow the checker by an
     ADR, if a war on a rebel at war with its holder is meant to be exempt.
     - I did not find the door. One candidate is a test of "over the sea" by ownership: `neighbourMap` has Argentina
       beside #105 while the sides touch nowhere by control.
   - **Seen fixed when:** the command above prints 0 broken. Also `diploInvariants` on ten more random-diplomacy seeds
     with heroes, five years each, prints 0 broken.

## Non-blocking issues (prioritised)

1. **R79-N1 (UI): the random world's banners wrap mid-phrase.**
   - "Orientale & / 1 ⚔ Diffa & / 2", "Eastern / Cape & 1 ⚔ Free / Tete", "Chukotka Autonomous / Okrug & / 3" at
     1600 × 900 (`critic/shots/c79rw2_random_64965_banners_crop.png`, from `c79rw2_random_64965_end_world.png`).
   - **Seen fixed when:** `node critic/scripts/c79_rw2.mjs 64965 730` ends with each banner on one line, or a name
     truncated with its count whole.
2. **R79-N2 (map/stability): `WebGL: INVALID_VALUE: bufferSubData: buffer overflow` at 2560 × 1440.**
   - The case: seed 64907 (heroes), day 500, the camera at (1043.43, 273.0) at 30 m/px, over British carrier groups at
     sea.
   - `node critic/scripts/c79_glSpot.mjs 64907 2560 1440 500 1043.43 273.0`: 1 warning at the 30 m/px step. At
     1600 × 900: 0 (`critic/c79_glSpot_2560x1440.log`, `critic/c79_glSpot_1600x900.log`). Run 78's build gives it too
     (`critic/c79_glSpot_c78build_2560x1440.log`).
   - Found by `look 64907` three times out of three (`critic/c79w_look_64907_2560x1440.json` marks it at `d500_f0_30m`).
     Nothing was seen missing from the picture.
   - **Seen fixed when:** the probe prints `"errors":[]`.
3. **R79-N3 (UI, phone): History opens under an open nation panel.**
   - `dirHand 59955 120 390 844 touch`: the History act cannot click a row's link (`history-go`). The nation panel the
     banner act opened covers History's rows (`critic/shots/c79dh_59955_390x844_history.png`).
   - This is the item runs 77 and 78 left unjudged.
   - **Seen fixed when:** that probe's History act ends with `cutsAfterAct` read and no "act failed".
4. **R79-N4 (stats): a pact named for another.**
   - "Romania joins the Anti-Comintern Pact" (1940-11-23) under "The Tripartite Pact: Hungary" (1940-11-20).
   - Bare rows: "Thailand's alliance with Japan", "The Sino-Soviet treaty", "Canada in NATO as since 1949"
     (`critic/c79_trackTexts2.log`).
5. **Small:**
   - The strike's ring over the city's name (God Mode).
   - Like flags on both sides of a civil war's sea battle.
   - Three opened banners with the same death sentence on a phone.
   - The AI's bomb, where the game stops on it, leaves only a faint spot at 600 m/px (AI nukes, Not 9).
   - `slowClick` on run 77's three named cases, the same lines as run 77 (ADR-914).

## Run 78's cases re-run

| Run 78 case | Run 78 (`d7b981dd`) | Run 79 (`79058a5a`) | Evidence |
|---|---|---|---|
| R78-N1 track rows: Rome, Vienna, the alliance rows | "Italy occupies Rome", a small "the", "joins the alliance" | **fixed**: "Rome falls to the Allies", "The Second Vienna Award", "joins the Anti-Comintern Pact" (through `trackText`, not seen on the page); residue R79-N4 | `critic/c79tr_*.json`, `critic/c79_trackTexts2.log` |
| R78-N2 `warOpening 57211…`; ADR-1130's seeds | 14 of 88; 12.5 % / 20.3 % | the same (sim unchanged); settled by ADR-1132 (13.2 % pooled; 64211 repeats it) | `critic/c79_wo_57.log`, `critic/c79_warOpening_64.log` |
| Time-lapse: a gone nation unmarked; the month twice at step 0 | "Sweden"; "from January 1938" beside it | **fixed**: "Gone by now: nothing to select"; the label hidden (run 78's build beside it, unchanged) | `critic/c79tld_*.json` |
| A short war's opened banner as tall as its neighbour | 78 px | **fixed**: 31 px at six sizes | `critic/c79_dt_*.json` |
| `bannerRank 57901 150` | 8, 20, 17 | 11 | `critic/c79_bannerRank.57901_150.log` |
| `bannerFlip` 57901, 58901, 57903 | 8, 4, 5; 1, 0, 2 | 8, 4, 5; 1, 0, 2 | `critic/c79_bannerFlip.*.log` |
| `bannerHourly 57901` | 2 changes, 0 back | 3 changes, 0 back | `critic/c79_bannerHourly.57901_100_480.log` |
| `bannerLoad` (a war fought before the load: untested) | | the same row, 0 changes in 72 h, `lastBattle` restored | `critic/c79_bannerLoad.*.log` |
| `dirHand 59955` desk; phone History act | 0 cuts; unjudged | 0 cuts; R79-N3 | `critic/c79_dirHand.*.log` |
| `x_continue 58415` (unjudged) | stood at Continue | probe fault (a confirm step); mended: the same hash | `critic/c79_xc_64415_GER.json` |
| `timeLapse`, `tlMonths`, `histPlace`, `tlMore cell`, `phoneTicker`, `p_phone` (new seeds) | whole | whole, 0 errors | `critic/c79_timeLapse.*.log` and the rest |
| 7019 and 32019, twenty years | `ab927e1b`, `c3520016` | the same | `critic/c79_seed*_save.log` |
| `diploInvariants 33501`, `63001`; `worldInvariants 63051` | 0 | 0 | `critic/c79_diploinv_33501s.log` |
| `landingFuzz` (new seeds) | 0 of 90 | 0 of 90 | `critic/c79_landingFuzz.log` |
| Run 78's 40 replay cases | 0 broken lines; their counts | exit 0 for all, 0 broken lines in the free starts; compared by figure where I read them (`capsurvey` 2 of 154, `afterTrack` 207 and 222 wars, `atx 1938` 220, `massTold 57613`): the same. The rest not compared line by line | `critic/c79_*` of `c79_startsJobs.txt` |
| Run 78's page cases (God, editor, take control, stage, planes, armour, tiers) | exit 0 | exit 0, 0 page errors, new seeds | `critic/c79_lane*.out` |
| Run 78's left-outs (`heroPop`, `markerPop`, `markers`, `seaBattlesLook`, `seaclick`, monkeys, `bannerOwn`, `massSeen`) | left out | all run (above); `bannerOwn 1942 GER`: the player's three wars first, 0 errors; `massSeen 56211`: the massing told in ticker and History ("Soviet Union is massing its army on the border of Romania"); `bannerFlip 64903`: 7 changes of the row in 60 s, 0 under a resting cursor | `critic/c79_laneD.out`, `critic/c79_laneA.out` |
| Run 77's `c64_track 1938 365` (not run by run 78) | `4e704f23` (run 77) | `50d75936`: every other line the same; `timeline.json`'s notes changed in runs 78 and 79's batches | `critic/c79_track_1938.log` |
| Run 77's named `landingInvariants`, `dday`, `census`, `heroBattle 7019`, `massTold 57613` | | the same lines as run 77 | `critic/c79_li_*.log`, `critic/c79_heroBattle_7019.log` |
| Run 61's bulk sets, Malta | | plain 1938 unchanged, carried | |

## Design objections (none blocking, no score lowered)

- **ADR-1111 (heroes' names at the world's zoom):** on a phone, six heroes' names cover Europe's counters
  (`critic/shots/c79pt_64903_390x844_opened.png`).
- **ADR-1130 and ADR-1132:** with R147 the attacker has no man near about a point more often. The pooled figure is under
  the bar. The trade is the user's.

## Ideas from other games (not scored)

- **Hearts of Iron IV** names each faction by its own historical name at the time it is joined, and keeps the pact a
  nation signed in its event. That would settle R79-N4.
- **Ages of Conflict** shrinks a war's names before it wraps them.

## Strengths (verified)

- **The batch is fixed on its own probes, run 78's build beside it.**
  - The time-lapse's tooltip: "Sweden" against "Sweden / Gone by now: nothing to select".
  - The banner heights: 78 px against 31 px.
  - The track rows: Rome on the page, and the named pacts through `trackText` (not seen on the page).
- **The page holds up under abuse:** about 170 page runs and 16 minutes of monkeys at four sizes with 0 page errors.
  The worker's hash is the same on every arm of `workerDeterminism`.
