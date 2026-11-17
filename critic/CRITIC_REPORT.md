# Critic report, run 73 (focused): Batches 32–38 (R87–R120) on `a9814c43`

- **Mode: focused.** The spawning message asks for a focused run (CRITIC_PROMPT, ADR-915). Run 72 was full, with no
  blocking issue and every score at 8.
- **Commit judged:** `a9814c439339558b34af94b92f0212b13867a515`, HEAD at the start (`critic/c73_commit.txt`).
- **The last report:** run 72, full, on `2ae30ec6`: no blocking issue, every dimension 8.
- **What changed since run 72:** 43 commits, 429 files. R87 (run 72's four issues), R88 (the release checks; the
  release `release-2026-11-15`), then Batches 32–38:
  - the map's look (R89–R96): thick movement arrows, glowing fronts, flashes, the ground of T0/T1, white names, larger
    counters with a strength bar, the clock in a plate at the top, the news and the ranking closed on a desk;
  - the sim (R97–R104): mass, then declare (ADR-1089); the invaded front weighs four times (ADR-1090); a nation massed
    on answers (ADR-1093); a hero takes ground and a waiting march is told of (ADR-1095);
  - the fronts read (R99–R109): brighter fronts, tags clear of the chrome, ground being taken, arrows by side, bands on
    occupied ground, fewer counters at the world's and the middle zooms;
  - the review of the pictures (R110–R120): one row of banners, the legend's "?", a counter's stripe, the first cue, a
    tag's bar, banner titles, the settings panel in two parts, the phone's top bar, the editor's file inputs.
- **Due because the sim changed:** `git diff --stat 2ae30ec6 HEAD -- src/sim data public/data` is 12 files, among them
  `src/sim/ai/` (massing, operational, strategic) and `src/sim/systems/` (capitals, movement, revolts, territory). Plain
  1938 is not carried: the 20-year saves end at new hashes (7019 `f0783b09`, 32019 `37285b1d`; run 72: `d28412a4`,
  `11ad91b5`). Run 61's bulk sets and Malta's 18 were run again.
- **Scored afresh** (the changed files touch them): map visuals (`src/render/`), diplomacy (`src/sim/ai/`,
  `systems/capitals.ts`, `territory.ts`), emergent dynamics (`ai/massing.ts`), God Mode and editor
  (`scenarioEdit.ts`, the editor's inputs), stats and history (`worker/historyRows.ts`, the timeline's names), UI
  (`src/ui/`, nine files), performance (the drawing), stability (`shared/saveFormat.ts`, `world.ts`), semantic zoom
  (`render/units/`), naval (`systems/movement.ts`, `territory.ts`), tanks (`ai/operational.ts`, R104).
- **Carried from run 72, with a check each:** aircraft and AI nukes. No file of the air war or of the nuclear rules
  changed. For each I still ran its probes and, for the nukes, an A/B on the two commits (below), since the sim's wars
  changed around them.
- **Left out for time, of run 72's named cases:** `g42 1942 replay 53542` (my call gave the probe its arguments in the
  wrong order and it read nothing: `critic/c73_god42.1942_replay_53542.log`); `few3 51401`; the phone's "banners over
  History" picture; `menloss`.
- **Left out for time, else:** the page suite's other probes of run 72 (about 60 of its 90: landings on the page but Malta's,
  the random world's page, the phone's landing bars, the many-wars and peace-button cases, two of the four
  `histnames` cases, the 1975 free watch); `heroCeiling` on ten seeds; `c72_free` on six of its thirteen games; the
  second and third twelve-year watches (one watch of twelve years on run 72's own seed, and one of five years alone for
  the frame rate, were run).
- **Setup.**
  - Build: `vite build --outDir critic/c73_dist`, exit 0. Starts: `npm run saves -- critic/c73_starts`, 54 years
    (543 s), copied into the build (`critic/scripts/c73_build.sh`).
  - Served by `vite preview` on 127.0.0.1:5373; Playwright Chromium at 1600 × 900 and 390 × 844. Run 72's build
    (`critic/c72_dist`, `2ae30ec6`) served on 5374 for the picture comparisons, and run 72's commit as a worktree
    (`critic/wt`) for the headless A/B.
  - Run 72's probes copied as `c73_*` (`critic/scripts/c73_mkcopies.sh`). New seed family: 56xxx.
  - Chains: `c73_runNamed.sh` (`c73_jobsAll.txt`, then `landingFuzz --seeds 15 --first 56101`), `c73_chainS.sh`
    (`c73_startsJobs.txt`), `c73_pages.sh` (the page probes), `c73_malta.sh`, `c73_nukeAB.sh`, `c73_chainP.sh`
    (performance alone, then the bulk sets).
  - New probes: `c73_look.mjs` (a game from the title: the cue, the chrome, two fronts at five zooms, at desk and phone
    size), `c73_markers.mjs` (markers over one another, on both builds), `c73_tagsChrome.mjs` (R100, R101),
    `c73_waits.mjs` (R104 by mouse), `c73_massSeen.mjs` (what a watcher sees of a massing), `c73_bannerOwn.mjs` (R110
    and the player's own war), `c73_stripe.mjs` (R112 in both looks), `c73_detvp.mjs` (the same world at two window
    sizes).
- **Incidents, disclosed:**
  - My first copy of run 72's probes kept their shot prefixes (`c72hp_`, `c72u2_`, `c72u2y_`): the first three page
    probes (`heropanel 55929`, `undo2 41211`, `undo2y 51231`) wrote HEAD's pictures over run 72's of the same names in
    `critic/shots/` (not committed files). The prefixes were then changed to `c73…`. Run 72's figures for those cases
    are taken from its report and logs, not from those pictures.
  - `c73_g_editor 56921` stood 15 minutes: Poland, given ten warheads by the probe, struck Berlin on 22 February 1938
    and the game paused on the strike, as its setting says (`critic/shots/c73gdbg_56921_99_stuck.png`). A probe's wait,
    not a fault.
  - `c73_hist 32019` stopped on a "Charts" button it no longer finds (the ranking is closed on a desk since R94a): a
    probe error; the charts were opened by hand in another probe (Stats, below).
  - I stopped three of my own waiting processes by their process ids (the bulk chain's first waiter and two
    `afterTrack` runs), to run the performance chain alone; they were run again after it.
  - Free memory fell to 0.7 GB at one point with thirteen sims and three browsers at once; nothing was reaped.
  - A helper script of mine could not be written to the scratch folder (the guard allows writes under `critic/`
    only), and the command then ran an older file of that name left there by another session. It stopped on its
    first line (a file not found) and changed nothing: `git status` shows no change outside `critic/`.
  - At the end: both preview servers stopped by the process ids that held ports 5373 and 5374, no Playwright browser
    left, the worktree `critic/wt` removed and pruned (it had no `node_modules` link; the repo's own is whole).
- The tree outside `critic/` was not touched; its eight untracked PNGs under `docs/evidence/7.132/` were there before.
- **Writes outside `critic/` by tools at their defaults:** `npm run sim` to `.cache/runs/*.json`; `landingFuzz` to
  `.cache/landingFuzz/`.

## Verdict

**No blocking issue.** Every rule checker is 0 broken: on new seeds 10 runs of five or ten years, 5 free-year games
and landingFuzz 0 of 90; on run 72's seeds 2 runs and 2 free-year games. The bulk landing sets break no rule but
`slowClick` (4 of 717 runs, each a case run 72 had). Run 72's four non-blocking issues are fixed on their own cases,
but for the first half of R72-N4.

**One score moves: UI/UX and polish 8 → 7** (its bar is 7). The banners of R110 show the three newest wars
(ADR-1101, the user's decision, which says nothing of a nation played). A player who takes Germany in the 1942
replay has none of the three wars Germany leads on the banners at any sample of 150 days, closed or opened: not the
war with the United Kingdom (24 nations, the second largest of the world's ten) nor the one with the Soviet Union
(11, the third). The same start and after-seed on run 72's build has all three on the banners at every sample
(R73-N1). Every other dimension stays at 8.

**What a player will meet first (non-blocking):**
- **R73-N1:** the wars a played nation leads are off the banners (above).
- **R73-N2:** a massing (R97b, R103) is told nowhere: close to a million Soviet men come to Romania's border in five
  weeks with no row in the ticker or History and no arrow on the map, until the declaration.
- **R73-N3:** in worlds of two or three nations the first war comes later or never (first war on day 27 → none in ten
  years on 55426); the cause was not read. Brazil's massing on Colombia is given up "late" on each of three new seeds.
- **R73-N4:** hero tags still stand on counters in play at 6,000 m/px and farther (R72-N4's first half).
- **R73-N5:** the markers of a crowded front still cover one another at 1,200 to 1,800 m/px (old: no worse than run
  72's build on the same seed and days).

**The rule checkers on new seeds:**
- diploInvariants, 0 broken: 56001, 56005 (heroes) (1938), 56003 (random diplomacy), 56007 (random world), five years;
  56009 (heroes), ten years. Run 72's 33501: 0 (`critic/c73_diploinv_*.log`).
- worldInvariants, every rule set, 0 broken: 56051, 56053 (heroes), 56055 (random world), 56057 (random diplomacy),
  five years; 56065 (heroes), ten years. Run 72's 36009: 0 (`critic/c73_wi_*.log`).
- `c73_free.ts` (the checkers' rules on games from built years), 0 broken lines: 1942 56542, 1951 56551, 1966 56566
  (random diplomacy), 1975 56575 (two years), 1991 56611 (five years), all with heroes on; run 72's 51501, 51505: 0
  (`critic/c73_free_*_free.log`).
- `blocend 54611`: 0 bloc lines in five years. Track checker to 1991 and a free year, 56301: 200 living, 0 wars at
  the end, 69 wars in the year after (`critic/c73_track_56301.log`). `heldAtEnd 54311`: 0. `heldfree 1946`: 0.
- `landingFuzz --seeds 15 --first 56101`: **0 of 90** runs broken (`critic/c73_landingFuzz.log`). `landingRows all`: 0.
- `workerDeterminism 54059`: `7733f316` on every arm; 56059: `e737610a` on every arm.
- `repulse 55071`, `56073`: 0.
- The builder's measures of the new rules, on new seeds (`tools/diag/warOpening.ts`, 56211, 56213, 56215, three years:
  149 wars, 71 with a border that ran a month): the attacker with no man within 300 km of the border 9 of 71 (12.7 %;
  the user's bar 15 %, ADR-1094); the defender ahead in land at day 30 in 9 of 71 (12.7 %; the bar 15 %); of the 51
  wars prepared by a massing, 0 with no man near (`critic/c73_warOpening.log`, `critic/c73_warOpening.json`).

## Scores

### Map visuals and readability: 8 → **8** (scored afresh)

**What I tested:** a game started from the title at 1600 × 900 (seed 56901) and 390 × 844 (56903), stopped on days
45, 180 and 400 (60 and 240 on the phone): the world at 14,000 m/px, Europe at 6,000 and 3,000, Asia at 3,000, and
two fronts each at 1,200, 600, 250, 100 and 30 m/px (`critic/scripts/c73_look.mjs`, 110 shots); a twelve-year watch
at 30,000 m/px; run 72's capital and name cases; the tags against the chrome on a new seed; the markers of a
crowded front on HEAD's and run 72's builds.

**Evidence for 8:**
- **R72-N1 fixed (R87a):** `c73_capsurvey.ts`: 2 of 154 living nations in 1975 seated away from a capital they own,
  both the timeline's (Nationalist Spain at Madrid, the CCP at Peking); run 72 had 7, with the Soviet Union at
  Tashkent (`critic/c73_capsurvey.log`). On the page "Moscow · capital, Soviet Union" on 2 January 1975, "Seoul ·
  capital, South Korea" on 31 December 1975, "Moscow · capital, Russia" and "Paris · capital, France" on 31 December
  1991 (`critic/c73_ev_1975_999.json`, `critic/c73_ev_1990_999.json`,
  `critic/shots/c73ev_1975_1975-01-02_moscow_1500m.png`). A free 1975 game places the T-42 at Moscow and the Char 2C
  at Paris, 0 km from the capital (`critic/c73_heroPlace_1975.log`).
- **A front is read at every zoom (R90a, R99, R105, R107):** the front between Japan and China on 16 February 1938
  is a white-cored red line from 1,200 to 100 m/px, the land Japan took hatched in its colour at 1,200 and 600 and in
  bands at 250 and nearer, with a glow where a cell is being taken
  (`critic/shots/c73look_56901_1600x900_d45_f0_1200m.png`, `…_600m.png`, `…_100m.png`); Italy's and Britain's in
  Somaliland on 3 July 1938 (`critic/shots/c73look_56901_1600x900_d180_f0_250m.png`).
- **The arrows by side (R89, R106):** on the Somaliland front Britain's are pink and Italy's green, one for each group
  of formations, none lying across another of its nation (`critic/shots/c73look_56901_1600x900_d180_f0_1200m.png`).
- **The world's zoom is quieter (R108):** at 14,000 m/px on 9 February 1939 the counters are those of the nations at
  war and the heroes; the names of the large nations are whole (`critic/shots/c73look_56901_1600x900_d400_1world14000.png`,
  `critic/shots/c73lwhon_55941_y06_world.png`).
- **R100 and R101 on new seeds:** `c73_tagsChrome.mjs 56973` (Germany's war on Poland, day 8, eight places at 250,
  120, 60 and 12 m/px): 342 tags, 0 with any part under the clock, the banners, the bars, the legend or the ticker,
  0 pairs over one another (`critic/c73_tc_56973.log`).

**Not 9:**
- **R73-N4 (R72-N4's first half, not fixed by R87d):** in play at 6,000 m/px on 9 February 1939 the T-42's tag covers
  the top of the counter "293.9k" and Roma's covers "47.5k +1" and "13.4k"
  (`critic/shots/crop_c73_eur6000_centre.png`, from `critic/shots/c73look_56901_1600x900_d400_2eur6000.png`); at
  30,000 m/px in 1944 "TOG II +1" stands on a British counter (`critic/shots/c73lwhon_55941_y06_world.png`). R87d
  mended the half with a panel open: with Relations open on 55929 the tags stand by their units and none is piled at
  the panel's edge (`critic/shots/c72hp_55929_12000_1relations.png`, HEAD's picture under run 72's name; see the
  incidents).
- **R73-N5 (old): markers over one another at a crowded front.** `c73_markers.mjs 56951` on the Japanese-Chinese front,
  days 10, 20 and 30, at 1,800 m/px: on HEAD 24, 47 and 39 pairs of markers overlap (of 60, 71 and 72 markers); on run
  72's build 30, 60 and 60 (of 62, 73 and 79). At 1,200 m/px: 5, 12, 17 against 12, 9, 19. No worse, and by the brief
  no score moves; the heap at Taiyuan with half its numbers hidden is what a player sees at the tier where the war is
  read (`critic/shots/c73look_56901_1600x900_d45_f0_1200m.png`, `critic/c73_mk_head_desk.log`,
  `critic/c73_mk_c72_desk.log`; the phone the same, `critic/c73_mk_head_phone.log`).
- **The counter's stripe (R112) is in Classic only.** In Countryballs, the look the title gives, nothing is drawn left
  of the ball (`critic/shots/c73stripe_56981_classic_x.png`, `critic/shots/c73stripe_56981_balls_x.png`). ADR-1103
  says so ("Not in the ball look"); ROADMAP R112 does not. As decided; not an issue.
- "COMMUNIST CHINA" is written under its own capital's flag and the name "Yan'an"
  (`critic/shots/c73look_56901_1600x900_d45_f0_1200m.png`); a counter stands half under the top clock at 3,000 m/px
  (`critic/shots/c73look_56901_1600x900_d180_3eur3000.png`: R100 keeps tags and pointers clear, not counters).

### Diplomacy, war, alliance, puppet, revolt depth: 8 → **8** (scored afresh)

**Evidence for 8:**
- **Every checker 0 broken** on new seeds (above), with heroes, random diplomacy and the random world.
- **The new opening rules hold their bars on seeds the builder has not seen** (warOpening, above): 12.7 % and 12.7 %
  against 15 %; a prepared war never opens with no man at the border (0 of 51).
- **A massing seen on the page:** seed 56211, the Soviet Union on Romania: on 10 February 1938 43,400 Soviet men
  stand near the border, on 14 March 441,000, 397,000 and 146,000, and the war is declared that day
  (`critic/shots/c73ms_56211_d40_3000m.png`, `critic/shots/c73ms_56211_d72_3000m.png`, `critic/c73_ms_56211.log`).
- **The invaded front (R98c):** `frontArrivals 56205 GER,POL 60`: on day 60 Germany holds 569 of Poland's cells and
  Poland 22 of Germany's (`critic/c73_fa_56205.log`).
- **Run 72's kept wars (R86b) as they were:** `c73_warlong 1942 54601 god`: GER v SOV ends at 90 on 18 September 1942
  (`critic/c73_warlong_1942god_54601.log`); `freewar` 1941, 1942, 1944: 0 peaces in the first hour; `clampend`: no kept
  war at ±100.
- **Run 72's same-seed measures:** `farConquests 0`: 10.2 and 10.4 far per 100 nations (run 72: 9.2 and 11.0);
  `firstdecl`: 0 over 6,000 km of 53 and 59 first declarations (run 72: 0 of 96 and 99); `piles`: no war over 4:1 in
  its sides on fifteen seeds at day 365 (run 72: on five of the fifteen) (`critic/c73_farc_0_*.log`,
  `critic/c73_firstdecl*.log`, `critic/c73_piles_*.log`).

**Not 9:**
- **R73-N2: a massing is told nowhere.** In the five weeks above the ticker and History have no row of it, and no
  arrow is drawn: on 25 February 536,000 and 250,000 men are on their way south and on 7 March columns of markers
  stand from Kiev to the border, with no arrow on either picture (`critic/shots/c73ms_56211_d55_3000m.png`,
  `critic/shots/c73ms_56211_d65_1200m.png`; R96 draws arrows only for marches over a front). The first word is
  "14 March 1938 Soviet Union declared war on Romania" (`critic/c73_ms_56211.log`: "massing words []" on every stop). The answer of the nation
  massed on (R103) is as silent. The most telling new thing in the sim is found only by a watcher who counts the
  counters.
- **Wars in which nothing happens for a month:** of the 111 wars of the three warOpening seeds that ran 30 days, 16
  had no order over a front from either leader and no cell taken on day 30; 14 of them with no border (Germany on
  Ireland, Iceland, Iran, the Dominican Republic and Peru; Japan on Siam on two seeds; the Soviet Union on Ireland)
  (`critic/c73_warOpening.log`). Not compared with run 72 (the tool is new).
- **The bloc leaders at war after the track (run 72's observation, as it was):** `c73_afterTrack 55601`: the United
  States and the Soviet Union on opposite sides for 533 days (run 72: 417), again after the United States declares on
  Cuba in the fourth year. The checker's Soviet bloc ends on 1 January 1994, and `c73_blocend 55601` has 0 bloc lines
  broken in five years (`critic/c73_atx2_55601.log`, `critic/c73_blocend_55601.log`). 37601: 0 days, as run 72
  (`critic/c73_atx2_37601.log`).

### Emergent world dynamics: 8 → **8** (scored afresh)

**Evidence for 8:**
- **Twelve years on the page, run 72's seed 55941 with heroes, 1938–1950:** wars on the banners at every year's end
  (the Soviet Union and three against Japan and seven; France and five against Portugal; the United Kingdom and
  fourteen against France and thirteen; the Soviet Union and five against the United Kingdom and five), 98 nations
  down to 72 and up to 75; run 72's watch of the same seed went 96 to 70 to 77 (`critic/c73_lwhon_55941.json`,
  `critic/c72_lwhon_55941.json`, `critic/shots/c73lwhon_55941_y06_world.png`). 0 page errors.
- **No pile-on left:** `piles` at day 365 on run 72's fifteen seeds: no war over 4:1 in its sides, where five seeds had
  one (Germany against the United Kingdom 2:9, Nationalist Spain against France 3:13)
  (`critic/c73_piles_*.log`, `critic/c72_piles_*.log`).
- **After the track:** 69 wars declared in 1992 on 56301 (run 72's 55301: 75).

**Not 9:**
- **Fewer wars at once:** on those fifteen seeds 90 wars are under way at day 365 where 122 were (6.0 a seed where
  8.1). ADR-1089 names the fall and the user re-scoped its bar; the wars lost are by the builder's measure those the
  attacker was not at. On my three warOpening seeds the attacker is ahead in land at day 30 in 54 of 71.
- **R73-N3: small worlds wait longer, some for ever (R97b's massing).** `fewNationWars` on run 72's seeds, the first
  war's day on run 72's commit → HEAD: two nations 55421 13 → 476, 55425 90 → 665, 55423 2,323 → none, 55426 27 →
  none in ten years (it had 6 wars and two new nations), 54422 5 → 475; three nations 53401 376 → 944, 55406 40 → 510.
  Worlds with a war in ten years: two nations 9 of 12 → 7 of 12; three nations 10 of 12 → 10 of 12
  (`critic/c73_few2_55.log`, `critic/c73_few2_54.log`, `critic/c73_few3_55.log`, `critic/c73_few3_53.log` against
  `critic/c72_few*.log`). Sixty nations (55431–3): 91, 87 and 56 wars in five years where 113, 107 and 108. The first
  sixty days of 1938 have 53 and 59 first declarations on ten seeds each where 96 and 99. ADR-1089 names the fall in
  the wars' number and the user re-scoped its bar; the two-nation stall was accepted before (R71-N3). Why these
  worlds wait was not read: R97b's massing is the rule between the two commits that delays a declaration, but I did
  not trace a case. Seen beside it: Brazil's massing on Colombia is given up "late" once on each of the three
  warOpening seeds (`critic/c73_warOpening.log`, the "late:" lists).
- Three nations 55404: still no war in ten years, as run 72.

### God Mode: 8 → **8** (scored afresh)

- **God tools at work on a new seed:** `c73_q_god_tools 56919`: revolt, spawn, breakthrough, territory, found and
  raze a city, each told in the ticker ("3 January 1938 New Town was founded in Germany", "4 January 1938 Prague in
  Czechoslovakia was razed") (`critic/c73_q_god_tools.56919.log`); `c73_a_god_nuke 56917`: the bombs, the alert and
  the charts (`critic/c73_a_56917.json`).
- **Undo:** `undo2 41211`: 0 px for nuke, revolt, nation, city and raze. `undo2y 51231` (a year on): 0 px for four,
  and **9 px for the nuke where run 72 had 10,010** (the banners' row no longer moves) (`critic/c73_undo2_pix.txt`).
- **R71-N1 holds:** a God peace in the 1942 replay reads "Japan made peace with United States"
  (`critic/c73_godpeace.1942_JAP_United_States.log`). The phone's God tab has its note once
  (`critic/shots/c73hgt_390x844_tab.png`).
- A hydrogen bomb on Paris by the Nuke tool: the cloud, the ring, the alert with its toll and Go to
  (`critic/shots/c72a_56917_14_paris_h_2h.png`, HEAD's picture of seed 56917; the prefix is the copied probe's).
- **Not 9:** as run 72 (the year left decides the war).

### Editor and scenarios: 8 → **8** (scored afresh)

- **Editor:** `c73_x_editor 56443`: a paint, undo and redo, the scenario exported and loaded back from the title
  (`critic/c73_x_editor.56443.log`, `critic/shots/c73xe_56443_panel.png`: the file inputs as the panel's buttons, "No
  file chosen" in its type, R120). `c73_g_editor 56921`: fleets and a bomber wing set, a fleet on land refused ("Not
  done: no water of a sea is near the place"), ten warheads given to Poland, the scenario saved and started; Poland
  uses one on Berlin on 22 February (`critic/c73_gdbg_56921.log`).
- **Scenario file:** the standoff file loads in 4.9 s from the title (`critic/c73_os2_scen.*.log`).
- **The title:** a game from it has the first cue once and heroes on (`critic/c73_look_56901_1600x900.json`:
  `cueAfterResume` 0, `cueSecondGame` 0; `critic/shots/c73look_56901_1600x900_2start.png`). The 1983 free card and
  its start (`critic/shots/c73rc_1983_free_1600x900_card.png`).
- **Not 9:** nothing new found; no editor of the new sim rules (a massing cannot be set or seen in a scenario).

### Stats and history: 8 → **8** (scored afresh)

- **R72-N2 fixed (R87b) on its case:** `c73_histnames.mjs 1991 replay 1938 1991 28`: "29 October 1941 A major battle
  began near Kalinin" in the 1991 replay (run 72: "near Tver"), and the same in the 1975 replay
  (`critic/c73_hn_1991_replay_1938-1991_k28_1600x900.json`, `critic/shots/c73hn_1991_replay_1938-1991_k28_1600x900_1941.png`).
  Run 72's second row ("2 April 1945 … near Kaliningrad") is no longer among the replay's battles, so Königsberg was
  not read.
- **R72-N3 fixed (R87c):** on 31 December 1991 "Harare · capital, Zimbabwe", "Antananarivo · capital, Madagascar",
  "Dhaka · capital, Bangladesh", "Banjul · capital, The Gambia", "Guangzhou" (`critic/c73_ev_1990_999.json`).
- **The ranking and the charts since R94a:** closed on a desk; "Statistics" opens the ranking (15 rows, twelve
  measures) and "Charts" a chart of five nations (`critic/c73_charts_56995.log`,
  `critic/shots/c73ch_56995_2charts.png`).
- **History's export** on 32019's 1957 world: 3,054 of 3,054 events to CSV (3,056 lines) and JSON
  (`critic/c73_dl_32019.json`).
- **Not 9:** R73-N2 (History has no row of a massing or of its giving up); a refused order names a fleet by its
  number in the ticker ("1202: not done, no water there", `critic/c73_waits_56961.log`).

### UI/UX and polish: 8 → **7** (scored afresh; its bar is 7)

**Why it moves: R73-N1, the same start and after-seed on both builds.** ADR-1101 (the user's, accepted in advance): "`DESK_BANNERS`
3 in one row, the "+N" a button on a desk too; opened, the six in two rows. The newest war first (`startTick`, then
the id): with three shown, the war just begun is the one wanted." The order is the user's and lowers nothing by
itself. Neither the ADR nor SPEC (the War banners' entry) says anything of a nation played; that case is judged as
any other.
- **The case:** the 1942 replay, Germany taken by Take control, 150 days
  (`AFTER=4242 node critic/scripts/c73_bannerOwn.mjs 1942 GER Germany 150`; the after-seed fixed so that the world is
  the same each time).
- **HEAD:** Germany leads three wars from the first day: 3 against 21 with the United Kingdom (24 nations, the second
  largest of the world's ten; the largest, 25, is Japan's with the United States), 7 against 4 with the Soviet Union
  (11, the third) and 7 against 2 with the United States. The banners on days 30 to 150: "Thailand ⚔ Vichy France",
  "Soviet Union ⚔ Iraq", "France ⚔ Brazil", then "Bulgaria +3 ⚔ Turkey +2", "Argentina ⚔ Bolivia", "Peru ⚔ Bolivia",
  with "+7" and "+8". None of the three is on them. With "+8" clicked, six banners are shown (`MAX_BANNERS`, as
  decided), again none of the three: the war that fills the map with arrows is on no banner
  (`critic/c73_bo_1942_GER_after4242.log`; `critic/shots/c73bo_1942_GER_1600x900_open.png`, 31 May 1942, "Playing
  Germany", the six opened banners).
  - Disclosed: from day 90 Germany is in a fourth war as an ally (4 against 3, Bulgaria's on Turkey), and that one is
    on the row; its banner names Bulgaria. My count is of banners that name Germany, in their text or their title.
  - With a random after-seed the same: none from day 90, and opened one of three at the sixth place
    (`critic/c73_bo_1942_GER.log`); on the phone none from day 30 (`critic/c73_bo_1942_GER_phone.log`).
- **Run 72's build, the same start and after-seed** (`TAG=c72build AFTER=4242 BASE=http://127.0.0.1:5374 node
  critic/scripts/c73_bannerOwn.mjs 1942 GER Germany 150`). The worlds are not the same to the war, since the AI's
  rules changed (ten wars on HEAD on day 30, twelve on run 72's build); Germany's three are, with the same scores on
  day 30 (3 against 21 at 3, 7 against 4 at 13): "Germany +2 ⚔ United Kingdom +20", "Germany +6 ⚔ Soviet Union +3" and "Germany +6 ⚔ United
  States +1" on the banners at every sample, days 30 to 150 (`critic/c73_bo_c72build_1942_GER_after4242.log`). Run
  72's own probe of the case had them from the second hour to day 210
  (`critic/c72_ts_1942_GER_240_1600x900.json`); on HEAD that probe shows them to day 60 and none from day 90
  (`critic/c73_ts_1942_GER_240_1600x900.json`).
- **What is judged:** not the order, which is decided, but that a player of a nation, a case the decision does not
  speak of, can no longer read the score of their own war from the banners, which R115 has just made readable. It is
  not blocking: nothing claimed is contradicted, and the nation's panel still lists its wars.

**Evidence that holds it at 7 and not lower:**
- **The first cue (R113):** three lines under the clock in a game from the title, gone on Resume, not shown in a
  second game, at desk and phone size (`critic/shots/c73look_56901_1600x900_2start.png`,
  `critic/shots/c73phone_56903_390x844_2start.png`).
- **A banner says what it is (R115):** "Germany and 1 more (attacking) against Poland and 4 more", the score in
  figures; one row, and "+n" (R110) (`critic/shots/c73look_56901_1600x900_d180_c0more.png`).
- **The legend's "?" (R111, R114):** "Flag and number: the men there. Blue: a fleet. +n, ×n: more beneath it", and at
  100 m/px "A tag: flag, men, name; the bar its men of full strength. Red edge and a line to the enemy: in contact"
  (`critic/c73_look_56901_1600x900.json`). A nation's panel: "682,655 · 141 formations".
- **The settings in two parts (R116)** (`critic/shots/c73look_56901_1600x900_d45_c4settings.png`); the phone's top bar
  with the date and "Paused" (R119) (`critic/shots/c73phone_56903_390x844_d60_f0_600m.png`).
- **Orders by mouse:** `c73_x_mouse 56421`: 7 of 7 ordered to Warsaw, 6 closer after ten days; `c73_waits 56961`: an
  ordered division that met the enemy is told "it met the enemy and stopped to fight. A new order pulls it back or
  pushes on", and a fleet ordered onto land "a fleet goes only to water or a port" (`critic/c73_waits_56961.log`).
  R104b's own line ("it waits at the front") did not come up in my cases: the division fought on the fourth day.
- The phone's layout probe: 0 clipped, 0 off-screen (`critic/c73_p_phone..log`); keys, Continue (the same hash as the
  unbroken game), the action bar's icons; 0 page errors in every probe.

**Also not 8:**
- **R73-N6 (phone):** with "+3" opened the banners take three rows and cover the two rows of the ticker
  (`critic/shots/c73phone_56903_390x844_d60_c0more.png`); the first cue covers the "Ranking" plate and a hero's tag
  (`critic/shots/c73phone_56903_390x844_2start.png`).
- R73-N2 (the massing untold).

**What 8 needs** (the score is at its bar; this is for the margin): `AFTER=4242 node
critic/scripts/c73_bannerOwn.mjs 1942 GER Germany 150` prints "of the player's on the banners" over 0 at every sample
(a war the played nation leads, named on its banner), as it does on run 72's build.

### Performance: 8 → **8** (scored afresh)

Run alone, after every other chain had ended and before the bulk sets, pinned to the performance cores
(`critic/scripts/c73_chainP.sh`, `critic/c73_pf.status`: 23:55 to 00:09):
- **Tick, seed 99, five years:** 1.884 ms mean (run 72: 2.293), year 1 at `bf16e257`, the pin
  (`critic/c73_tick99.log`). With heroes: 1.750 ms (run 72: 2.363) (`critic/c73_tick99h.log`). The worlds differ
  (fewer wars are fought at once); no slower.
- **Frames, HEAD's 7019 year-20 world** (`c73_pf_lookfps`): 58.3 to 60.2 fps at 3,000, 1,200, 600, 120 and 30 m/px in
  both looks; the worst frame 117 ms once (Classic, 120 m/px) (`critic/c73_pf_lookfps.log`). Run 72's own world had
  52 to 56.5 fps at 120 and 30 m/px; new world, not compared.
- **`tools/diag/lookFps.ts` on the same world:** 58.6 to 59.6 forced frames/s at every tier, p95 17.9 to 18.4 ms, a
  draw 0.9 to 3.3 ms (the longest 8.5) (`critic/c73_lookfps.log`).
- **Five years on the page, alone** (56941, heroes): 59.2 to 59.7 fps every year, the longest gap 67 ms
  (`critic/c73_lw_56941_alone.log`).
- **Touch and the individual tier:** 59.0 to 59.3 fps with and without a selection (`critic/c73_tm_touch.alone.log`);
  `c73_x_indfps 32111`: 59.3 to 60 fps at 28, 18 and 12 m/px, the worst frame 67 ms (`critic/c73_xi.log`).
- **Not 9, and one figure not to be read:** the twelve-year watch ran while thirteen sims ran beside it; its year 6
  has one gap of 3,333 ms and its years 2 to 5 run at 46.6 to 49.7 fps (`critic/c73_lw_55941.log`). Under that load
  it is no evidence of the game's; the watch alone shows nothing of it in five years, but year 6 alone was not run.

### Stability: 8 → **8** (scored afresh)

- `workerDeterminism` on 54059 and 56059: every arm the same.
- **The same world at two window sizes:** the 1942 replay with a fixed after-seed, Germany taken, 30 days: the same
  hash at the load, at the taking, at the first hour and at day 30 on two desk runs and one phone run
  (`critic/c73_detvp_desk_a.log`, `…_desk_b.log`, `…_phone_a.log`: `1181637628`).
- **Save and load:** the page's save, reloaded, the same hash twice (`critic/c73_saveload_page.56937_200.log`); a 1942
  God game headless, the same over 30 days (`critic/c73_saveload_1942god.log`); Continue the same as the unbroken game
  (`critic/c73_x_continue.56415_40_GER_60.log`).
- **Old saves (the save format and `world.ts` changed):** run 72's 7019 year-20 save loads on HEAD and runs a year
  (`e3a43678`, `critic/c73_loadold_7019.log`); run 72's 1975 replay start on HEAD ends its track with its note and runs
  30 days (`critic/c73_oldsave_1975.log`).
- **Long runs:** 20 years of 7019 and 32019 and of 7019 with heroes (`c5fc1567`, 12 heroes alive); twelve years on the
  page with 0 errors.
- 0 page errors in every probe of this run.

### Semantic zoom to unit level: 8 → **8** (scored afresh)

- `c73_z_zoom 56911`: 18 steps from 6,000 to 3 m/px following one division: the drawn units from 1,573 m/px (8,540)
  down to 64 at 3 m/px, the individual marks from 28 m/px (10,726) (`critic/c73_z_zoom.56911.log`).
- **The tiers on a front, in one game:** counters at 3,000, markers with a strength bar at 1,200 and 600 (R95), tags
  with a name and a bar at 250 and 100 (R114), the men themselves and the line of contact at 30 m/px
  (`critic/shots/c73look_56901_1600x900_d45_f0_600m.png`, `…_100m.png`, `…_30m.png`); at phone size the same
  (`critic/shots/c73phone_56903_390x844_d60_f0_100m.png`).
- The heroes at every tier (`critic/c73_hero.56425_300_hon.log`); the phone's tap on a counter opens its panel
  (`critic/c73_phz.56933_40.log`).
- **Not 9:** R73-N5 (the markers of T1 over one another), R73-N4.

### Naval warfare: 8 → **8** (scored afresh)

- **landingFuzz `--seeds 15 --first 56101`:** **0 of 90** broken, `slowClick` included.
- **Malta's 18:** 12 thrown back near Catania and 6 broken off near Palermo, row for row as run 72
  (`critic/c73_malta.log`).
- **The named `slowClick` cases:** 30041 (13.0 d against 5.9), 51101 (13.8 against 6.7) and 53125 (9.5 against 2.4) as
  run 72; **27037 no longer breaks** (0 broken) (`critic/c73_li_*.log`).
- **Run 61's bulk sets (due), against run 72's, file by file** (`critic/scripts/c73_bulkcmp.sh`):
  - the 396 named landing setups: 226 identical to run 72's line for line, 170 differ (the marches changed); 1 run
    breaks a rule where 2 did (30041 3517 g1, `slowClick`; 27037 15101 g2 is mended);
  - the 153 stuck returns: 152 identical; the one that differs is 27037, 1 broken → 0;
  - the 168 next voyages: 109 identical, 59 differ; the same three runs break as in run 72 (30041, 31157 and 31175,
    3517 g1), each on `slowClick` (14.3 d against 7.3, 18.1 d against 11.1: `critic/c73_li_31157_g1.log`,
    `critic/c73_li_31175_g1.log`).
  - No rule but `slowClick` is broken in the 717 runs (`critic/c73_liab_named_cmp.txt`, `critic/c73_sr_cmp.txt`,
    `critic/c73_nv_cmp.txt`).
- **Sea battles:** 56061, 54 battles in three years, 54 of 54 seen at their camera, 0 page errors
  (`critic/c73_sbl_56061.log`); a sea battle's row clicked goes to it (`critic/c73_seaclick.56913.log`).
- **Not 9:** the `slowClick` cases; Malta still never held.

### Tanks: 8 → **8** (scored afresh)

- `breakthrough 56979`: 27 formations engaged by day 7 (run 72's 55979: 30) (`critic/c73_k_breakthrough.56979.log`).
- **An armoured division in a battle at 80 m/px** on the tenth day of Germany's war on Poland, its tag with the bar, the
  Maus beside it at 100 % (`critic/shots/c73c_56915_arm_0080m.png`).
- **R104a on a case of its own:** Germany the player's with its army's AI off, at war with Poland, the Maus and two
  divisions ordered to Warsaw by the mouse (`ONLYHERO=1 node critic/scripts/c73_waits.mjs 56963 GER POL warsaw 10`):
  the Maus goes from cell x 1,100 to 1,126 in nine days, some fifteen cells into Poland, never standing at the border,
  and on the ninth day "Maus: not done: it met the enemy and stopped to fight" (`critic/c73_waits_56963_hero.log`).
  R104b's line ("it waits at the front") did not come up in either of my two cases.
- `heroBattle 56081`: the P.100 in battle 48 of 466 days at war (`critic/c73_heroBattle_56081.log`). `heroCeiling` on
  ten seeds was left out for time; ADR-795's figure is carried.

### Aircraft: 8 (carried from run 72; no file of the air war changed)

- Checked: `c73_pl_planes 56925`: the wings' marks at every tier in both looks (42 at 3,000 m/px to 1 at 25);
  `c73_w_wing 56927`: a followed wing flying with its mark in 57 of 57 samples at 3,000 m/px, median 0 px from it
  (`critic/c73_pl_planes.56925_GER_POL_5373.log`, `critic/c73_w_wing.56927.log`).

### AI nuclear use: 8 (carried from run 72; no file of the nuclear rules changed)

- **Checked, because the wars around the bombs changed: launches over 22 years on ten seeds, both commits.** Run 72's
  commit (its three seeds, 53501, and six new ones in the worktree): 4, 10, 0, 17, 10, 44, 0, 2, 11, 7 = 105, on 8 of
  10 seeds. HEAD, the same seeds: 33, 2, 0, 2, 0, 11, 0, 10, 23, 11 = 92, on 7 of 10 (`critic/c73_nc_*.log`,
  `critic/c73_ncold_*.log`, `critic/c72_nc_*.log`, `critic/c73_nukeIntercepts_53501.log`). No fewer by what ten seeds
  can show.
- **A strike on the page:** Poland on Berlin, 22 February 1938: the game pauses, "Poland struck Germany with an atomic
  bomb near Berlin: 334,000 civilians killed; 301 men lost", Go to (`critic/shots/c73gdbg_56921_99_stuck.png`). HEAD's
  7019 year-20 save shows none in 400 days of the page (`critic/c73_an_ainuke.7019_*.log`), as run 72's plain saves.

## Blocking issues

None.

## Non-blocking issues (prioritised)

1. **R73-N1 (UI, R110): the wars a played nation leads are off the banners.**
   - **The case:** `AFTER=4242 node critic/scripts/c73_bannerOwn.mjs 1942 GER Germany 150`: 0 of the three wars
     Germany leads on the closed row on days 30 to 150, 0 of them among the six that "+8" opens; on run 72's build
     (`BASE=http://127.0.0.1:5374`, `critic/c72_dist`) 3 of 3 at every sample.
   - **Seen fixed when** that probe prints "of the player's on the banners" over 0 at every sample.
2. **R73-N2 (diplomacy, stats; R97b, R103): a massing is told nowhere.** `node critic/scripts/c73_massSeen.mjs 56211
   'Soviet Union' Romania 1218,300 40,55,65,72,75`: no ticker or History row and no arrow before the declaration.
   **Seen fixed when** that probe's "history of the two" or "massing words" is not empty on day 55 or 65.
3. **R73-N3 (emergent): small worlds wait longer or for ever (the cause not read; R97b is the likely rule).**
   `npx tsx tools/diag/fewNationWars.ts 2 55421 6 10`: 55426 no war in ten years (run 72: day 27, 6 wars), 55423 none
   (day 2,323); `warOpening.ts` 56211, 56213, 56215: Brazil on Colombia given up "late" on each. **Seen fixed when**
   55426 and 55421 have their first war within a year, as on run 72's commit.
4. **R73-N4 (map; R72-N4's first half): hero tags on counters in play.** `node critic/scripts/c73_look.mjs 56901 1600
   900 45,180,400`: the day-400 Europe at 6,000 m/px. **Seen fixed when** no hero's tag covers a counter's number
   there (`critic/shots/c73look_56901_1600x900_d400_2eur6000.png`).
5. **R73-N5 (map, zoom; old): markers over one another at 1,200 to 1,800 m/px.** `node critic/scripts/c73_markers.mjs
   56951 head 1600 900 1675,372 10,20,30 1800,1200,600`: 47 pairs of 71 on day 20 at 1,800. **Seen fixed when** the
   pairs at 1,800 are under a quarter of the markers on each day.
6. **R73-N6 (UI, phone):** opened banners cover the ticker; the cue covers "Ranking".
   `node critic/scripts/c73_look.mjs 56903 390 844 60,240 phone`.
7. **Wars with nothing in their first month:** 16 of 111 (`tools/diag/warOpening.ts … 56211 56213 56215`).
8. **`slowClick` (ADR-914):** three named cases as run 72 (30041, 51101, 53125) and two more of the next-voyage set
   (31157, 31175), as run 72; 27037 mended. This run's rate on new seeds: 0 of 90 (landingFuzz 56101–56129).
9. **Small things:** "1202: not done, no water there" (a fleet by its number); "COMMUNIST CHINA" under its
    capital's flag.

## Run 72's cases re-run

| Run 72 case | Run 72 (`2ae30ec6`) | Run 73 (`a9814c43`) | Evidence |
|---|---|---|---|
| R72-N1 `capsurvey` | 7 of 154 in 1975 away from a capital they own (Tashkent, Cayenne…) | **fixed**: 2 of 154, the timeline's two | `critic/c73_capsurvey.log` |
| R72-N1 on the page, `ev91 1975` | "Tashkent · capital, Soviet Union"; Korea's flags at Pusan and Rason | **fixed**: "Moscow · capital", "Seoul · capital" | `critic/c73_ev_1975_999.json` |
| R72-N1 `heroPlace 1975` | T-42 at Tashkent, Char 2C at Cayenne | **fixed**: Moscow, Paris | `critic/c73_heroPlace_1975.log` |
| R72-N2 `histnames 1991 replay 1938 1991 28` | "near Tver" (1941), "near Kaliningrad" (1945) | **fixed** for 1941: "near Kalinin"; the 1945 row is gone from the track | `critic/c73_hn_1991_*.json` |
| R72-N3 `ev91 1990` | Salisbury, Tananarive, Bathurst, Dacca, Canton | **fixed**: Harare, Antananarivo, Banjul, Dhaka, Guangzhou | `critic/c73_ev_1990_999.json` |
| R72-N4 `heropanel 55929` | tags piled at Relations' edge | **fixed** with a panel; tags on counters in play remain (R73-N4) | `critic/shots/c72hp_55929_12000_1relations.png` (HEAD's) |
| `slowClick` named four | 4 broken | 3 broken, the same figures; 27037 0 | `critic/c73_li_*.log` |
| Small worlds: `few3 55404` | no war in ten years | the same | `critic/c73_few3_55.log` |
| `few2 55421`, `54421` | 5 of 6, 4 of 6 with a war | 3 of 6, 4 of 6 (R73-N3) | `critic/c73_few2_*.log` |
| `few3 53401`, `55401` (51401 not run) | 6 of 6, 4 of 6 | 6 of 6, 4 of 6; first wars later | `critic/c73_few3_*.log` |
| `few60 55431` | 113, 107, 108 wars | 91, 87, 56 | `critic/c73_few60_55.log` |
| `warlong 1942 54601 god` | peace at 90 on 9 Aug 1942 | at 90 on 18 Sep 1942 | `critic/c73_warlong_1942god_54601.log` |
| `takescore 1942 GER 240` | Germany's wars on the banners to day 210 | to day 60; none from day 90 (R73-N1) | `critic/c73_ts_1942_GER_240_1600x900.json` |
| `godpeace 1942 JAP` | "Japan made peace with United States" | the same | `critic/c73_godpeace.*.log` |
| `freewar` 1941, 1942, 1944 | 0 peaces in hour 1 | 0 | `critic/c73_freewar_*.log` |
| `free` 51501, 51505 | 0 | 0 | `critic/c73_free_*_free.log` |
| `blocend 54611`, `heldAtEnd 54311`, `heldfree 1946`, `clampend` | 0, 0, 0, none at ±100 | the same | `critic/c73_blocend_54611.log` |
| `undo2 41211`, `undo2y 51231` | 0 px; nuke 10,010 px | 0 px; **nuke 9 px** | `critic/c73_undo2_pix.txt` |
| Run 61's 396 setups, 153 returns, 168 voyages | 2, 1, 3 broken | 1, 0, 3 broken, all `slowClick`; 226, 152 and 109 runs identical | `critic/c73_*_cmp.txt` |
| Malta's 18 | 12 thrown back, 6 broke off | the same rows | `critic/c73_malta.log` |
| landingFuzz (new seeds) | 0 of 90 | 0 of 90 | `critic/c73_landingFuzz.log` |
| `farConquests 0` | 9.2, 11.0 far per 100 | 10.2, 10.4 | `critic/c73_farc_0_*.log` |
| `firstdecl` | 0 over 6,000 km of 96, 99 | 0 of 53, 59 | `critic/c73_firstdecl*.log` |
| `piles` (15 seeds), `pileSides 51` | 122 wars at day 365, five seeds with one over 4:1; 0 | 90 wars, none over 4:1; 0 | `critic/c73_piles_*.log` |
| `workerDeterminism 54059` | `459be807` on every arm | `7733f316` on every arm | `critic/c73_wd_54059.log` |
| 7019, 32019, 20 years | `d28412a4`, `11ad91b5` | `f0783b09`, `37285b1d` (the sim changed) | `critic/c73_seed*_save.log` |
| `loadold` 7019 (run 72's save) | — | loads, runs a year (`e3a43678`) | `critic/c73_loadold_7019.log` |
| `afterTrack 55601`, `37601` | the leaders opposed 417 days; 0 | 533 days (`blocend 55601`: 0 broken); 0 | `critic/c73_atx2_55601.log` |
| `nukecount` 55501, 55503, 55507; `nukeIntercepts 53501` | 4, 10, 0; 17 launches | 33, 2, 0; 2 | `critic/c73_nc_*.log` |
| Tick, seed 99, alone | 2.293 ms | 1.884 ms; year 1 at the pin | `critic/c73_tick99.log` |
| Tick, seed 99 with heroes, alone | 2.363 ms | 1.750 ms | `critic/c73_tick99h.log` |
| Objection: ADR-1060 empties occupied France | 146 German formations at peace in Vichy | the same (1,114,891 men) | `critic/c73_freewar_1941free.log` |

## Design objections (none blocking, no score lowered)

- **ADR-1089's give-up and bar** (ninety days, then the target barred for a year) lets a nation that cannot bring
  half its men within 300 km of a border never fight that neighbour: Brazil and Colombia on every seed I ran, and
  two-nation worlds that had a war in the first month now have none in ten years (R73-N3's figures). The user chose
  the rule and re-scoped its bar; the evidence is here for the next choice.
- **R110's "newest first"** is the user's accepted recommendation (ADR-1101), and for a game with no nation played
  it lowers no score here. The objection, for that case: a war's age says less of what to watch than its size. In
  mid-June 1944 of the replay the row is "Italy ⚔ Germany +3", "Germany +5 ⚔ United States", "Japan +2 ⚔ United
  States +16", and the Soviet war is behind "+n" (`critic/c73_x_stage.normandyD_*.log`). (The played nation's case is
  R73-N1, scored, because the decision does not cover it.)
- **ADR-1060** as run 72: 146 German formations, 1.11M men, at peace in Vichy France after a 1941 free start
  (`critic/c73_freewar_1941free.log`).
- **Heroes on by default (ADR-1070)** as run 72: not re-measured.

## Ideas from other games (not scored)

- **Hearts of Iron IV** pins the player's own wars first in its war list and marks a build-up on a border with a
  warning ("is justifying a war goal"); a line in the ticker such as "The Soviet Union is massing on Romania's border"
  would turn R97b into the tension it is.
- **Ages of Conflict** shows the largest wars by the men engaged; the closed row could be the player's wars, then the
  largest.

## Strengths (verified)

- **Run 72's capitals, names and undo are mended on their own cases**, and the nuke's undo a year on leaves 9 px where
  10,010 differed.
- **The fronts are now the clearest thing on the map**: a white-cored line at every zoom, the taken ground hatched or
  banded, arrows by side, and 342 tags on a new seed with none under the chrome and none over another; all of it at
  58 to 60 fps on a twenty-year world.
