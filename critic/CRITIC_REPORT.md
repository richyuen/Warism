# Critic report, run 76 (focused): Batches 42 and 43 (R132 to R143), on `c2440872`

## The run

- **Mode: focused.** The spawning message asks for no full run (CRITIC_PROMPT, ADR-915).
  - The last report, run 75 (full, on `e830930e`), had no blocking issue and every score at its bar: UI/UX 7, all
    others 8.
  - **Scored afresh**, because the changed files touch them: map visuals, diplomacy, emergent dynamics, stats and
    history, UI/UX, performance, stability, semantic zoom, naval, AI nukes.
  - **Carried** from run 75: God Mode, the editor, tanks, aircraft. Their named cases were run again all the same.
- **Commit judged:** `c2440872430b769d4f3262cbf98b432126defdf8`, HEAD at the start (`critic/c76_commit.txt`).
- **Time:** 07:46 to 09:55, about two hours. That is past the hour a focused run aims for, for two reasons: the sim changed, so
  the bulk landing sets (717 runs) were due; and the performance chain runs alone, last.
- **Left out for time:**
  - Run 75's 1280 × 720 and 844 × 390 monkeys. Two monkeys were run: one at desk size, one on a phone.
  - The three twelve-year watches beside the chains. One runs alone, in the performance chain.
  - Run 75's page cases with no run-76 counterpart:
    - **Title and replay:** `x_editor`, `x_badfiles`, `title2`, `x_title`, `x_replaycard`, `x_closeblock`,
      `x_trackend91`, `x_lateworld`, `x_building`, `x_buildpause`, `x_play` (random large), `x_few`, `rw_random`.
    - **Map and input:** `x_mouse`, `x_keys`, `resize`, `stripe`, `tagsChrome`.
    - **History and God:** `ev91`, `histnames`, `h_godtab`, `h_interv`, `waits`, `charts`, `kwhist`.
    - **Massing and orders:** `massOff`/`massHist` (`mo`), `whotold`, `warsof`.
    - **Units:** `w_wing`, `phz`, `hero`.
    - **Landings:** `lland`, `turnback`, `nvpage`, `sb_seaballs`, `saveload_page`, `r83`.
    - The heroes' 60-nation and `new` cases.
  - The undo's pixel comparison.
- **Run late, after the chains:** `p_phone` (the bar gained a button) and `an_ainuke 58505`.

### What changed since run 75

- **Size:** 43 commits; 34 files under `src/`.
- **Batch 42** (released as `release-2026-11-17`):
  - **R132:** the banners keep their places for 20 days. ADR-1114 (b), the user's decision.
  - **R133:** a bomber stopped short with a warhead is told (ADR-1115).
  - **R134:** a call-off is told at the hour's end (ADR-1116).
  - **R135:** the banner's title says who fights to the death.
  - **R136:** `seaBattles` lists only the fleets that fought.
  - **R137:** one Major Battle at a place in an hour (ADR-1117).
  - **R125b:** the markers' tight rule at every zoom of T1 (ADR-1113).
- **Batch 43:**
  - **R138:** the nightly's jobs.
  - **R139:** a war across the sea is declared only with a lift (ADR-1119).
  - **R140:** closed with HEAD's figures (ADR-1120 (b)).
  - **R141:** a History row flies to its place (ADR-1121).
  - **R142:** the director (ADR-1122).
  - **R143a and R143b:** the borders' record and its time-lapse (ADR-1123, ADR-1124).

### Due because the sim changed

- `git diff --stat e830930e HEAD -- src/sim data public/data` lists 9 files: `ai/seaLift.ts` (new), `ai/strategic.ts`,
  `ai/massing.ts`, `systems/majorBattles.ts`, `borderLog.ts` (new), `history.ts`, `sim.ts`, `tick.ts`, `world.ts`.
- Plain 1938 is not carried: the 20-year worlds differ.
  - 7019 ends at `4931216a` with 73 nations (run 75: `068f1066`, 80).
  - 32019 ends at `deec2aee` with 77 (run 75: `a75df50c`, 84).
- The bulk sets and Malta were run again.
- The seeded worlds of every named case changed with the sim. Where a figure moved I ran the same case on both builds at
  the same time. Where only HEAD could be run, the figure is given as "the world differs".

### Setup

- **Builds and servers:**
  - HEAD's build is in `critic/c76_dist` (exit 0). The replay's 54 starts were built from HEAD (`npm run saves`, 802 s,
    exit 0) and copied in (`critic/scripts/c76_build.sh`). Served on 127.0.0.1:5399.
  - Run 75's build (`critic/c75_dist`, `e830930e`) on 5398, for the comparisons.
  - R132's own commit `8d3b417e`, built in a worktree (`critic/wt`) into `critic/c76_r132dist`, on 5397 for the
    banners' case.
  - R125b's commit `32f1e5b7`, which has run 75's sim, built the same way into `critic/c76_r125bdist`, on 5397 for the
    heroes' wheel case.
  - In both worktrees the `node_modules` junction was removed before `git worktree remove`.
- **Browser:** Playwright Chromium on the GPU.
- **New seed family:** 59xxx.
- **Chains:**
  - `c76_runNamed.sh`: 107 headless cases six at a time (`c76_jobsAll.txt`), then `landingFuzz --seeds 15 --first 59101`.
  - `c76_chainS.sh`: the cases that use the built years.
  - `c76_chainBulk.sh`: run 61's bulk sets four at a time, and Malta.
  - `c76_liftMore.sh`: six more checker seeds for R139.
  - The page lanes `c76_laneB` (banners), `c76_laneC` (markers, the editor's nuke, monkeys), `c76_laneD` (tiers, God,
    sea), `c76_laneE` (run 75's named page cases), `c76_laneR` (R132's own build) and `c76_laneZ` (the heroes' counters,
    both builds).
  - `c76_chainPerf.sh`: alone, last.
- **New probes:**
  - R143b: `c76_timeLapse.mjs`, `c76_tlMore.mjs`, `c76_tlMonths.mjs`.
  - R142: `c76_director.mjs`, `c76_dirHand.mjs`.
  - R141: `c76_histPlace.mjs`.
  - R135: `c76_deathTitle.mjs`.
  - `c76_woCount.mjs`: run 75's counts over a `warOpening` JSON.

### Probe failures of mine, disclosed

- **`c76_afterTrack` crashed** on a cache folder I had not made (`critic/c76_atcache`). I made it and ran 55601 and 37601
  again; both ran whole.
- **Stale starts.** My first `godpeace 1942` and `tlMore replay 1975` ran before the fresh starts were copied into the
  build, so they used the stale local ones. Both were run again; only the second runs are cited.
- **A missed click.** In `c76_timeLapse.mjs` the click meant for "a cell owned by another nation then" missed its cell:
  the camera stayed at the world's zoom. Only `c76_tlMore.mjs cell 59943` is cited for the tooltip and the click.
- **The toy world** has no History, so `tlMore toy` timed out. That is not a finding.
- **Shot names.** `c76_look.mjs` still names its shots `c75look_<seed>_*`. Those of seeds 59901 and 59903 are this run's.

### At the end

- My preview servers (5399, 5398, 5397) were stopped by the process ids that held their ports. A `vite preview` on 4174
  that is not mine was left.
- The copies of run 75's scripts this run did not use were removed from `critic/scripts/`. The 94 `c76_*` files left are
  the ones run, or the ones they call.
- No probe or browser of mine is left.
- The worktree is removed (`git worktree list`: main only).
- `git status` shows nothing new outside `critic/`; the eight untracked PNGs under `docs/evidence/7.132/` were there
  before.
- **Writes outside `critic/` by tools at their defaults:** `npm run sim` to `.cache/runs/`, `landingFuzz` to
  `.cache/landingFuzz/`, `trackFronts` to `.cache/trackFronts_*.json`.
- **Memory:** down to 0.7 GB free at 08:26, while `landingRows all` alone held 10 GB. I stopped the 5397 and 5398
  servers early; nothing was reaped.

## Verdict

**One blocking issue: R76-B1, the `lift` rule's own checker reports it broken.**
- R139 added the rule (no war across the sea without a lift) and its checker (`lift` in `diploInvariants`).
- On two of run 75's named checker seeds, the checker reports 5 wars declared across the sea with nothing to lift:
  - **33501** (plain 1938, five years): 2.
  - **58011** (random diplomacy with heroes, ten years): 3.
- Run 75 had 0 broken on both, but that was before the rule existed.
- On the 11 runs of new seeds, 0 broken: 18 of the 20 `diploInvariants` runs of this report are clean.
- Traced (`critic/c76_ev_33501_*.log`):
  - Lithuania's war on Germany is a puppet's revolt: `PuppetRevolt LIT GER`, then `WarDeclared LIT GER`, in hour 0 of
    day 943.
  - Hungary's war on Italy, on day 1415, has no revolt and no massing before it.
  - So at least one of the doors to war that R139 did not close is a plain declaration.
- The brief makes every rule a checker reports broken blocking, other than `slowClick`.

**Run 75's three findings are fixed on their own probes:**
- **R75-N1, the banners' churn.** At ×5 the row changed 4, 5 and 4 times in a minute, against 41, 27 and 27 on run 75's
  build run beside it. The banner under a resting cursor changed 2, 3 and 0 times.
- **R75-N2, the silent intercept.** The stopped bomber is told: "Poland's bomber carrying a warhead was stopped short of
  its target near Berlin: no burst".
- **R75-N3, a call-off at war.** No call-off of a nation at war with the target, on 15 seeds.

**Also fixed:** R75-N5 (wars with nothing taken), R75-N6 (a war at ±100 says why it goes on), R75-N8 (`seaBattlesLook`
53 of 53) and run 75's objection to ADR-1110.

**But R132's own bar for the row is not held on HEAD.**
- `bannerRank 57901 150` gives 59, 55, 63 and 48 quiet banner-days behind "+n". The user's bar (ADR-1114) is under 50,
  and an 8 needed under 44.
- R132's own build, run beside it, gives 33 and 36.
- The banner code is unchanged since R132; the world of 57901 moved with R139.
- So **UI/UX stays at 7**.

**Why the others are not blocking:**
- R132's bar holds at its own commit (33, 36), and its code is unchanged since. The figure moved with the world.
- R76-N1's clicks are in no list of SPEC's hand-back acts (the wheel, a press on the map, a double click, a camera key).
  They are judged as behaviour the design does not cover.

**No score moves.** Each dimension scored afresh holds its run-75 score. The new features are sound where they were
aimed, and each has a hole a player meets:
- **The director** pulls the camera away within 4.5 s of a click on a ticker row, a banner or a History link: 1 or 2
  cuts in 9 s after each.
- **The time-lapse** runs the game under it when Space is pressed: 96 hours ran while the map showed January 1938. The
  tooltip and the click name the owners of now, not of the month shown.
- **R139's lift** brings back Japan's first wars 9,000 km away: 6 of 108 first-60-day declarations on run 75's twenty
  seeds, where run 75 had 0 of 112. With the rule switched off on HEAD, 0.

## Scores

### Map visuals and readability: 8 → **8** (afresh)

**What I tested:**
- `look` at desk and phone size on two new seeds (59901, 59903).
- Run 75's `markers` case on both builds (58951), and on HEAD (56951).
- The time-lapse's map; the window at phone size; the relations graph at both sizes.

**Evidence for 8:**
- **Run 75's design objection to ADR-1110 is answered by R125b.** On 58951, run on both builds at the same time
  (`node critic/scripts/c76_markers.mjs 58951 <tag> 1600 900 1675,372 30,60 1800,1300,1150,1000,600`):

  | 58951, pairs of markers on one another | run 75's build (`e830930e`) | HEAD |
  |---|---|---|
  | day 30: 1,800 / 1,300 / 1,150 / 1,000 / 600 m/px | 10 / 6 / **21** / 11 / 9 | 11 / 9 / **10** / 5 / 1 |
  | day 60: the same zooms | 12 / 8 / **21** / 15 / 12 | 13 / 12 / **14** / 7 / 4 |

  The heap just inside 1,200 m/px is gone: 10 and 14 pairs where 21 and 21. Run 75's build gives run 75's figures to
  the pair (`critic/c76_mk_headn_desk.log`, `critic/c76_mk_c75n_desk.log`). On 56951 at 1,150 m/px HEAD has 1, 2 and 6
  pairs (`critic/c76_mk_head_desk.log`).
- **The fronts read at every tier** on a new seed. Italy's and Germany's divisions at Munich and Salzburg at 250 m/px
  show the hatched land, the line of contact and the named divisions in contact
  (`critic/shots/c75look_59901_1600x900_d180_f0_250m.png`; the probe's shot names are run 75's, the seed is new).
  Europe at 6,000 m/px is in `critic/shots/c75look_59901_1600x900_d400_2eur6000.png`. 0 page errors.
- **The time-lapse's map** shows each nation in its game colour, and the same map at its last step as the game's
  (`critic/shots/c76tl_head_59941_1600x900_1end.png` beside `…_0now.png`). The units, names and fronts are left off.
- **The relations graph** on a phone has 79 nodes, each tie read back from the panel, 0 errors
  (`critic/c76_rg_relations.59931.log`, `critic/shots/c76rg_59931_phone_d730.png`).

**Not 9:**
- **The time-lapse's map has no names on it** (as SPEC has it), so a watcher cannot tell who is who in 1938 but by
  colour. The tooltip that would tell names the owner of now: R76-N2 (stats and history).
- **On a phone the time-lapse's plate covers the ticker's second row:** "Mengjiang was destroyed" half under the plate
  (`critic/shots/c76tl_head_59945_390x844_8mid.png`).
- Run 75's small things stand: the heroes' names over Europe on a phone at the world's zoom (ADR-1111), and
  "COMMUNIST CHINA" under its capital's flag.

### Diplomacy, war, alliance, puppet, revolt depth: 8 → **8** (afresh; R76-B1 blocking)

**Evidence for 8:**
- **Every checker 0 broken on the new seeds, `lift` included:**
  - `diploInvariants` on 59001 (1938), 59003 (random diplomacy), 59005 (heroes), 59007 (random world), 59013, 59015,
    59017 (heroes), 59019, 59021 (random diplomacy, heroes) and 59023, five years each; 59009 (heroes), ten years.
  - `worldInvariants` on 59051, 59053 (heroes), 59055 (random world) and 59057 (random diplomacy), five years.
  - Logs: `critic/c76_diploinv_59*.log`, `critic/c76_diploinv_lift_*.log`, `critic/c76_wi_59*.log`.
- **Run 75's checker seeds, 0 broken but two:**
  - 0 broken: 58001, 58003, 58005, 58007, 58009 (10 y), 58013, 57001; `worldInvariants` 58051 to 58065 and 36009,
    57051.
  - The two that break are R76-B1 below.
- **R75-N3 fixed (R134).** `c76_massTold.ts` on run 75's twelve seeds and three new ones (59611, 59613, 59615) finds
  "CALLED OFF BUT AT WAR" 0 times; it was 1.
  - The given-up massings with no row are each "at war with it: true", with one exception: France on Switzerland, whose
    target was gone (`critic/c76_massTold_*.log`).
  - None was told twice.
  - A game saved with a massing told loads with the same rows (`critic/c76_massTold_sl.log`).
- **R75-N5 fixed (R139).** Wars with no cell held by either side at day 30, by `node critic/scripts/c76_woCount.mjs`
  over `tools/diag/warOpening.ts --years 3`, the same seeds on the two commits:

  | seeds | run 75 (`e830930e`) | HEAD |
  |---|---|---|
  | 58211, 58213, 58215 | 20 of 103 (19.4 %) | **3 of 96 (3.1 %)** |
  | 56211, 56213, 56215 | 20 of 108 (18.5 %) | **4 of 85 (4.7 %)** |
  | 57211, 57213, 57215 | 11 of 82 (13.4 %) | **7 of 95 (7.4 %)** |
  | 59211, 59213, 59215 (new) | not run | 11 of 102 (10.8 %) |

  ADR-1094's bars hold on the twelve seeds: the attacker with no man near in 23 of 264 (8.7 %, bar 15 %); the defender
  ahead in 33 of 264 (12.5 %, bar 15 %). Files: `critic/c76_warOpening*.json`, read beside run 75's.
- **R75-N6 fixed (R135).** On 7019, day 400, the Japanese-Chinese banner at −100 has the title "China fights to the
  death: no peace is made, whatever the score; the war ends when one side holds three quarters of the other's land, or
  after five years" (`critic/c76_dt_7019.log`, `critic/shots/c76dt_7019_400_1600x900.png`).
  - The title is borne out: on 7019 that war stood at ±100 for 947 days on end and ended on day 1824, its fifth year
    (`npx tsx critic/scripts/c76_warAt100.ts 7019 7 off`, `critic/c76_war100_7019.log`; seven years where run 75 ran
    five, so the day counts are not run 75's).
- **The same-seed lines that did not move:** `pragueFall` 58201 and 58203 (days 13 and 14); `piles` on fifteen seeds
  (none over 4:1); `blocend 54611` (0 bloc lines); `heldfree 1946` (0); `repulse` 55071 and 58073 (0);
  `saveload 1942 god` (`518d5831` both arms); `workerDeterminism` 54059 and 58059 (one hash each on every arm).
- **The invaded front:** `frontArrivals 58205 GER,POL 60` puts 94 % of Poland's 56,000 men at the German front, holding
  72 German cells. `58207 JAP,CHI` puts 94 % of China's 687,000 at the Japanese front.

**Not 9:**
- **R76-B1** (blocking, below).
- **R76-N5: Japan opens wars 9,000 km away again.** `c76_firstdecl.ts 60` on the same twenty seeds as run 75 (39821 to
  39839, 55821 to 55839) finds 6 first-60-day declarations over 6,000 km on HEAD, against 0 of 53 and 0 of 59 in run 75:
  - Japan on Iraq on day 9 (39829) and day 16;
  - on Iran on days 9 and 23;
  - on Finland on day 58;
  - on Estonia on day 58.

  Files: `critic/c76_firstdecl.log`, `critic/c76_firstdecl_55.log`. Japan on Siam, 4,997 km away, is still the first
  war on most seeds. ADR-1041 had brought these to 0 or 1 in 97.

  **The cause is shown, not inferred.** HEAD with R139's rule off (`LIFT_PROBE.off`, `npx tsx
  critic/scripts/c76_firstdeclNL.ts 60 --no-lift 39829 39837 55821 55823 55827 55831`) gives 0 of 35 over 6,000 km on
  the six seeds that printed them. With the rule on it gives 6 of 33 (`critic/c76_firstdeclNL_off.log`, `_on.log`). R139
  refuses the near target for want of a lift, and Japan's "next best" is half a world away.

  Fewer capitals are taken far away all the same: 76 on ten seeds against 109 (`critic/c76_farc_0_*.log`). This is a
  regression on the same seeds, with no rule broken; the score holds on the openings mended (R75-N5).
- **A false alarm told again within two months:** Britain's massing on Mozambique is told again 50 days after it was
  called off (seed 56211, day 814; `critic/c76_massTold_a.log`). Run 75 found a repeat only in a three-nation world,
  988 days and more apart.
- **As in run 75, a war at ±100 stays there for years:** 947 days on 7019. It is now told on the banner's title, but
  a phone has no hover.
- **Wars across the sea are fewer:** 203 and 219 declared in ten years after the track on 55601 and 37601, against 230
  and 239 on run 75's commit (`critic/c76_atx_*.log`). That is what R139 meant (ADR-1119: −6 %).

### Emergent world dynamics: 8 → **8** (afresh)

**Evidence for 8:**
- **Twenty years headless:**
  - Plain 1938: 7019 and 32019, 73 and 77 nations at the end.
  - With heroes: 7019 (67 nations; 14 heroes alive; 2 detonations in year 18) and 58019 (78 nations).
  - With heroes, twelve years: 58021 (74 nations).
  - Logs: `critic/c76_seed*_save.log`, `critic/c76_hero_*.log`.
- **The leaders' order changes:** in `topArea 58097` (25 years) the first three by land changed 7 times; run 75 had 4
  (`critic/c76_toparea_58097.log`).
- **Small worlds** (`fewNationWars`, ten years): the same lines as run 75 for 55421, 55401 and 53401, near it for 54421
  and 58401. Sixty nations (55431): 90 wars. New: two nations 59421 to 59426, a war in 4 of 6
  (`critic/c76_few*.log`).
- **The time-lapse shows decades:** a 1975 replay's time-lapse plays 447 months from January 1938
  (`critic/c76_tm_replay.log`, `critic/shots/c76tm_replay_1975_step0.png`).
- **The director shows the world moving** on desk size: 24 cuts in two minutes at ×5, 56 of the 57 war, battle and
  capital rows seen with nothing over them (`critic/c76dr_head_59951_1600x900.json`,
  `critic/shots/c76dr_head_59951_1600x900_060.png`: the Lithuanian front).
- **The replay's track:** stages 84; 1975 seats 2 of 154 nations away from their capital, as run 75
  (`critic/c76_tf_1938.log`, `critic/c76_capsurvey.log`).

**Not 9:**
- **Worlds that stand still:** 54425, 54426, 55424, 59421, 59423 (two nations) and 55404 (three) have no war in ten
  years.
- **The blocs' leaders are never at war** in ten years after the track on 55601 (run 75: 533 days) and 37601
  (`critic/c76_atx_*.log`).
- **At top speed the director falls behind:** in two minutes at "Max" (934 days of 59953) it was handed 109 rows and
  saw 84 (77 %), the rest passed over as old news. At ×5 it was handed 57 rows in 120 days and saw 56
  (`critic/c76dr_head_59953_1600x900_s99.json`, `critic/c76dr_head_59951_1600x900.json`).

### God Mode: 8 → **8** (carried)

Run again on HEAD, 0 errors each:
- `q_god_tools 59919`: a revolt, a new nation, a city founded and a raze, each in the ticker.
- `a_god_nuke 59917`: "A bomb fell from the heavens on France near Paris: a hydrogen bomb, 3,329,000 civilians killed".
- `undo2 41211` and `undo2y 51231`: the nuke, the revolt, the nation, the city and the raze, each undone.
- `godpeace 1942 GER` (phone) and `JAP`: "Germany made peace with Soviet Union" with "History's course ended at your first
  intervention".
- `god42 1942 replay`: the note that a God act ends the replay.
- The "Major battle began near Hammerfest" that run 75 found twice under 1 January 1942 is now once (R137;
  `critic/shots/c76gp_1942_GER_SovietUnion_390x844_2history.png`).

### Editor and scenarios: 8 → **8** (carried)

- `g_editor 58921`: Poland given ten warheads. History now has "17 February 1938 Poland's bomber carrying a warhead was
  stopped short of its target near Berlin: no burst", then the strike of the 18th (`critic/c76_g_editor.58921.log`).
- `x_continue 58415`, `x_stage normandyD`, `oldsave 1975` (run 75's 1975 start runs 30 days on HEAD).
- The replay's free starts 1942 to 1991: 0 broken lines (`critic/c76_free_*_free.log`).
- Not run this time: `x_editor`, `x_badfiles`, `title2`.

### Stats and history: 8 → **8** (afresh)

**Evidence for 8:**
- **R75-N2 fixed (R133):** `npx tsx critic/scripts/c76_interceptTold.ts` reports `NukeIntercepted` in History's kinds,
  in the ticker's and among a war's kinds, with 2 strings (run 75: false, false, 0). Seen on the page in the editor's
  game above.
- **R141, a History row flies to its place** (`c76_histPlace.mjs 59961 300`, desk and phone): 11 kinds with a link —
  sea battle, capital, massing, hero lost and back, convoys, air war and raids, Major Battle begun and ended,
  annexation. Each click put the place in the view on the map's canvas, at both sizes. On the phone the panel closed.
  Wars declared and joined have no link (`critic/c76hp_59961_*.json`,
  `critic/shots/c76hp_59961_1600x900_NationAnnexed.png`).
- **R143a and R143b, the borders' record and its time-lapse:**
  - **Other months.** The builder's spec checks only 1 January. On a new seed the time-lapse's map on 1 July and
    1 October 1938, 1 March and 1 August 1939 is the page's own map of that hour, 0 cells unlike. That holds after a
    page save and load in mid-month (`node critic/scripts/c76_tlMonths.mjs 59947 640`,
    `critic/c76_tlMonths_59947.json`).
  - **Random world.** It has the button and plays (`critic/c76_tm_random.log`).
  - **Replay.** A 1975 replay plays from 1938.
  - **The record's growth** (`tools/diag/borderLog.ts --seed 59097 --years 20`; 20 years, not the AT's 50):
    - 19 of 19 maps of 1 January alike, in 228 frames.
    - The record is 2.53 % of the packed save; the bar is 7 % at 50 years.
    - A cut takes 4.9 ms median and 8.8 ms at most, beside five other sims.
    - Log: `critic/c76_borderLog_59097.log`.
- **History of a twenty-year world** (`hist 32019` on HEAD's twenty-year save):
  - 1,911 events, each of 30 kinds filtered in 157 to 185 ms.
  - "Massing called off" 6, "Nuclear strike" 1.
  - The charts open from the ranking.
  - Log: `critic/c76_hist.32019_critic_c76_seed32019_y20.bin.log`.

**Not 9 (R76-N2, R76-N4):**
- **R76-N2: on the time-lapse's map the tooltip and the click are of now.**
  - On 59943 at step 0 (January 1938), the mouse rests on a region shown in Norway's colour. The tooltip says "Soviet
    Union", and a click opens the Soviet Union's panel ("Sovetsky Soyuz returns in 35 days").
  - Files: `critic/c76tm_cell_59943.json`, `critic/shots/c76tm_cell_59943_hover.png`,
    `critic/shots/c76tm_cell_59943_click.png`.
  - The names are off the map by design (SPEC), so the one way to ask is wrong.
- **R76-N4: a game saved before R143 plays only the months since its load.**
  - Run 75's 7019 save loaded and run 40 days gives a time-lapse from January 1958 to February 1958 (2 steps).
  - The button's title still says "Play the borders from the start to now".
  - Files: `critic/c76_tm_old.log`, `critic/shots/c76tm_old_criticc75seed7019y20bin_step0.png`.
- History has rows that are a bare place name ("31 December 1941 Northern Malaya", "↳ Northern Luzon", "↳ Davao",
  "25 December 1941 Hong Kong"). They were in run 75's shot too
  (`critic/shots/c76gp_1942_GER_SovietUnion_390x844_2history.png`).

### UI/UX and polish: 7 → **7** (afresh)

**R75-N1 is fixed** on its own probe, both builds at the same time
(`BASE=<build> node critic/scripts/c76_bannerFlip.mjs <seed> <day> <tag> 60`; `critic/c76_bf_*.log`):

| at ×5 for a minute | run 75's build (`e830930e`) | HEAD | run 75's bar |
|---|---|---|---|
| 57901, day 150: the row changed; under the resting cursor | 41; 22 | **4; 2** | 10; 2 |
| 58901, day 200 | 27; 17 | **4; 0** | 10; 2 |
| 57903, day 120 | 27; 2 | **5; 3** | |
| a banner's place held under 2 s (57901, 58901, 57903) | 74, 24, 35 | **0, 0, 0** | |

**What holds it at 7: the bar's third measure, R74-N3's.** `bannerRank 57901 150` counts quiet banner-days behind "+n".

| | R132's own build (`8d3b417e`) | HEAD | the bar |
|---|---|---|---|
| 57901 | 33, 36 | **59, 55, 63, 48** | under 50 (ADR-1114, the user's); under 44 for an 8 (run 75) |
| 58901 | | **72** | |
| 59901 (new) | | 4 | |

- Run 75's build had 0 here, with R75-N1's churn.
- `git diff 8d3b417e HEAD -- src/ui/bannerOrder.ts src/ui/WarBanners.tsx src/worker/warsFought.ts` is empty. The world
  of 57901 moved with R139, and the rule that met its bar on R132's world does not meet it on HEAD's.
- Files: `critic/c76_br_*.log`, `critic/c76_br_r132_*.log`.

**R76-N1: the director takes the camera back from a click.**

| act, director on, game at ×5 | still on | cuts in the next 9 s | the camera then from where the act put it |
|---|---|---|---|
| wheel; drag (mouse, and a touch drag on a phone); arrow key | off | 0 | 0 px |
| a ticker row ("Germany captured Czechoslovakia's capital") | **on** | **2** | 2,058 px |
| a war banner (to its largest battle) | **on** | **1** | 564,817 px (another continent) |
| a History row's link ("A major battle began near Kovel") | **on** | **2** | 11,211 px |

- The probe is `node critic/scripts/c76_dirHand.mjs 59955 120`, and `… 390 844 touch` on a phone. Files:
  `critic/c76_dh_59955_desk.log`, `critic/c76_dh_59955_phone.log`, `critic/shots/c76dh_59955_1600x900_banner.png`.
- The player clicks to look at a place and is pulled away from it within 4.5 s.
- R142's item says "the player's pan, zoom or click hands the camera back". SPEC lists the wheel, a press on the map, a
  double click and a camera key. The ticker, banner and History clicks are in neither list, and are judged here as any
  other behaviour.

**R76-N3: the director flies under the panel the player has open.**
- With History open it counts 56 of 57 rows "seen".
- On a desk, 53 of those were under the panel (`history-go` 38, `history-row` 14, `history-panel` 1).
- On a phone, 56 of 56 were under it.
- Files: `critic/c76dr_head_59951_1600x900_history.json`, `critic/c76dr_head_59951_390x844_history.json`.
- R141 built `showPlaceClear` for exactly this; the director does not use it.

**R76-N2b: Space runs the game under the time-lapse.**
- The time-lapse pauses the game (SPEC).
- Space, the pause key, which a watcher presses to play or stop the lapse, resumes the game under it. 96 hours ran in 4 s
  while the map showed January 1938 and the clock went from 5 to 9 February 1939.
- Desk: `critic/shots/c76tl_head_59941_1600x900_5space.png`, `critic/c76_tl_head_59941_1600x900.json`. Phone:
  `critic/c76_tl_head_59945_390x844.json`.
- Escape does not close the plate (`afterEscape`: still open).

**What holds well:**
- `takescore 1942 GER 240`, `bannerOwn 1942 GER` (desk and phone): Germany's three wars on the row at every sample
  (`critic/c76_bo_1942_GER_after4242*.log`).
- `peacebtn 58217` on a phone, `heropanel 55929`, `massSeen 56211` (the Soviet row).
- **The phone's layout with the director's new button** (`c76_p_phone.mjs`): 10 states, 0 controls off the screen, 0
  clipped (`critic/c76_p_phone.log`).
- 0 page errors in every probe output.

**What an 8 needs:**
- `BASE=<build> node critic/scripts/c76_bannerRank.mjs 57901 150`, three runs, each under 44 quiet banner-days behind
  "+n", with `c76_bannerFlip.mjs 57901 150 head 60` and `… 58901 200 head 60` still at 10 or fewer changes and 2 or
  fewer under the cursor.
- `node critic/scripts/c76_dirHand.mjs 59955 120`: the ticker, banner and History acts leave the director off, or leave
  0 cuts in the 9 s after.
- `node critic/scripts/c76_timeLapse.mjs 59941 400 head`: `ranUnderLapse` 0.

### Performance: 8 → **8** (afresh)

The page probes of lane E and my last `heroPop` ended at about 09:24, as the chain began; the tick ran with nothing else
running. Run alone, last, after every other chain (`critic/scripts/c76_chainPerf.sh`, `critic/c76_pf.status`): 09:24 to 09:50.

- **The tick, seed 99, five years:** 1.827 ms mean (run 75: 1.858), year 1 at `1aabdc7e`, the pin of R143a
  (`critic/c76_tick99.log`). With heroes: 1.670 ms (run 75: 1.738) (`critic/c76_tick99h.log`). The record's monthly cut
  adds nothing measurable; the cut itself is 4.9 ms median and 8.8 ms at most (`borderLog`, beside other jobs).
- **Frames on HEAD's 7019 year-20 world** (`c76_pf_lookfps`, five tiers in both looks and panning): 59.6 to 60.1 fps.
  The worst frames are 120 and 123 ms, once each where the look is changed to Classic (run 75: 105, 104). At
  2560 × 1440: 59.7 to 60.1 fps, worst 114 and 122 ms. At 3840 × 2160: 59.7 to 60.2, worst 119 and 112. The heroes'
  year-20 world: 59.7 to 60.1, worst 119 and 124 (`critic/c76_pf_lookfps*.log`).
- **`tools/diag/lookFps.ts`** on the same world: 58.8 to 60.1 forced frames/s, p95 17.8 to 18.3 ms; one worst frame of
  123 ms at 1,200 m/px (`critic/c76_lookfps.log`).
- **Touch and the individual tier:** 59.6 to 60.0 fps (`critic/c76_tm_touch.alone.log`). `x_indfps 32111`: 59.5 to 60
  fps, the worst frame 83 ms (`critic/c76_xi.log`).
- **Twelve years on the page, alone** (58941, heroes): 59.8 to 60 fps every year, the longest gap 83 ms, a year in 13
  to 31 s (`critic/c76_lw_58941_alone.log`).
- **The time-lapse of a twenty-year record** (HEAD's 7019 save loaded in the page; 240 months): 60.0 fps, p95 16.8 ms,
  the longest frame 16.8 ms while it plays. January 1948 is drawn in `critic/shots/c76tm_old_criticc76seed7019y20bin_at50.png`
  (`critic/c76_tm_lapse20.log`).

- **The time-lapse plays at 60 fps:** 60.0 fps, p95 16.8 ms on a 13-month record at 1600 × 900, and 60.0 and p95 16.7 on
  a phone. It opened in 102 ms (`critic/c76_tl_*.json`).
- **The director costs nothing seen:** 4.52 s between cuts at the least, at desk and phone size.
- **The markers' tight rule at T1's near end costs nothing seen:** `markerPop 56951`, wheel and glide 1,300 → 1,100 m/px,
  frames p50 16.6 to 16.8 ms, p95 19.4 to 19.9 (`critic/c76_mp_head_56951.log`).

**Not 9:**
- One frame of 112 to 124 ms where the look is changed to Classic, at every screen size (as run 75's 101 to 116).
- The first year's tick is 2.9 ms against 1.2 to 2.2 later.

### Stability: 8 → **8** (afresh)

**Evidence for 8:**
- **Random input:**
  - `c76_monkey.mjs 59803` (1600 × 900, 5 min): 1,921 acts, 724 of them on buttons (the director's switch and History's
    Time-lapse among them), 0 page errors, the game running at the end (296 frames in 5 s).
  - `59811` (390 × 844 touch): 2,028 acts, 0 errors. It left the game by Settings' title button at 252 s and started
    new games from the title, as run 75 found.
  - Files: `critic/c76_monkey_*.log`.
- **Save and load:**
  - The time-lapse's record survives a mid-month page save and load, 0 cells unlike (`critic/c76_tlMonths_59947.json`).
  - `saveload 1942 god`: `518d5831` on both arms.
  - `massTold --saveload`: the same rows.
- **Old saves:**
  - Run 75's 7019 year-20 save loads in the page and plays (`critic/c76_tm_old.log`).
  - Run 75's 1975 start runs 30 days on HEAD (`critic/c76_oldsave_1975.log`).
  - Run 75's 7019 year-20 save, headless on HEAD, runs a year (`573160d9`, 78 nations; `critic/c76_loadold_7019.log`).
- **Determinism:** `workerDeterminism` 54059 (`ed05e7b5`) and 58059 (`dd0455f1`), one hash on every arm.
- **Long runs:** twenty years headless four times, ten years of three checker runs.
- **0 page errors** in every probe output of this run.

**Not 9:** the tick of a twenty-year heroes game reaches 0.41 to 0.56 s once a year in its late years (`max 434.6`,
`558.2` in `critic/c76_hero_7019_20.log`, run beside five other sims).

### Semantic zoom to unit level: 8 → **8** (afresh)

**The heroes' counters** (`c76_heroPop.mjs`, both builds at the same time; `critic/c76_hpz_*.log`):

| | run 75's build | HEAD (the world differs) |
|---|---|---|
| 56901 d400, 57905 d200, 58905 d300: leaps zooming 9,000 → 4,000 m/px | 1, 0, 1 | 3, 1, 1 |
| the same, running 20 s at ×5 | 34, 4, 17 | **3, 8, 0** |
| panning 480 px | 2, 3, 1 | 4, 2, 2 |
| 56901 d430, by the mouse's wheel, nine notches (both builds at once, `critic/c76_hpw2_*.log`) | 4 (HMS Hood) | **11** (P.100 Ercole 5, Char 2C 6) |
| 57905 d230, the wheel | 0 (run 75) | 2 |
| 58905 d330, the wheel | 4 (run 75) | 8 |
| new 59905 d300, 59907 d300, the wheel | | 16, 7 |

- Run 75's build gives run 75's figures again (1, 0, 1; 34 against 36).
- `src/render/units/counters.ts` is unchanged since run 75, so the moves are the worlds' (R139). HEAD has 5 leaps where
  2 zooming, 11 where 55 running, and 13 where 4 by the wheel. No score moves on it.
- **Is it the code?** R125b's own commit (`32f1e5b7`, built into `critic/c76_r125bdist`) has run 75's sim. On run 75's
  worlds it gives 4 and 4 by the wheel on 56901 and 58905, as run 75's build does (`critic/c76_hpw_r125b_*.log`).
  Since then, `MapView` changed only for the time-lapse, the director and History's places. So the wheel's leaps come
  with HEAD's worlds, from the counters' rule as it was.
- **Why the score holds:** on the three seeds both builds ran, HEAD has 37 leaps in all (zoom 5, running 11, wheel 21)
  against 65 on run 75's build (2, 55, 8). The heroes leap more under the wheel and much less while the game runs.
- **R76-N6: in HEAD's world of 56901 two land heroes leap 11 times by the wheel.** P.100 Ercole and Char 2C leap 13 to
  42 px at a notch. Run 74's bar for R74-N1 was 4 or fewer there. The code is run 75's, so the rule leaves such a pair
  to leap wherever two land heroes stand close. The figure is the world's: it lowers no score, but it is named for the
  builder.
- **R125b on its own measure:** `markerPop 56951` has 0 leaps and 0 pops through the wheel and the glide across
  1,200 m/px, and 0 running at 1,800 and 1,150 m/px. The largest hero move in a frame is 5.1 to 6 px
  (`critic/c76_mp_head_56951.log`).
- **Every tier:** `z_zoom 59911` shows units drawn from 1,573 m/px (8,251) (`critic/c76_z_zoom.59911.log`); `c_battle
  59915` (an armoured fight at every tier).
- **Not 9:** as run 75. Hero names lie on counters at 6,000 m/px (ADR-1111); in
  `critic/shots/c75look_59901_1600x900_d400_2eur6000.png` "P.100 Ercole" covers a counter's number.

### Naval warfare: 8 → **8** (afresh)

**Evidence for 8:**
- **R75-N8 fixed (R136):** `seaBattlesLook` saw 53 of 53 battles on 58061 and 101 of 101 on 39061, both with exit 0 and
  0 page errors (`critic/c76_sbl_58061.log`, `critic/c76_sbl_39061.log`).
- **`landingFuzz --seeds 15 --first 59101`: 0 of 90** runs broken, `slowClick` included (`critic/c76_landingFuzz.log`).
- **Run 61's bulk sets (due), against run 75's, file by file** (`bash critic/scripts/c76_bulkcmp.sh`):
  - The 396 named landing setups: 278 the same line for line, 118 moved with the world.
  - The 153 stuck returns: all 153 the same.
  - The 168 next voyages: 140 the same.
  - The same four runs break a rule as in runs 75 and 74: 30041 3517 g1 of the setups (its one `slowClick`), and 30041,
    31157 and 31175 3517 g1 of the next voyages. No other run breaks one.
  - Files: `critic/c76_liab_named_cmp.txt`, `critic/c76_sr_cmp.txt`, `critic/c76_nv_cmp.txt`.
- **Malta's 18** (`c76_malta.sh` on HEAD's build): 12 thrown back near Catania and 6 broken off near Palermo, as run 75
  (`critic/c76_malta.log`).
- **`landingRows all`:** 115 cases, 20,321 hours, 0 broken (`critic/c76_lrows_all.log`).
- **Named `slowClick` cases:** 30041, 51101 and 53125 break it, and 27037 does not, as run 75 (`critic/c76_li_*.log`).
- **Sea battles headless:**
  - 58061: 53 battles in three years (run 75: 32).
  - 39061: 101 (65).
  - 59061 (new): 84.
  - The random world 58067: 71.
  - Files: `critic/c76_sb_*.log`.
- **A sea battle from the ticker:** `seaclick 58061` finds "⚓ Sea battle: Japan against Siam" on day 6.

**Not 9:** the named `slowClick` cases as before (ADR-914, non-blocking).

### Tanks: 8 → **8** (carried)

- `c_battle 59915` shows an armoured division's fight at every tier, 0 errors.
- `heroBattle 58081`: the P.100 in battle 161 of 360 days at war. `heroBattle 7019`: 102 of 924.
- `heroCeiling` on run 75's ten seeds: 68 of 113 lives at or above the top decile (0.60). Run 75 had 100 of 144 (0.69),
  and ADR-795 closed at 0.64. No hero file changed; the worlds did (per seed, 6 of 13 against 18 of 22 on 58181, and
  12 of 14 against 5 of 8 on 58183). Carried, and named here for the next full run.

### Aircraft: 8 → **8** (carried)

- `pl_planes 59925`: the wings' marks at 3,000, 1,200 and 600 m/px in both looks (42, 30, 12), as run 75
  (`critic/c76_pl_planes.59925.log`).
- A stopped bomber is now told (R133). The monthly air rows are in every History looked at.

### AI nuclear use: 8 → **8** (afresh)

**Evidence for 8:**
- **R75-N2 fixed (R133).** The row is in History, the ticker and a war's rows (`c76_interceptTold.ts`). It was seen in
  the editor's game, a day before Poland's strike on Berlin of 18 February.
- **Counts over 22 years** (`nukecount`; every launch a burst or a stopped bomber):
  - 58501: 7 launches, 1 stopped.
  - 58503: 0.
  - 58507: 5.
  - 55501: 1.
  - 55503: 2.
  - 55507: 24, 1 stopped.
  - 59501 (new): 0.
  - The worlds differ: run 75 had 37, 17, 0, 25, 2, 0. Files: `critic/c76_nc_*.log`.
- `nukeIntercepts 53501` has 0 launches on HEAD (run 75: 2).
- The detonations of the free starts: 1983 4, and 51505's 1983 2 (`critic/c76_free_*`).
- **God's strike on Paris on the page:** the alert, the charts of warheads, the dead and the land under fallout
  (`critic/c76_a_59917.json`).

- **On the page:** `an_ainuke 58505` on HEAD's year-13 world of 58505 has no strike in 400 days, where run 75's world had
  two (`critic/c76_an_58505y13.json`; the worlds differ). The AI's own strike seen on the page this run is the editor's
  Poland, which decided on Berlin itself, with the pause and the alert (`critic/c76_g_editor.58921.log`).

**Not 9:** the AI's strikes come in few years of few seeds (0 on three of seven seeds in 22 years). On the page this run
the only AI strike was in the editor's game.

## Blocking issues

### R76-B1: the `lift` rule (R139) is reported broken by its own checker (diplomacy)

- **The case:**
  - `npx tsx tools/diag/diploInvariants.ts 33501 scenario 1825` reports 2 broken:
    - "day 943: lift: LIT declared on GER over the sea, 0 men to lift for a room of 0";
    - "day 1415: lift: HUN declared on ITA over the sea, 0 men to lift for a room of 0".
  - `npx tsx tools/diag/diploInvariants.ts 58011 random 3650 --heroes` reports 3 broken: AEF on FRA (day 2251), NSP on
    SAU (2769), SOV on LEB (3591).
  - Logs: `critic/c76_diploinv_33501s.log`, `critic/c76_diploinv_58011rh_10y.log`.
  - The other 18 runs of this report: 0.
- **Traced:** `npx tsx critic/scripts/c76_evAround.ts 33501 942 944 LIT,GER` (`critic/c76_ev_33501_lit_ger.log`).
  - Lithuania's war is a puppet's revolt: `PuppetRevolt LIT GER` and `WarDeclared LIT GER` in hour 0 of day 943, by
    `puppets.ts`' `declareWar(world, n, o, true)`, which asks no lift.
  - Hungary's war on Italy (`critic/c76_ev_33501_hun_ita*.log`) has no revolt and no massing in the 95 days before it.
    Japan and France joined Hungary in the same hour.
  - `noLift` is asked only in `strategicAi`'s `firstNotOutnumbered`. It is not asked by `massing.ts`' declarations at a
    massing's end (lines 277 and 286), by the puppets' revolt, or where a war is begun otherwise. `war.ts`' two calls
    are `forceWar`, the player's and God's command, so they are not in a headless run. Hungary's door is the strategic AI
    or a massing's end. If it is the strategic AI, its overSea test (`!neighbours.includes(x) || !atHome(x)`) and the
    checker's (`neighbourMap` and `homeNeighbours`) disagree on whether Italy borders Hungary. Which of the two it was I
    did not find.
- **Why blocking:** the brief makes every rule a checker reports broken blocking, other than `slowClick`. The checker is
  the builder's own, written with the rule (ADR-1119).
- **Diplomacy still holds 8** with this issue in it: 5 declarations in 2 of 20 runs, while the same seeds' war openings
  improved (R75-N5). The issue blocks the release; it does not lower the score.
- **Seen fixed when** both commands print "0 broken". Either the rule is kept at the doors it misses, or the checker's
  scope is narrowed to the strategic AI's own choice with an ADR (a puppet's revolt is no choice of target). Also, the
  20 seeds of this report stay at 0.

## Non-blocking issues (prioritised)

1. **R76-N1 (UI; R142): the director takes the camera back from the player's click.**
   - **The case:** `node critic/scripts/c76_dirHand.mjs 59955 120`. A ticker row, a war banner and a History row's link
     each leave the director on, with 2, 1 and 2 cuts in the 9 s after.
   - **Seen fixed when** those three acts print `onLater: false`, or `cutsAfterAct: 0`.
2. **R76-N5 (diplomacy; R139): Japan's first wars 9,000 km away, on the same seeds.**
   - **The case:** `npx tsx critic/scripts/c76_firstdecl.ts 60 39821 39823 … 39839` and `… 55821 … 55839` give 2 of 50
      and 4 of 58 first-60-day declarations over 6,000 km. Run 75 had 0 of 53 and 0 of 59. The six are Japan on Iraq,
      Iran, Finland and Estonia.
   - **Seen fixed when** both print "over 6000 km" at 1 or fewer, as ADR-1041 left them.
3. **R132's bar not held on HEAD (UI):**
   - **The case:** `c76_bannerRank.mjs 57901 150` gives 59, 55, 63 and 48 quiet banner-days behind "+n"; R132's own
     build gives 33 and 36. On 58901: 72.
   - **Seen fixed when** three runs on HEAD are each under 50 (the user's bar), and under 44 for UI's 8.
4. **R76-N2 (stats, UI; R143b): the time-lapse is not the month it shows.**
   - **The tooltip and click:** `node critic/scripts/c76_tlMore.mjs cell 59943 700`. On a cell shown as Norway's
     (January 1938), the tooltip and the panel say "Soviet Union".
   - **Space:** `node critic/scripts/c76_timeLapse.mjs 59941 400 head` gives `ranUnderLapse` 96 (Space resumed the game
     under the plate). Escape does not close the plate.
   - **Seen fixed when** the tooltip names the owner of the month on show (or none), `ranUnderLapse` is 0, and Escape
     closes the plate.
5. **R76-N3 (UI; R142): the director flies under an open panel and counts it seen.**
   - **The case:** `PANEL=history node critic/scripts/c76_director.mjs 59951 100 head 120`: 53 of 56 "seen" under
     History. On a phone, 56 of 56.
   - **Seen fixed when** `seenCovered` is 0, the camera flying clear of the panel as R141's rows do.
6. **R76-N4 (stats): a save made before R143 gives a time-lapse of the months since its load,** under a title that says
   "from the start" (`c76_tlMore.mjs old critic/c75_seed7019_y20.bin 40`). A word on the plate would do.
7. **R76-N6 (semantic zoom): two land heroes leap 11 times by the wheel** in HEAD's world of 56901.
   - **The case:** `WHEEL=1 node critic/scripts/c76_heroPop.mjs 56901 430 head`, and `58905 330`, `59905 300`, `59907 300`:
     11, 8, 16 and 7. Run 75's build and R125b's give 4 and 4 on their own worlds.
   - **Seen fixed when** each gives 4 or fewer.
8. **On a phone the time-lapse's plate covers the ticker's second row**
   (`critic/shots/c76tl_head_59945_390x844_8mid.png`).
9. **A massing told again 50 days after its call-off** (56211, Britain on Mozambique, day 814).
10. **Small worlds:** 54425, 54426, 55424, 59421, 59423 (two nations) and 55404 (three) have no war in ten years.
11. **`slowClick` (ADR-914):** 0 of 90 on new seeds; the named cases as run 75.
12. **Small things:**
    - Rows of History that are a bare place name ("Northern Malaya", "Hong Kong").
    - The war-to-the-death title is on hover only, so a phone never sees it.
    - Run 75's phone nits stand: no ticker while the banners are opened; "Scroll" and "Click" in the first cue; Settings'
      button to the title asks nothing.

## Run 75's cases re-run

| Run 75 case | Run 75 (`e830930e`) | Run 76 (`c2440872`) | Evidence |
|---|---|---|---|
| R75-N1 `bannerFlip 57901 150`, `58901 200` | 41, 29 changes; 18, 19 under the cursor | **fixed**: 4, 4; 2, 0 (run 75's build beside it: 41, 27; 22, 17) | `critic/c76_bf_*.log` |
| `bannerRank 57901 150` | 0 of 440 | 59, 55, 63, 48 (R132's build: 33, 36) | `critic/c76_br_*.log` |
| R75-N2 `interceptTold` | false, false, strings 0 | **fixed**: true, true, 2 | `critic/c76_interceptTold.log` |
| R75-N2 `g_editor 58921` | two decisions, one strike, no word | "Poland's bomber … stopped short … near Berlin: no burst" | `critic/c76_g_editor.58921.log` |
| R75-N3 `massTold` 58617… | "CALLED OFF BUT AT WAR" once | **fixed**: 0 on 15 seeds | `critic/c76_massTold_*.log` |
| R75-N5 wars with no cell at day 30 (58211…) | 20 of 103 | **fixed**: 3 of 96 | `critic/c76_warOpening.json` |
| R75-N6 a war at ±100 says why | nothing | **fixed**: the title says who fights to the death | `critic/c76_dt_7019.log` |
| R75-N8 `seaBattlesLook 58061` | 31 of 32, exit 1 | **fixed**: 53 of 53, exit 0 | `critic/c76_sbl_58061.log` |
| `seaBattlesLook 39061` | 65 of 65 | 101 of 101 | `critic/c76_sbl_39061.log` |
| Objection to ADR-1110: `markers 58951` at 1,150 m/px | 21, 21 pairs | **answered** (R125b): 10, 14 (run 75's build: 21, 21) | `critic/c76_mk_*n_desk.log` |
| `markers 56951` 1,800 / 1,200 m/px | 3, 10, 12; 1, 3, 7 | 3, 10, 12; 1, 3, 7 | `critic/c76_mk_head_desk.log` |
| `heroPop` 56901, 57905, 58905 (zoom; running) | 1, 0, 1; 36, 4, 17 | 3, 1, 1; 3, 8, 0 (the worlds differ; run 75's build: 1, 0, 1; 34, 4, 17) | `critic/c76_hpz_*.log` |
| `markerPop 56951` | 0 leaps | 0 leaps | `critic/c76_mp_head_56951.log` |
| Hammerfest twice after a God peace | twice | once (R137) | `critic/shots/c76gp_1942_GER_SovietUnion_390x844_2history.png` |
| diploInvariants and worldInvariants, run 75's seeds | 0 | 0 but 33501 (2) and 58011 (3): R76-B1 | `critic/c76_diploinv_*.log` |
| `landingRows all` | 115 cases, 0 broken | the same | `critic/c76_lrows_all.log` |
| `slowClick` named four | 3 broken, 27037 0 | the same | `critic/c76_li_*.log` |
| Run 61's 717 bulk runs | 4 broken, all `slowClick` | 571 of 717 the same line for line (146 moved with the world); the same 4 runs broken | `critic/c76_*_cmp.txt` |
| Malta's 18 | 12 thrown back, 6 broke off | 12 thrown back, 6 broke off | `critic/c76_malta.log` |
| `few2 55421`, `54421`; `few3 55401`, `53401`; `few60` | 5, 4 of 6; 4, 6 of 6; 91 wars | the same first-war days; war counts moved by one on 54424 (2, was 1) and 53406 (5, was 6); 90 wars | `critic/c76_few*.log` |
| `firstdecl` 39821…, 55821… | 0 of 53, 0 of 59 over 6,000 km | **2 of 50, 4 of 58** (R76-N5) | `critic/c76_firstdecl*.log` |
| `farConquests 0` (ten seeds); `piles`; `pileSides 51` | 109 far capitals; none over 4:1 | 76; none over 4:1 | `critic/c76_farc_*.log`, `critic/c76_piles_*.log` |
| `afterTrack 55601`, `37601` | 533 days; 0 | 0; 0 (the worlds differ; 203 and 219 wars against 230 and 239) | `critic/c76_atx_*.log` |
| `topArea 58097` | 4 changes | 7 | `critic/c76_toparea_58097.log` |
| `nukecount` six seeds | 37, 17, 0, 25, 2, 0 | 7, 0, 5, 1, 2, 24 | `critic/c76_nc_*.log` |
| `heroCeiling` 58181–58190 | 100 of 144 (0.69) | 68 of 113 (0.60) | `critic/c76_heroCeiling3_*.log` |
| `workerDeterminism` 54059, 58059 | one hash each | one hash each | `critic/c76_wd_*.log` |
| `capsurvey`, `heroPlace`, `warlong`, `freewar`, `free`, `blocend`, `heldfree`, `clampend`, `saveload 1942` | as before | the same kinds of lines, 0 broken | `critic/c76_*.log` |
| `godpeace`, `god42`, `undo2`, `undo2y`, `heropanel`, `takescore`, `bannerOwn` | as before | the same | `critic/c76_*.log` |
| 7019, 32019 twenty years | `068f1066`, `a75df50c` | `4931216a`, `deec2aee` (73, 77 nations) | `critic/c76_seed*_save.log` |
| Tick seed 99; frames on 7019 year 20 | 1.858 ms; 59.2–60.2 fps | 1.827 ms (pin `1aabdc7e`); 59.6–60.1 fps, worst 123 ms | `critic/c76_tick99.log`, `critic/c76_pf_lookfps.log` |

## Design objections (none blocking, no score lowered)

- **ADR-1114 (the user's decision): the row held 20 days.** It cures the churn. But on HEAD's 57901 a war with a battle
  waits behind "+n" on 48 to 63 banner-days of 440 while a quiet one keeps its slot. A mark for a fought war on the
  banner itself, as Hearts of Iron does, would show both.
- **SPEC's time-lapse with no nations' names.** With the names off and the tooltip of now, a watcher cannot read who
  held what in 1938. Names drawn from the record's month (or none, and a tooltip of that month) would answer it.
- **ADR-1111, ADR-1060, heroes on by default:** as run 75; not measured again.

## Ideas from other games (not scored)

- **Ages of Conflict's time-lapse** shows the year large over the map. Here the month is a small label on the plate,
  away from the map's middle.
- **Paradox's "follow" camera** (Hearts of Iron's news events) ends at the first click of any kind, a ticker row among
  them.
- **Hearts of Iron IV** keeps a war's place while it lasts and marks the fought one with a sword: a battle shown on the
  banner and not by its place.

## Strengths (verified)

- **Run 75's findings are mended on their own probes, with both builds side by side.**
  - The banners changed places 4 times in a minute where 41, and 0 places were held under two seconds where 74.
  - The stopped bomber has its words.
  - No massing is called off at war with its target.
  - Wars with nothing taken in a month fell from 19 % to 3 % on the same seeds.
  - The sea-battle look sees 53 of 53.
- **A History row now goes where it happened, on both sizes, clear of the panel:** 11 kinds, 22 clicks, every place on
  the map's canvas.
- **The time-lapse is exact:**
  - Four months of a new seed, none of them a January, match the game's own map cell for cell, after a mid-month save
    and load.
  - It plays at 60 fps.
  - A 1975 replay plays from 1938.
